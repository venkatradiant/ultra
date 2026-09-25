/**
 * USSFCU Finance persona (Fiona) — the conversation, walked end to end.
 *
 * financeData.test.ts checks the words and figures against the spec, and
 * talkTrack.test.ts replays the talk track's CLICK lines. This file checks
 * what neither can see: a chip routing to a missing flow, a turn offering a
 * chip nothing routes, a visual declared in the JSON but never wired, a
 * signal card or KPI tile that opens nothing, and a typed question landing on
 * the wrong answer in front of the CEO and CFO.
 */
import { describe, it, expect } from 'vitest';
import { resolveFlowKey as matchInput } from '@core/engine/chatFlowEngine';
import type { PersonaManifest } from '@core/types';
import manifestModule from '@/markets/financial-services/clients/ussfcu/personas/finance/manifest';
import { FINANCE_QUESTIONS, FINANCE_CHIPS, FOLLOW_UP_CHIPS, SUGGESTED_PROMPTS } from './constants';
import { financePersona } from '@/markets/financial-services/clients/ussfcu/personas/finance';
import personas from '@/data/personas';

const manifest = manifestModule as unknown as PersonaManifest;
const { flows, ui } = manifest;
const chatFlows = flows.chatFlows as Record<string, { ai_message?: string; ai_response?: string; suggested_chips?: string[]; ui_components_to_render?: unknown[]; capability?: string; user_query?: string }>;
const chipMap = flows.chipToFlowKey;
const P = 'ussfcu_finance_';

const GOLDEN_PATH_END = `${P}turn_seg_deposits`;

/** Talk Track v4: each CLICK line, in order, and the turn it opens. */
const ORDER: Array<[chip: string, flowKey: string]> = [
  [FINANCE_CHIPS.delinquency, `${P}turn_delinquency`],
  [FINANCE_CHIPS.limits, `${P}turn_limits`],
  [FINANCE_CHIPS.shutdown, `${P}turn_shutdown`],
  [FINANCE_CHIPS.cushion, `${P}turn_cushion`],
  [FINANCE_CHIPS.playbook, `${P}turn_playbook`],
  [FINANCE_CHIPS.segDeposits, `${P}turn_seg_deposits`],
];

/** Every §10 follow-up that is not a CLICK line, and where it lands. */
const FOLLOW_UPS: Array<[chip: string, flowKey: string]> = [
  [FOLLOW_UP_CHIPS.ratesAndLiquidity, `${P}turn_shutdown`],
  [FOLLOW_UP_CHIPS.downsideOnPool, `${P}turn_shutdown`],
  [FOLLOW_UP_CHIPS.capitalHeadroom, `${P}turn_cushion`],
  [FOLLOW_UP_CHIPS.hilDriver, `${P}followup_hil_driver`],
  [FOLLOW_UP_CHIPS.runOff, `${P}followup_run_off`],
  [FOLLOW_UP_CHIPS.exportThis, `${P}followup_export`],
  [FOLLOW_UP_CHIPS.exportBriefing, `${P}followup_export`],
  [FOLLOW_UP_CHIPS.alcoSummary, `${P}followup_alco_summary`],
  [FOLLOW_UP_CHIPS.retentionAction, `${P}followup_retention`],
  [FOLLOW_UP_CHIPS.backToSignals, `${P}followup_signals`],
];

/** What a presenter, or a sceptical CFO, might type instead of clicking. */
const PROBES: Array<[query: string, expectedFlowKey: string]> = [
  ['show me delinquency trends by segment', `${P}turn_delinquency`],
  ['which portfolios are near their board limits?', `${P}turn_limits`],
  ['model a government shutdown on the portfolio', `${P}turn_shutdown`],
  ['do we have enough capital and liquidity?', `${P}turn_cushion`],
  ['what is our shutdown playbook?', `${P}turn_playbook`],
  ['show deposit activity by SEG group', `${P}turn_seg_deposits`],
  // Unscripted — must admit it rather than land on a turn that shares a word.
  ['what is the weather today', '__default__'],
  ['asdfgh', '__default__'],
  ['show me member names', '__default__'],
  ['is this real USS FCU data', '__default__'],
  ['what is our interest rate sensitivity', '__default__'],
  ['what about indirect auto', '__default__'],
];

