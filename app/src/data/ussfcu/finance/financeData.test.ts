/**
 * USSFCU Finance persona (Fiona) — the build matches the spec, word for word
 * and figure for figure.
 *
 * specV2.fixture.json is extracted mechanically from
 * USSFCU_Finance_Persona_Demo_Spec_v2.md (§1 tags, §6 signals, §7 KPIs, §10
 * seven turns, §11 prompts), so these assertions compare the build with the
 * spec's own text rather than with a retyped copy. The consistency checks
 * then pin every figure the prose quotes to the constant the visuals draw.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import spec from './specV2.fixture.json';
import chatFlows from './chatFlows.json';
import signals from './signals.json';
import capabilityCallouts from './capabilityCallouts.json';
import dataSources from './dataSources.json';
import currentState from './currentState.json';
import journey from './journey.json';
import * as layer from './index';
import { financeKpiTiles } from './kpiTiles';
import manifestModule from '@/markets/financial-services/clients/ussfcu/personas/finance/manifest';
import type { PersonaManifest } from '@core/types';
import {
  DEMO_TODAY,
  FINANCE_QUESTIONS,
  FINANCE_CHIPS,
  SUGGESTED_PROMPTS,
  KPIS,
  PUBLIC_BACKDROP,
  NET_WORTH_M,
  DQ_QUARTERS,
  DQ_SEGMENTS,
  HIL_PARAMETER_PCT,
  PORTFOLIO_LIMITS,
  MORTGAGE_GROWTH_PER_QUARTER_M,
  QUARTERS_TO_CAP,
  NEAR_LIMIT_POINTS,
  pctOfNetWorth,
  capUsePct,
  headroomM,
  SHUTDOWN,
  CUSHION,
  CAPITAL_RECONCILIATION,
  NW_EARLY_WARNING_PCT,
  FUNDING_REVIEW_TRIGGER_LTS_PCT,
  PLAYBOOK,
  SEG_GROUPS,
  SEG_OUTFLOW_TRIGGER_PCT,
  SEG_A_OUTFLOW_MIX,
  segChangePct,
  segTotals,
  LOAN_GROWTH_YTD_PCT,
  SHARE_GROWTH_YTD_PCT,
} from './constants';

type Flow = { user_query?: string; ai_message?: string; ai_response?: string; suggested_chips?: string[]; data_sources_used?: string[]; capability?: string };
const flows = chatFlows as Record<string, Flow>;
const manifest = manifestModule as unknown as PersonaManifest;
const P = 'ussfcu_finance_';
const STEP_KEYS = [
  `${P}greeting`,
  `${P}turn_delinquency`,
  `${P}turn_limits`,
  `${P}turn_shutdown`,
  `${P}turn_cushion`,
  `${P}turn_playbook`,
  `${P}turn_seg_deposits`,
];
const text = (f: Flow) => f.ai_message ?? f.ai_response ?? '';
const LAST = DQ_QUARTERS.length - 1;

/**
 * The spec's follow-up label, with the talk track's CLICK wording where the
 * two differ. The spec offers "Show deposit activity by SEG" at Steps 4–6; the
 * talk track clicks "Show deposit activity by SEG group", and the talk track
 * is the source of truth for the demo.
 */
const TALK_TRACK_WORDING: Record<string, string> = {
  'Show deposit activity by SEG': FINANCE_CHIPS.segDeposits,
};

describe('§10 — the seven scripted turns', () => {
  it('has exactly seven steps in the spec and seven flows here, in order', () => {
    expect(spec.steps.map((s) => s.step)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const key of STEP_KEYS) expect(flows[key], key).toBeDefined();
  });

  it.each(spec.steps.map((s, i) => [s.step, s.title, i] as const))('Step %i (%s): AI text is verbatim', (_n, _t, i) => {
    expect(text(flows[STEP_KEYS[i]])).toBe(spec.steps[i].ai);
  });

  it.each(spec.steps.slice(1).map((s, i) => [s.step, s.title, i + 1] as const))('Step %i (%s): the user question is verbatim', (_n, _t, i) => {
    expect(flows[STEP_KEYS[i]].user_query).toBe(spec.steps[i].user);
  });

  it('Step 1 is the login briefing, with no user question', () => {
    expect(spec.steps[0].user).toBe('(Login, no prompt)');
    expect(flows[STEP_KEYS[0]].user_query).toBeUndefined();
  });

  it.each(spec.steps.map((s, i) => [s.step, s.capability, i] as const))('Step %i carries the %s tag', (_n, capability, i) => {
    expect(flows[STEP_KEYS[i]].capability).toBe(capability);
  });

  it.each(spec.steps.map((s, i) => [s.step, s.sources, i] as const))('Step %i names the spec’s data sources: %s', (_n, sources, i) => {
    expect(flows[STEP_KEYS[i]].data_sources_used!.join(', ')).toBe(sources);
  });

  it.each(spec.steps.map((s, i) => [s.step, i] as const))('Step %i offers the spec’s follow-up options, in order', (_n, i) => {
    const expected = spec.steps[i].followUps.map((c) => TALK_TRACK_WORDING[c] ?? c);
    expect(flows[STEP_KEYS[i]].suggested_chips).toEqual(expected);
  });

  it('keeps the spec’s full questions in constants.ts, identical to the flows', () => {
    const keys = ['delinquency', 'limits', 'shutdown', 'cushion', 'playbook', 'segDeposits'] as const;
    keys.forEach((k, i) => expect(FINANCE_QUESTIONS[k]).toBe(spec.steps[i + 1].user));
  });
});

