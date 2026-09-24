/**
 * USSFCU Finance Team — tests of the story, not of the code.
 *
 * The narrative ("Finance Persona: Demo Narrative for Validation", prepared
 * for Lauren) is a CFO's walk: one segment drifting, one portfolio near its
 * board cap, a rate shock, the cushion under it, the playbook, the funding
 * side. A CEO or CFO in the room will check whether 571% of net worth really
 * is $655M, whether $33M is the headroom to 600%, whether +0.6% is what the
 * SEG table adds up to. So every figure the chat prose, a signal card or a
 * visual quotes is recomputed here from constants.ts, and the six questions
 * and answers are pinned to the narrative's exact wording — the presenter
 * reads from that document, and a paraphrase on screen would contradict it.
 */
import { describe, it, expect } from 'vitest';

import chatFlows from './chatFlows.json';
import signals from './signals.json';
import dataSources from './dataSources.json';
import {
  DEMO_TODAY,
  PUBLIC_FACTS,
  NET_WORTH_M,
  NET_LOANS_M,
  MEMBER_SHARES_M,
  LOAN_MIX,
  DQ_QUARTERS,
  DQ_SEGMENTS,
  INDIRECT_AUTO_VINTAGE,
  blendedIndirectAutoDq,
  CONCENTRATION_LIMITS,
  MORTGAGE_GROWTH_PER_QUARTER_M,
  pctOfNetWorth,
  capUsePct,
  capDollarsM,
  headroomM,
  NW_EARLY_WARNING_PCT,
  RATE_SHOCKS,
  FUNDING_REVIEW_TRIGGER_LTS_PCT,
  LIQUIDITY,
  liquiditySpareM,
  STRESS,
  PLUS100_SHARES_M,
  PLAYBOOK,
  SEG_OUTFLOW_TRIGGER_PCT,
  SEG_GROUPS,
  SEG_A_OUTFLOW_MIX,
  segChangePct,
  segTotals,
} from './constants';

type Flow = { user_query?: string; ai_message?: string; ai_response?: string; data_sources_used?: string[] };
const flows = chatFlows as Record<string, Flow>;
const P = 'ussfcu_finance_';

/** The narrative's six questions and answers, exactly as written. */
const SPEC_QA: Array<[flowKey: string, question: string, answer: string]> = [
  [
    `${P}turn_delinquency`,
    'Show delinquency trends by loan segment, and flag any pool trending up or outside our aligned parameters.',
    'Most segments are flat or improving. One is not. Indirect auto 60-day delinquency is 1.8%, up from 1.1% two quarters ago and now above your 1.5% aligned parameter. First mortgage and HELOC are steady at 0.4% and 0.6%. The rise is concentrated in loans originated in the last 18 months. Indirect auto is the pool to watch; everything else sits inside tolerance.',
  ],
  [
    `${P}turn_limits`,
    'Which portfolios are approaching our board risk-tolerance limits, such as mortgages capped at 600% of net worth?',
    'One portfolio is close. First mortgage is at $655M, which is 571% of net worth against your 600% board cap, so about $33M of headroom before the limit. No other portfolio is within fifteen points of its limit. At the current pace of first-mortgage growth, you reach the cap in roughly two quarters.',
  ],
  [
    `${P}turn_rate_shock`,
    'Model a rate shock of plus or minus 25, 50, and 100 basis points. What happens to our portfolio?',
    'Modeled across the balance sheet: a plus 100 basis-point shock lifts loan income but compresses net interest margin as deposits reprice faster, and marks the investment portfolio down about $18M. A minus 100 move does the reverse. At plus or minus 25 and 50 the effects are proportional and stay inside policy limits. Plus 100 is where net worth dips toward the 7.0% early-warning line.',
  ],
  [
    `${P}turn_dry_powder`,
    'For that scenario, do we have enough dry powder? What happens to our capital ratios and liquidity?',
    'Under the plus 100 basis-point scenario your net worth ratio moves from 7.50% to about 7.1%, still well capitalized, and on-hand liquidity covers projected outflows for the quarter with roughly $40M to spare. The pressure point is loan-to-share: it climbs from 84% to 88%, which is where your funding review is triggered. You have dry powder, but the scenario narrows it.',
  ],
  [
    `${P}turn_playbook`,
    'For each rate move, what is the pre-set playbook action, for example at a quarter point versus a half point?',
    'Your board playbook maps an action to each increment. At plus 25: hold deposit rates and monitor. At plus 50: selectively raise certificate rates on the 12- and 18-month terms to defend balances. At plus 100: launch the deposit-gathering campaign and slow indirect-auto funding to protect the margin and the mortgage concentration. Each action is pulled as written in the approved playbook, so this is a decision, not a rebuild.',
  ],
  [
    `${P}turn_seg_deposits`,
    'Show deposit activity by SEG group, and trigger an alert if more than a set percentage leaves.',
    'Deposit activity by core SEG this month: total balances are up 0.6%, but two payroll groups are trending down. One is off 4.2% versus last month, which crosses your 3% outflow trigger, so it is flagged. The movement is mostly certificate closures chasing a competitor promotional rate rather than full attrition. Net, funding is stable, with one group to address before it compounds.',
  ],
];