describe(`${manifest.id} identity`, () => {
  it('is Fiona, Finance Team, the same in the module, the manifest and the legacy record', () => {
    const expected = { name: 'Fiona', initials: 'FI', role: 'Finance Team', greeting: 'Fiona' };
    expect(financePersona.identity).toEqual(expected);
    expect(manifest.identity).toEqual(expected);
    const legacy = (personas as Record<string, typeof expected & { capabilities: string[] }>).ussfcu_finance;
    expect({ name: legacy.name, initials: legacy.initials, role: legacy.role, greeting: legacy.greeting }).toEqual(expected);
    expect(legacy.capabilities).toEqual(manifest.capabilities);
  });

  it('greets "Good morning, Fiona" and shows the spec’s four navigation pages', () => {
    expect(`${ui.greetingLabel}, ${manifest.identity.greeting}`).toBe('Good morning, Fiona');
    expect(manifest.features?.navSlots).toEqual(['ask', 'portfolioRisk', 'scenarios', 'dataSources']);
  });
});

describe(`${manifest.id} conversation integrity`, () => {
  it.each(ORDER)('routes the CLICK "%s" to %s', (chip, key) => {
    expect(chipMap[chip]).toBe(key);
    expect(matchInput(flows, chip).flowKey).toBe(key);
  });

  it.each(FOLLOW_UPS)('routes the follow-up "%s" to %s', (chip, key) => {
    expect(chipMap[chip]).toBe(key);
    expect(matchInput(flows, chip).flowKey).toBe(key);
  });

  it('routes each of the spec’s full questions and §11 prompts', () => {
    const keys = ['delinquency', 'limits', 'shutdown', 'cushion', 'playbook', 'segDeposits'] as const;
    keys.forEach((k, i) => {
      expect(chatFlows[ORDER[i][1]].user_query).toBe(FINANCE_QUESTIONS[k]);
      expect(matchInput(flows, FINANCE_QUESTIONS[k]).flowKey).toBe(ORDER[i][1]);
    });
    const promptTargets = [0, 1, 2, 3, 4].map((i) => ORDER[i][1]);
    SUGGESTED_PROMPTS.forEach((p, i) => expect(matchInput(flows, p).flowKey, p).toBe(promptTargets[i]));
  });

  it('routes every chip to a flow that exists', () => {
    for (const [chip, key] of Object.entries(chipMap)) expect(chatFlows[key], `chip "${chip}" routes to missing flow "${key}"`).toBeDefined();
  });

  it('routes every chip any turn offers (and every initial chip)', () => {
    const offered: Array<[string, string]> = ui.initialChips.map((c) => ['initialChips', c]);
    for (const [key, flow] of Object.entries(chatFlows)) for (const chip of flow.suggested_chips ?? []) offered.push([key, chip]);
    for (const [where, chip] of offered) expect(chipMap[chip], `"${where}" offers unrouted chip "${chip}"`).toBeDefined();
  });

  it('never offers the turn’s own question back to it', () => {
    for (const [key, flow] of Object.entries(chatFlows))
      for (const chip of flow.suggested_chips ?? []) expect(chipMap[chip], `${key} offers itself`).not.toBe(key);
  });

  it('gives every flow something to say', () => {
    for (const [key, flow] of Object.entries(chatFlows)) expect((flow.ai_message ?? flow.ai_response)?.trim(), `flow "${key}" has no message`).toBeTruthy();
  });

  it('names only real flows in its sequences', () => {
    for (const key of [...flows.askTurnSequence, ...flows.signalSequence]) expect(chatFlows[key], key).toBeDefined();
    expect(flows.askTurnSequence).toEqual(ORDER.map(([, k]) => k));
  });

  it('has a __default__ that names the steps, and strict matching so noise reaches it', () => {
    expect(chatFlows.__default__).toBeDefined();
    expect(flows.strictMatch).toBe(true);
    for (const phrase of ['delinquency', 'board limits', 'government shutdown', 'capital and liquidity', 'shutdown playbook', 'SEG group'])
      expect(chatFlows.__default__.ai_message).toContain(phrase);
  });

  it('reaches every flow from somewhere', () => {
    const reachable = new Set<string>([ui.greetingFlowKey, ...Object.values(chipMap), ...flows.signalSequence]);
    const orphans = Object.keys(chatFlows).filter((k) => !reachable.has(k) && !k.startsWith('__'));
    expect(orphans, 'flows nothing can reach').toEqual([]);
  });

  it('renders the spec’s visual for each of Steps 2–7, and nothing for the greeting, follow-ups or fallback', () => {
    for (const [, key] of ORDER) {
      expect(chatFlows[key].ui_components_to_render?.length, key).toBe(1);
      expect(manifest.inlineComponents!({ flowKey: key, id: 'm1' }, manifest.signals)?.length, key).toBe(1);
    }
    for (const key of Object.keys(chatFlows).filter((k) => !ORDER.some(([, o]) => o === k)))
      expect(manifest.inlineComponents!({ flowKey: key, id: 'm1' }, manifest.signals), key).toBeUndefined();
  });

  it('gives every capability trigger a callout, and each callout the capability its flows carry', () => {
    const triggers = new Set(ui.capabilityCallouts.map((c) => c.trigger));
    for (const [key, trigger] of Object.entries(ui.flowKeyToCapabilityTrigger)) {
      expect(triggers.has(trigger), `${key} → ${trigger}`).toBe(true);
      const callout = ui.capabilityCallouts.find((c) => c.trigger === trigger)!;
      expect(chatFlows[key].capability, `${key} is tagged differently from its callout`).toBe(callout.capabilityName);
    }
  });
});