describe('§1 — capability tags', () => {
  it('demonstrates all six tags, and the persona lists all six', () => {
    const used = new Set(spec.steps.map((s) => s.capability));
    expect(used.size).toBe(6);
    expect(new Set(manifest.capabilities)).toEqual(new Set(spec.tags.map((t) => t.tag)));
  });

  it('every callout carries the spec’s §1 description for its tag, verbatim', () => {
    const byTag = Object.fromEntries(spec.tags.map((t) => [t.tag, t.text]));
    for (const c of capabilityCallouts) expect(c.description, c.trigger).toBe(byTag[c.capabilityName]);
  });

  it('tags every scripted answer, so every response carries a clickable tag', () => {
    for (const [key, flow] of Object.entries(flows)) {
      if (key.startsWith('__')) continue;
      expect(flow.capability, key).toBeTruthy();
      expect(manifest.ui.flowKeyToCapabilityTrigger[key], key).toBeDefined();
    }
  });
});

describe('§6 — priority signal cards', () => {
  it.each(spec.signals.map((s, i) => [s.Signal, i] as const))('"%s" matches the spec field for field', (_title, i) => {
    const want = spec.signals[i];
    const got = signals[i] as Record<string, unknown>;
    expect(got.title).toBe(want.Signal);
    expect(got.severity).toBe(want.Severity);
    expect(got.bucket).toBe(want.Bucket);
    expect(got.description).toBe(want.Description);
    expect(got.source).toBe(want['Data Source']);
    expect(got.action).toBe(want.Action);
  });

  it('is exactly three cards: one critical, two warning, all from the spec date', () => {
    expect(signals.map((s) => s.severity)).toEqual(['critical', 'warning', 'warning']);
    for (const s of signals) expect(s.timestamp.startsWith(DEMO_TODAY)).toBe(true);
  });
});

describe('§7 — dashboard KPIs', () => {
  it('has the spec’s eight KPIs in its order', () => {
    expect(KPIS.map((k) => k.name)).toEqual(spec.kpis.map((k) => k.kpi));
  });

  it.each(spec.kpis.map((k, i) => [k.kpi, i] as const))('%s: value, trend, target, source and calculation are verbatim', (_name, i) => {
    const want = spec.kpis[i];
    const got = KPIS[i];
    const marker = got.illustrative ? ' (illustrative)' : ' (public backdrop)';
    expect(`${got.value}${marker}`).toBe(want.value);
    expect(got.trend).toBe(want.trend);
    expect(got.target).toBe(want.target);
    expect(got.source).toBe(want.source);
    expect(got.calc).toBe(want.calc);
  });

  it('renders all eight as briefing tiles, each opening a turn', () => {
    expect(manifest.ui.stats.map((s) => (s as { fullName?: string }).fullName)).toEqual(spec.kpis.map((k) => k.kpi));
    for (const s of manifest.ui.stats) expect(manifest.flows.chipToFlowKey[s.chipText!], s.id).toBeDefined();
  });
});

describe('§11 — suggested query prompts', () => {
  it('are the spec’s five prompts, verbatim, as the persona’s suggested prompts, each routed', () => {
    expect([...SUGGESTED_PROMPTS]).toEqual(spec.prompts);
    expect(manifest.ui.initialChips).toEqual(spec.prompts);
    for (const p of spec.prompts) expect(manifest.flows.chipToFlowKey[p], p).toBeDefined();
  });
});