/** The narrative's three opening signals, exactly as written. */
const SPEC_SIGNALS: Array<[title: string, badge: string, description: string]> = [
  [
    'Delinquency drifting in one segment',
    'ACT NOW',
    'Indirect auto 60-day delinquency has reached 1.8%, up from 1.1% two quarters ago and now past the 1.5% aligned parameter. It is the only pool trending outside tolerance.',
  ],
  [
    'A portfolio nearing a board limit',
    'WATCH',
    'The first-mortgage portfolio is at 571% of net worth ($655M against the 600% board cap), the closest any portfolio has come to a risk-tolerance limit this year.',
  ],
  [
    'Rate and liquidity pressure building',
    'WATCH',
    'Loan-to-share is 84%, a five-year high. On the current path, a plus 100 basis-point move is where liquidity and net worth start to tighten in Q4.',
  ],
];

const round = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d;
const answer = (key: string) => flows[key].ai_response ?? '';

describe('USSFCU Finance — the narrative, word for word', () => {
  it.each(SPEC_QA)('%s asks and answers exactly as the narrative does', (key, question, text) => {
    expect(flows[key].user_query).toBe(question);
    expect(flows[key].ai_response).toBe(text);
  });

  it('opens on the three signals, in order, with their severity badges and wording', () => {
    expect(signals.map((s) => [s.title, s.severity_label, s.description])).toEqual(SPEC_SIGNALS);
    expect(signals.map((s) => s.severity)).toEqual(['critical', 'warning', 'warning']);
    expect(signals.filter((s) => (s as { primary?: boolean }).primary).map((s) => s.id)).toEqual(['SIG-USSFCU-FIN-001']);
  });

  it('keeps every signal metric line short enough not to truncate', () => {
    for (const s of signals) expect(s.metric_text.length, s.id).toBeLessThanOrEqual(32);
  });
});

describe('USSFCU Finance — the balance sheet reconciles', () => {
  it('derives net worth from the public profile, and matches the CEO persona', () => {
    expect(NET_WORTH_M).toBeCloseTo(114.75, 2);
    expect(PUBLIC_FACTS).toEqual({ totalAssetsM: 1530, netWorthRatioPct: 7.5, loanToSharePct: 84 });
  });

  it('adds the loan mix up to net loans, and loans over shares to the 84% loan-to-share', () => {
    expect(LOAN_MIX.reduce((n, l) => n + l.balanceM, 0)).toBe(NET_LOANS_M);
    expect(round((NET_LOANS_M / MEMBER_SHARES_M) * 100)).toBe(PUBLIC_FACTS.loanToSharePct);
  });
});

describe('Q1 · delinquency by loan segment', () => {
  const ia = DQ_SEGMENTS.find((s) => s.id === 'indirect_auto')!;
  const last = DQ_QUARTERS.length - 1;

  it('puts indirect auto at 1.8%, up from 1.1% two quarters ago, past its 1.5% parameter', () => {
    expect(ia.series[last]).toBe(1.8);
    expect(ia.series[last - 2]).toBe(1.1);
    expect(ia.parameterPct).toBe(1.5);
    expect(ia.series[last]).toBeGreaterThan(ia.parameterPct);
  });

  it('keeps first mortgage steady at 0.4% and HELOC at 0.6%', () => {
    expect(DQ_SEGMENTS.find((s) => s.id === 'first_mortgage')!.series.slice(-3)).toEqual([0.4, 0.4, 0.4]);
    expect(DQ_SEGMENTS.find((s) => s.id === 'heloc')!.series.slice(-3)).toEqual([0.6, 0.6, 0.6]);
  });

  it('has every other segment flat or improving and inside its parameter', () => {
    for (const s of DQ_SEGMENTS.filter((x) => x.id !== 'indirect_auto')) {
      for (let i = 1; i < s.series.length; i++) expect(s.series[i], s.id).toBeLessThanOrEqual(s.series[i - 1]);
      expect(s.series[last], s.id).toBeLessThan(s.parameterPct);
    }
  });

  it('blends the vintage split back to the pool’s 1.8%, with the rise in the last 18 months', () => {
    const { recent, seasoned } = INDIRECT_AUTO_VINTAGE;
    expect(recent.shareOfBalance + seasoned.shareOfBalance).toBeCloseTo(1, 10);
    expect(round(blendedIndirectAutoDq(), 1)).toBe(1.8);
    expect(recent.dqPct).toBeGreaterThan(seasoned.dqPct);
    expect(recent.label).toMatch(/last 18 months/);
    expect(answer(`${P}turn_delinquency`)).toContain('last 18 months');
  });
});