describe(`${manifest.id} briefing`, () => {
  it('opens each signal card on the turn its §6 action names', () => {
    expect(manifest.signals.map((s) => ui.signalToChip[s.id])).toEqual([
      FINANCE_CHIPS.delinquency,
      FINANCE_CHIPS.limits,
      FINANCE_CHIPS.shutdown,
    ]);
  });

  it('has eight KPI tiles, each opening a turn, only net worth marked as the public backdrop', () => {
    expect(ui.stats).toHaveLength(8);
    for (const s of ui.stats) expect(chipMap[s.chipText!], s.id).toBeDefined();
    expect(ui.stats.map((s) => (s as { publicProfile?: boolean }).publicProfile === true)).toEqual([true, false, false, false, false, false, false, false]);
  });
});

describe(`${manifest.id} golden path`, () => {
  it('walks the highlighted chips from the greeting to Step 7 without looping, then stops', () => {
    const visited: string[] = [];
    let key: string | undefined = ui.greetingFlowKey;
    while (key && visited.length < 20) {
      expect(visited, `golden path loops back to "${key}"`).not.toContain(key);
      visited.push(key);
      if (key === GOLDEN_PATH_END) break;
      const chip: string | undefined = ui.goldenPathChip[key];
      if (!chip) break;
      expect(chatFlows[key]?.suggested_chips ?? [], `"${key}" highlights "${chip}" but does not offer it`).toContain(chip);
      key = chipMap[chip];
    }
    expect(visited).toEqual([ui.greetingFlowKey, ...ORDER.map(([, k]) => k)]);
    expect(ui.goldenPathChip[GOLDEN_PATH_END]).toBeUndefined();
  });

  it('highlights the next CLICK first on every turn', () => {
    for (const [key, chip] of Object.entries(ui.goldenPathChip)) expect(chatFlows[key].suggested_chips?.[0], key).toBe(chip);
  });

  it('never highlights anything off the talk track', () => {
    expect(Object.keys(ui.goldenPathChip).sort()).toEqual([ui.greetingFlowKey, ...ORDER.slice(0, 5).map(([, k]) => k)].sort());
  });
});

describe(`${manifest.id} free-text probes`, () => {
  it.each(PROBES)('"%s" lands on %s', (query, expected) => {
    expect(matchInput(flows, query).flowKey).toBe(expected);
  });
});