describe('the figures reconcile — prose, tiles and visuals', () => {
  it('net worth is 7.50% of $1.53B', () => {
    expect(NET_WORTH_M).toBeCloseTo(114.75, 5);
    expect(PUBLIC_BACKDROP.netWorthRatioPct).toBe(7.5);
  });

  it('Step 2: HIL 1.8% now, 1.1% two quarters ago, past 1.5%; first mortgage 0.4% and HELOC 0.6% steady', () => {
    const [hil, fm, heloc] = ['hil', 'first_mortgage', 'heloc'].map((id) => DQ_SEGMENTS.find((s) => s.id === id)!);
    expect(DQ_QUARTERS).toHaveLength(8);
    expect(hil.series[LAST]).toBe(1.8);
    expect(hil.series[LAST - 2]).toBe(1.1);
    expect(HIL_PARAMETER_PCT).toBe(1.5);
    expect(new Set(fm.series)).toEqual(new Set([0.4]));
    expect(new Set(heloc.series)).toEqual(new Set([0.6]));
    // "the only pool trending outside tolerance"
    expect(DQ_SEGMENTS.filter((s) => s.series[LAST] > HIL_PARAMETER_PCT).map((s) => s.id)).toEqual(['hil']);
    // "Most segments are flat or improving. One is not."
    expect(DQ_SEGMENTS.filter((s) => s.series[LAST] > s.series[0]).map((s) => s.id)).toEqual(['hil']);
    for (const s of DQ_SEGMENTS) expect(s.series).toHaveLength(8);
  });

  it('Step 3: first mortgage $655M is 571% of net worth, about $33M under the 600% cap, cap in ~2 quarters, no other within 15 points', () => {
    const fm = PORTFOLIO_LIMITS.find((p) => p.id === 'first_mortgage')!;
    expect(fm.balanceM).toBe(655);
    expect(fm.capPctOfNw).toBe(600);
    expect(Math.round(pctOfNetWorth(fm.balanceM))).toBe(571);
    expect(Math.floor(headroomM(fm.balanceM, fm.capPctOfNw))).toBe(33);
    expect(MORTGAGE_GROWTH_PER_QUARTER_M * QUARTERS_TO_CAP).toBeGreaterThanOrEqual(headroomM(fm.balanceM, fm.capPctOfNw));
    expect(MORTGAGE_GROWTH_PER_QUARTER_M * (QUARTERS_TO_CAP - 1)).toBeLessThan(headroomM(fm.balanceM, fm.capPctOfNw));
    expect(capUsePct(fm.balanceM, fm.capPctOfNw)).toBeGreaterThanOrEqual(100 - NEAR_LIMIT_POINTS);
    for (const p of PORTFOLIO_LIMITS.filter((x) => x.id !== 'first_mortgage'))
      expect(capUsePct(p.balanceM, p.capPctOfNw), p.id).toBeLessThan(100 - NEAR_LIMIT_POINTS);
  });

  it('Step 4: a 30-day shutdown, 18% draw down, 6% delay, +$4.2M over two quarters, led by HIL', () => {
    expect(SHUTDOWN.days).toBe(30);
    expect(SHUTDOWN.depositDrawdownPct).toBe(18);
    expect(SHUTDOWN.paymentDelayPct).toBe(6);
    expect(SHUTDOWN.lossOverTwoQuartersM).toBe(4.2);
    const rise = SHUTDOWN.projectedDq.map((s) => s.afterPct - s.beforePct);
    expect(SHUTDOWN.projectedDq[0].id).toBe('hil');
    expect(Math.max(...rise)).toBe(rise[0]);
    // Today's column is Step 2's latest quarter.
    for (const s of SHUTDOWN.projectedDq) expect(s.beforePct).toBe(DQ_SEGMENTS.find((d) => d.id === s.id)!.series[LAST]);
  });

  it('Step 5: net worth 7.50% → about 7.2%, still above 7.0%; $35M to spare; loan-to-share 84% toward, not past, the trigger', () => {
    expect(CUSHION.before.nwRatioPct).toBe(7.5);
    expect(CUSHION.after.nwRatioPct).toBe(7.2);
    expect(CUSHION.after.nwRatioPct).toBeGreaterThan(NW_EARLY_WARNING_PCT);
    expect(CUSHION.after.liquiditySurplusM).toBe(35);
    expect(CUSHION.before.ltsPct).toBe(84);
    expect(CUSHION.after.ltsPct).toBeGreaterThan(CUSHION.before.ltsPct);
    expect(CUSHION.after.ltsPct).toBeLessThan(FUNDING_REVIEW_TRIGGER_LTS_PCT);
    // Reconciled across the core, the ledger and the ALM model: one number.
    expect(CAPITAL_RECONCILIATION).toHaveLength(3);
    expect(new Set(CAPITAL_RECONCILIATION.map((r) => r.netWorthM))).toEqual(new Set([NET_WORTH_M]));
  });

  it('Step 6: the playbook table carries every action the answer reads, and highlights the short band for 30 days', () => {
    const answer = text(flows[`${P}turn_playbook`]).toLowerCase();
    for (const band of PLAYBOOK.bands) for (const a of band.actions) {
      const core = a.toLowerCase().replace(/^pause /, 'a pause on ');
      expect(answer, a).toContain(core);
    }
    expect(PLAYBOOK.bands.filter((b) => b.recommended).map((b) => b.id)).toEqual(['short']);
  });

  it('Step 7: total +0.6%, two payroll groups down, one −4.2% past the 3% trigger, mostly certificate closures', () => {
    expect(segTotals().changePct.toFixed(1)).toBe('0.6');
    const down = SEG_GROUPS.filter((g) => segChangePct(g) < 0);
    expect(down).toHaveLength(2);
    const flagged = SEG_GROUPS.filter((g) => segChangePct(g) <= -SEG_OUTFLOW_TRIGGER_PCT);
    expect(flagged).toHaveLength(1);
    expect(segChangePct(flagged[0]).toFixed(1)).toBe('-4.2');
    expect(SEG_OUTFLOW_TRIGGER_PCT).toBe(3);
    const outflow = flagged[0].lastM - flagged[0].thisM;
    expect(SEG_A_OUTFLOW_MIX.certificateClosuresM + SEG_A_OUTFLOW_MIX.otherM).toBeCloseTo(outflow, 5);
    expect(SEG_A_OUTFLOW_MIX.certificateClosuresM / outflow).toBeGreaterThan(0.5);
  });

  it('KPI tiles agree with the figures the turns use', () => {
    const v = Object.fromEntries(KPIS.map((k) => [k.id, k.value]));
    expect(v.net_worth).toBe(`${CUSHION.before.nwRatioPct.toFixed(2)}%`);
    expect(v.loan_to_share).toBe(`${CUSHION.before.ltsPct}%`);
    expect(v.first_mortgage_nw).toBe(`${Math.round(pctOfNetWorth(655))}%`);
    expect(v.hil_dq).toBe(`${DQ_SEGMENTS[0].series[LAST]}%`);
    expect(v.loan_growth).toBe(`${LOAN_GROWTH_YTD_PCT}%`);
    expect(v.share_growth).toBe(`${SHARE_GROWTH_YTD_PCT}%`);
    expect(v.shutdown_liquidity).toBe(`About $${CUSHION.after.liquiditySurplusM}M surplus`);
    expect(v.seg_deposits).toBe(`Plus ${segTotals().changePct.toFixed(1)}% overall; one group off ${Math.abs(segChangePct(SEG_GROUPS[0])).toFixed(1)}%`);
  });

  it('the follow-up answers quote only figures the scripted turns already state', () => {
    const scripted = STEP_KEYS.map((k) => text(flows[k])).join(' ') + spec.signals.map((s) => s.Description).join(' ');
    const figure = /\$?\d[\d,.]*%?M?/g;
    for (const [key, flow] of Object.entries(flows)) {
      if (!key.includes('_followup_')) continue;
      for (const f of text(flow).match(figure) ?? []) expect(scripted, `${key} quotes "${f}"`).toContain(f.replace(/[.,]$/, ''));
    }
  });
});