describe('Q2 · board risk-tolerance limits', () => {
  const fm = CONCENTRATION_LIMITS.find((c) => c.id === 'first_mortgage')!;

  it('puts first mortgage at $655M = 571% of net worth against a 600% cap', () => {
    expect(fm.balanceM).toBe(655);
    expect(round(pctOfNetWorth(fm.balanceM))).toBe(571);
    expect(fm.capPctOfNw).toBe(600);
  });

  it('leaves about $33M of headroom, reached in roughly two quarters at the current pace', () => {
    const headroom = headroomM(fm.balanceM, fm.capPctOfNw);
    expect(capDollarsM(600)).toBeCloseTo(688.5, 2);
    expect(Math.floor(headroom)).toBe(33);
    expect(round(headroom / MORTGAGE_GROWTH_PER_QUARTER_M)).toBe(2);
  });

  it('has no other portfolio within fifteen points of its limit', () => {
    expect(capUsePct(fm.balanceM, fm.capPctOfNw)).toBeGreaterThan(85);
    for (const c of CONCENTRATION_LIMITS.filter((x) => x.id !== 'first_mortgage')) {
      expect(100 - capUsePct(c.balanceM, c.capPctOfNw), c.id).toBeGreaterThan(15);
    }
  });

  it('reads each portfolio balance off the loan mix', () => {
    const mix = Object.fromEntries(LOAN_MIX.map((l) => [l.id, l.balanceM]));
    expect(CONCENTRATION_LIMITS.find((c) => c.id === 'consumer_unsecured')!.balanceM).toBe(mix.credit_card + mix.personal);
    for (const id of ['first_mortgage', 'indirect_auto', 'heloc', 'member_business'])
      expect(CONCENTRATION_LIMITS.find((c) => c.id === id)!.balanceM).toBe(mix[id]);
  });
});

describe('Q3 · rate shock', () => {
  const at = (bps: number) => RATE_SHOCKS.find((s) => s.bps === bps)!;

  it('covers plus and minus 25, 50 and 100 basis points', () => {
    expect(RATE_SHOCKS.map((s) => s.bps).sort((a, b) => a - b)).toEqual([-100, -50, -25, 25, 50, 100]);
  });

  it('marks the investment portfolio down about $18M at +100 and lifts loan income while margin compresses', () => {
    expect(at(100).investmentMarkM).toBe(-18);
    expect(at(100).loanIncomeM).toBeGreaterThan(0);
    expect(at(100).nimBps).toBeLessThan(0);
  });

  it('is proportional across increments, and minus mirrors plus', () => {
    for (const key of ['loanIncomeM', 'nimBps', 'investmentMarkM'] as const) {
      const perBp = at(100)[key] / 100;
      for (const s of RATE_SHOCKS) expect(s[key], `${key} @ ${s.bps}`).toBeCloseTo(perBp * s.bps, 6);
    }
    for (const bps of [25, 50, 100]) {
      expect(at(-bps).nwRatioPct - PUBLIC_FACTS.netWorthRatioPct).toBeCloseTo(PUBLIC_FACTS.netWorthRatioPct - at(bps).nwRatioPct, 6);
    }
  });

  it('dips net worth toward the 7.0% line only at +100, and agrees with the stress test', () => {
    expect(NW_EARLY_WARNING_PCT).toBe(7.0);
    expect(at(100).nwRatioPct).toBe(STRESS.plus100.nwRatioPct);
    expect(at(100).nwRatioPct).toBeGreaterThanOrEqual(NW_EARLY_WARNING_PCT);
    for (const bps of [-100, -50, -25, 25, 50]) expect(at(bps).nwRatioPct).toBeGreaterThanOrEqual(7.3);
  });
});

