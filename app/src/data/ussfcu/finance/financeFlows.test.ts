/**
 * USSFCU Finance Team — the conversation, walked end to end.
 *
 * manifests.test.ts checks the manifest's shape and talkTrack.test.ts replays
 * the six clicks. This file checks what neither can see: a chip routing to a
 * missing flow, a turn offering a chip nothing routes, a visual declared in
 * the JSON but never wired, a signal card or KPI tile that opens nothing, and
 * a typed question landing on the wrong answer in front of the CEO and CFO.
 */
import { describe, it, expect } from 'vitest';
import { resolveFlowKey as matchInput } from '@core/engine/chatFlowEngine';
import type { PersonaManifest } from '@core/types';
import manifestModule from '@/markets/financial-services/clients/ussfcu/personas/finance/manifest';
import { FINANCE_QUESTIONS, FINANCE_CHIPS } from './constants';
import { financePersona } from '@/markets/financial-services/clients/ussfcu/personas/finance';
import personas from '@/data/personas';

const manifest = manifestModule as unknown as PersonaManifest;
const { flows, ui } = manifest;
const chatFlows = flows.chatFlows as Record<string, { ai_message?: string; ai_response?: string; suggested_chips?: string[]; ui_components_to_render?: unknown[]; capability?: string }>;
const chipMap = flows.chipToFlowKey;
const P = 'ussfcu_finance_';

const GOLDEN_PATH_END = `${P}turn_seg_deposits`;

/** The narrative's six questions in its order, and where each lands. */
const ORDER: Array<[question: string, flowKey: string, capability: string]> = [
  [FINANCE_CHIPS.delinquency, `${P}turn_delinquency`, 'Proactive Intelligence'],
  [FINANCE_CHIPS.limits, `${P}turn_limits`, 'Converged Conversation'],
  [FINANCE_CHIPS.rateShock, `${P}turn_rate_shock`, 'Predictive Intelligence'],
  [FINANCE_CHIPS.dryPowder, `${P}turn_dry_powder`, 'Anomaly Detection'],
  [FINANCE_CHIPS.playbook, `${P}turn_playbook`, 'Automated Action'],
  [FINANCE_CHIPS.segDeposits, `${P}turn_seg_deposits`, 'Automated Action'],
];

/** What a presenter, or a sceptical CFO, might type instead of clicking. */
const PROBES: Array<[query: string, expectedFlowKey: string]> = [
  ['show me delinquency by segment', `${P}turn_delinquency`],
  ['which portfolios are near their board limits', `${P}turn_limits`],
  ['run a rate shock', `${P}turn_rate_shock`],
  ['do we have enough liquidity', `${P}turn_dry_powder`],
  ['what is the playbook action for a half point', `${P}turn_playbook`],
  ['SEG deposit outflow alert', `${P}turn_seg_deposits`],
  // Unscripted — must admit it rather than land on a turn that shares a word.
  ['what is the weather today', '__default__'],
  ['asdfgh', '__default__'],
  ['show me member names', '__default__'],
  ['is this real USS FCU data', '__default__'],
  ['what about the employment shock scenario', '__default__'],
];

describe(`${manifest.id} identity`, () => {
  it('is the untitled Finance Team, the same in the module, the manifest and the legacy record', () => {
    const expected = { name: 'Finance Team', initials: 'FT', role: 'USS FCU Finance', greeting: 'Finance Team' };
    expect(financePersona.identity).toEqual(expected);
    expect(manifest.identity).toEqual(expected);
    const legacy = (personas as Record<string, typeof expected>).ussfcu_finance;
    expect({ name: legacy.name, initials: legacy.initials, role: legacy.role, greeting: legacy.greeting }).toEqual(expected);
  });

  it('greets with a fixed "Good morning" and shows only Ask and Data Sources', () => {
    expect(ui.greetingLabel).toBe('Good morning');
    expect(manifest.features?.navSlots).toEqual(['ask', 'dataSources']);
  });
});