describe('§8 and §9 — the current state and the journey', () => {
  it('has every §8 process step, in order, with the four pain points in red', () => {
    expect(currentState.steps.map((st) => [st.id, st.label])).toEqual(spec.currentStateSteps);
    expect(currentState.steps.filter((st) => st.state === 'gap').map((st) => st.id)).toEqual(['B', 'E', 'G', 'H']);
  });

  it('has the five §8 interventions verbatim', () => {
    expect(currentState.interventions.map(({ currentStep, intervention, capability, impact }) => ({ currentStep, intervention, capability, impact }))).toEqual(spec.interventions);
  });

  it('has the four §9 phases verbatim, and the traceability table', () => {
    journey.phases.forEach((ph, i) => {
      const want = spec.phases[i] as Record<string, string | number>;
      expect(ph.name).toBe(want.name);
      expect(ph.touchpoints.join(', ')).toBe(want.Touchpoints);
      expect(ph.action).toBe(want.Actions);
      expect(`"${ph.thought}"`).toBe(want.Thoughts);
      expect(String(ph.emotion)).toBe(want.Emotion);
      expect(ph.painPoints.join('; ')).toBe(want['Pain points']);
      expect(ph.opportunity).toBe(want.Opportunities);
    });
    expect(journey.baselineSatisfaction).toBe(4);
    expect(journey.traceability.map(({ phase, painPoint, signal, demoStep }) => ({ phase, painPoint, signal, demoStep }))).toEqual(spec.traceability);
  });
});