describe('Q4 · dry powder under +100 bp', () => {
  it('moves net worth 7.50% → about 7.1%, still well capitalized', () => {
    expect(STRESS.base.nwRatioPct).toBe(7.5);
    expect(STRESS.plus100.nwRatioPct).toBe(7.1);
    expect(STRESS.plus100.nwRatioPct).toBeGreaterThanOrEqual(NW_EARLY_WARNING_PCT);
  });

  it('covers the quarter’s projected outflows with roughly $40M to spare, narrower than the base case', () => {
    expect(liquiditySpareM(LIQUIDITY.plus100)).toBe(40);
    expect(liquiditySpareM(LIQUIDITY.base)).toBeGreaterThan(40);
    // The +100 on-hand figure carries the investment mark from Q3.
    expect(LIQUIDITY.base.onHandM - LIQUIDITY.plus100.onHandM).toBe(18);
  });

  it('climbs loan-to-share 84% → 88%, which is the funding-review trigger', () => {
    expect(STRESS.base.ltsPct).toBe(84);
    expect(STRESS.plus100.ltsPct).toBe(88);
    expect(FUNDING_REVIEW_TRIGGER_LTS_PCT).toBe(88);
    expect(PLUS100_SHARES_M).toBeLessThan(MEMBER_SHARES_M);
    expect(round((NET_LOANS_M / PLUS100_SHARES_M) * 100)).toBe(88);
  });
});

describe('Q5 · the board playbook', () => {
  it('maps one action to each of +25, +50 and +100, as the answer quotes them', () => {
    expect(PLAYBOOK.tiers.map((t) => t.bps)).toEqual([25, 50, 100]);
    const text = answer(`${P}turn_playbook`).toLowerCase();
    for (const t of PLAYBOOK.tiers) expect(text).toContain(t.action.toLowerCase().replace(/\.$/, ''));
  });
});

describe('Q6 · deposit activity by SEG group', () => {
  it('totals up 0.6% month over month', () => {
    expect(round(segTotals().changePct, 1)).toBe(0.6);
  });

  it('has exactly two payroll groups trending down, one off 4.2% across the 3% trigger', () => {
    const down = SEG_GROUPS.filter((g) => segChangePct(g) < 0);
    expect(down.map((g) => g.kind)).toEqual(['payroll', 'payroll']);
    for (const g of down) expect(g.priorMonthPct, g.id).toBeLessThan(0);
    const flagged = SEG_GROUPS.filter((g) => segChangePct(g) <= -SEG_OUTFLOW_TRIGGER_PCT);
    expect(flagged.map((g) => g.id)).toEqual(['payroll_a']);
    expect(round(segChangePct(flagged[0]), 1)).toBe(-4.2);
    expect(SEG_OUTFLOW_TRIGGER_PCT).toBe(3);
  });

  it('explains the flagged outflow as mostly certificate closures', () => {
    const a = SEG_GROUPS.find((g) => g.id === 'payroll_a')!;
    const outflow = a.lastM - a.thisM;
    expect(SEG_A_OUTFLOW_MIX.certificateClosuresM + SEG_A_OUTFLOW_MIX.otherM).toBeCloseTo(outflow, 6);
    expect(SEG_A_OUTFLOW_MIX.certificateClosuresM / outflow).toBeGreaterThan(0.5);
  });
});

describe('USSFCU Finance — provenance', () => {
  const names = new Set(dataSources.map((d) => d.name));

  it('cites only connected sources that the Data Sources screen lists', () => {
    for (const [key, f] of Object.entries(flows))
      for (const s of f.data_sources_used ?? []) expect(names.has(s), `${key} cites "${s}"`).toBe(true);
    for (const sig of signals) for (const s of sig.sources) expect(names.has(s), `${sig.id} cites "${s}"`).toBe(true);
  });

  it('dates everything on or before the demo’s today', () => {
    const end = `${DEMO_TODAY}T23:59:59`;
    for (const s of signals) {
      expect(s.timestamp <= end, s.id).toBe(true);
      expect(s.confidence.validated_at <= s.timestamp, s.id).toBe(true);
    }
    for (const d of dataSources) expect(d.lastSync <= end, d.id).toBe(true);
  });
});