describe(`${manifest.id} conversation integrity`, () => {
  it('offers the six approved questions, in the narrative’s order, on the initial view', () => {
    expect(ui.initialChips).toEqual(ORDER.map(([q]) => q));
  });

  it.each(ORDER)('routes "%s" to %s, tagged %s', (question, key, capability) => {
    expect(chipMap[question]).toBe(key);
    expect(matchInput(flows, question).flowKey).toBe(key);
    expect(chatFlows[key].capability).toBe(capability);
  });

  it('keeps the narrative’s full question as each answer’s query, and routes it', () => {
    const keys = ['delinquency', 'limits', 'rateShock', 'dryPowder', 'playbook', 'segDeposits'] as const;
    keys.forEach((k, i) => {
      const [, flowKey] = ORDER[i];
      expect((chatFlows[flowKey] as { user_query?: string }).user_query).toBe(FINANCE_QUESTIONS[k]);
      expect(chipMap[FINANCE_QUESTIONS[k]]).toBe(flowKey);
      expect(matchInput(flows, FINANCE_QUESTIONS[k]).flowKey).toBe(flowKey);
    });
  });

  it('keeps every chip label short enough to read at a glance', () => {
    for (const chip of Object.values(FINANCE_CHIPS)) expect(chip.length, chip).toBeLessThanOrEqual(50);
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

  it('has a __default__ that names the six questions, and strict matching so noise reaches it', () => {
    expect(chatFlows.__default__).toBeDefined();
    expect(flows.strictMatch).toBe(true);
    for (const phrase of ['delinquency', 'board limits', 'rate shock', 'liquidity', 'playbook', 'SEG group'])
      expect(chatFlows.__default__.ai_message).toContain(phrase);
  });

  it('reaches every flow from somewhere', () => {
    const reachable = new Set<string>([ui.greetingFlowKey, ...Object.values(chipMap), ...flows.signalSequence]);
    const orphans = Object.keys(chatFlows).filter((k) => !reachable.has(k) && !k.startsWith('__'));
    expect(orphans, 'flows nothing can reach').toEqual([]);
  });

  it('renders a visual for every answer, and nothing for the greeting or the fallback', () => {
    for (const [, key] of ORDER) {
      expect(chatFlows[key].ui_components_to_render?.length, key).toBe(1);
      expect(manifest.inlineComponents!({ flowKey: key, id: 'm1' }, manifest.signals)?.length, key).toBe(1);
    }
    for (const key of [ui.greetingFlowKey, '__default__'])
      expect(manifest.inlineComponents!({ flowKey: key, id: 'm1' }, manifest.signals), key).toBeUndefined();
  });

  it('gives every capability trigger a callout, and every answer a trigger', () => {
    const triggers = new Set(ui.capabilityCallouts.map((c) => c.trigger));
    for (const [key, trigger] of Object.entries(ui.flowKeyToCapabilityTrigger)) expect(triggers.has(trigger), `${key} → ${trigger}`).toBe(true);
    for (const [, key] of ORDER) expect(ui.flowKeyToCapabilityTrigger[key], key).toBeDefined();
    for (const c of ui.capabilityCallouts) {
      const flowKey = Object.entries(ui.flowKeyToCapabilityTrigger).find(([, t]) => t === c.trigger)?.[0];
      expect(chatFlows[flowKey!].capability, `${c.trigger} names a different capability than its turn`).toBe(c.capabilityName);
    }
  });
});

describe(`${manifest.id} briefing`, () => {
  it('opens each signal card on the question that answers it', () => {
    expect(manifest.signals.map((s) => ui.signalToChip[s.id])).toEqual([
      FINANCE_CHIPS.delinquency,
      FINANCE_CHIPS.limits,
      FINANCE_CHIPS.rateShock,
    ]);
  });

  it('has six KPI tiles, each opening a question, the first three marked as the public profile', () => {
    expect(ui.stats).toHaveLength(6);
    for (const s of ui.stats) expect(chipMap[s.chipText!], s.id).toBeDefined();
    expect(ui.stats.map((s) => (s as { publicProfile?: boolean }).publicProfile === true)).toEqual([true, true, true, false, false, false]);
    expect(ui.stats.map((s) => s.value)).toEqual(['$1.53B', '7.50%', '84%', '1.8%', '571%', '+0.6%']);
  });
});

describe(`${manifest.id} golden path`, () => {
  it('walks the highlighted chips from the greeting to the sixth question without looping, then stops', () => {
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

  it('highlights the next question first on every turn', () => {
    for (const [key, chip] of Object.entries(ui.goldenPathChip)) expect(chatFlows[key].suggested_chips?.[0], key).toBe(chip);
  });
});

describe(`${manifest.id} free-text probes`, () => {
  it.each(PROBES)('"%s" lands on %s', (query, expected) => {
    expect(matchInput(flows, query).flowKey).toBe(expected);
  });
});