describe('§12 — the data layer returns the spec’s interfaces', () => {
  it('Signal: title, severity, bucket, description, source, action', () => {
    for (const s of layer.getSignals()) for (const k of ['title', 'severity', 'bucket', 'description', 'source', 'action']) expect(s, k).toHaveProperty(k);
  });
  it('Kpi, PortfolioLimit, ShockScenario, CapitalLiquidity, PlaybookAction, SegDeposit', () => {
    for (const k of layer.getKpis()) for (const f of ['name', 'value', 'illustrative', 'trend', 'target', 'source', 'calc']) expect(k, f).toHaveProperty(f);
    for (const p of layer.getPortfolioLimits()) for (const f of ['portfolio', 'balance', 'pctOfNetWorth', 'cap', 'headroom']) expect(p, f).toHaveProperty(f);
    const sh = layer.getShockScenario();
    for (const f of ['scenario', 'membersAffectedPct', 'depositDrawdownPct', 'delinquencyBySegment', 'lossOverTwoQuarters', 'netWorthAfter']) expect(sh, f).toHaveProperty(f);
    const cl = layer.getCapitalLiquidity();
    for (const f of ['netWorthBefore', 'netWorthAfter', 'liquiditySurplus', 'loanToShareBefore', 'loanToShareAfter', 'trigger']) expect(cl, f).toHaveProperty(f);
    for (const a of layer.getPlaybookActions()) for (const f of ['band', 'action', 'recommendedFlag']) expect(a, f).toHaveProperty(f);
    for (const d of layer.getSegDeposits()) for (const f of ['seg', 'amount', 'count', 'momChange', 'triggered']) expect(d, f).toHaveProperty(f);
  });
  it('agrees with the spoken figures', () => {
    expect(layer.getShockScenario().netWorthAfter).toBe(7.2);
    expect(layer.getCapitalLiquidity().liquiditySurplus).toBe(35);
    expect(layer.getPlaybookActions()).toHaveLength(5);
    expect(layer.getSegDeposits().filter((d) => d.triggered)).toHaveLength(1);
  });
});

describe('the briefing’s shorter wording says nothing the spec does not', () => {
  const figures = (t: string) => (t.match(/\$?\d[\d,.]*%?M?/g) ?? []).map((f) => f.replace(/[.,]$/, ''));
  it.each(signals.map((s) => [s.title, s] as const))('"%s" card summary quotes only its own spec figures', (_t, s) => {
    for (const f of figures(s.summary)) expect(s.description, f).toContain(f);
    expect(s.summary.length).toBeLessThan(s.description.length);
    expect(s.actionShort.length).toBeLessThan(s.action.length);
  });
  it('KPI tiles quote only their own spec figures', () => {
    for (const t of financeKpiTiles()) {
      const full = `${t.fullValue} ${t.fullTarget}`.replace('Plus ', '+').replace('off ', '−');
      for (const f of figures(`${t.value} ${t.target}`)) expect(full, `${t.id}: ${f}`).toContain(f.replace('~', ''));
    }
  });
});

describe('only the new spec — the earlier narrative is gone', () => {
  const ROOTS = [
    'src/data/ussfcu/finance',
    'src/components/ussfcu/finance',
    'src/markets/financial-services/clients/ussfcu/personas/finance',
  ];
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? files(p) : [p];
    });
  const own = ROOTS.flatMap((r) => files(r)).filter((f) => !f.endsWith('.test.ts') && !f.endsWith('.test.jsx') && !f.endsWith('.fixture.json'));

  it.each([
    'indirect auto',
    'indirect_auto',
    'rate shock',
    'basis point',
    'MeridianLink',
    'Investment Portfolio Accounting',
    'plus 100',
  ])('no Fiona file mentions "%s"', (phrase) => {
    for (const f of own) expect(readFileSync(f, 'utf8').toLowerCase().includes(phrase.toLowerCase()), `${f} mentions "${phrase}"`).toBe(false);
  });

  it('lists only the spec’s systems as data sources', () => {
    expect(dataSources.map((d) => d.name)).toEqual([
      'Jack Henry Symitar',
      'UST Finex',
      'General Ledger',
      'Cornerstone',
      'Greenplum on Tanzu',
      'Tableau',
      'Board risk-tolerance limits and playbooks',
    ]);
  });
});
