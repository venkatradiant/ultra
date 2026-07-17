import { describe, it, expect } from 'vitest';
import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import { ASSISTANT_CONTEXT } from './assistantContext';

/**
 * Guards Daniel's guided flow as a graph. A dead-end chip — one the presenter
 * can click that resolves to nothing — is invisible in review and only shows up
 * live, in front of the client. Spec v2 puts the flow at nine turns, so the
 * surface area for that is now large enough to be worth pinning down.
 */
interface Flow {
  ai_message: string;
  suggested_chips?: string[];
  data_sources_used?: string[];
  confidence?: { score: number };
}
interface PaConfig {
  chatFlows: Record<string, Flow>;
  chipToFlowKey: Record<string, string>;
  askTurnSequence: string[];
}

const cfg = (getPersonaFlowConfigs('nfcu') as unknown as Record<string, PaConfig>).nfcu_platform_admin;
const flows = cfg.chatFlows;
const chipToFlowKey = cfg.chipToFlowKey;

/** Spec v2's nine turns, in order. Turn 1 is seeded, not sequenced. */
const GOLDEN_PATH = [
  'nfcu_pa_greeting',
  'nfcu_pa_field_sovereignty',
  'nfcu_pa_kag_provenance',
  'nfcu_pa_routing_logic',
  'nfcu_pa_budget_guardrail',
  'nfcu_pa_cost_usage',
  'nfcu_pa_cache_reuse',
  'nfcu_pa_observability',
  'nfcu_pa_agent_inventory',
];

describe("Daniel's flow graph", () => {
  it('resolves every chip to a flow that exists', () => {
    for (const [chip, key] of Object.entries(chipToFlowKey)) {
      expect(flows[key], `chip "${chip}" points at missing flow "${key}"`).toBeDefined();
    }
  });

  it('has no dead ends — every suggested chip is clickable', () => {
    for (const [key, flow] of Object.entries(flows)) {
      for (const chip of flow.suggested_chips ?? []) {
        expect(chipToFlowKey[chip], `dead end: "${chip}" offered by ${key} maps to nothing`).toBeDefined();
      }
    }
  });

  it('carries all nine of spec v2 turns', () => {
    for (const key of GOLDEN_PATH) {
      expect(flows[key], `spec v2 turn "${key}" is missing`).toBeDefined();
    }
  });

  it('sequences turns 2–9 for the Ask surface', () => {
    expect(cfg.askTurnSequence).toEqual(GOLDEN_PATH.slice(1));
  });

  /**
   * The golden path must be *walkable*, not merely defined. A chip can exist in
   * chipToFlowKey and still be unreachable because the previous turn never
   * offers it — which is not a dead end, so the check above misses it. That is
   * exactly how the demo lost turns 7–9: the cost turn's chips jumped straight
   * to observability and skipped the cache turn. Only a live walk found it.
   *
   * Each entry: from this turn, this chip must be offered, and it must land on
   * the next turn.
   */
  const GOLDEN_CHIPS: Array<[string, string, string]> = [
    ['nfcu_pa_greeting', 'Review the auto loan spike', 'nfcu_pa_field_sovereignty'],
    ['nfcu_pa_field_sovereignty', 'Why did the auto loan rate stay local?', 'nfcu_pa_kag_provenance'],
    ['nfcu_pa_kag_provenance', 'Show me the routing logic', 'nfcu_pa_routing_logic'],
    ['nfcu_pa_routing_logic', 'Show me the budget guardrail', 'nfcu_pa_budget_guardrail'],
    ['nfcu_pa_budget_guardrail', 'Run the cost report', 'nfcu_pa_cost_usage'],
    ['nfcu_pa_cost_usage', 'Show me where we reused an answer instead of calling a model', 'nfcu_pa_cache_reuse'],
    ['nfcu_pa_cache_reuse', 'Show me agent activity and frontier usage across the enterprise', 'nfcu_pa_observability'],
    ['nfcu_pa_observability', 'Show the enterprise agent inventory', 'nfcu_pa_agent_inventory'],
  ];

  /**
   * Spec v2 lists the follow-ups for each turn. They are the client's words, so
   * dropping one to make room for a golden-path route is a silent spec
   * regression — which is exactly what happened three times before this test
   * existed. Golden-path chips are additive; spec chips must all survive.
   */
  const SPEC_FOLLOWUPS: Record<string, string[]> = {
    nfcu_pa_greeting: ['Review the auto loan spike', 'Show me contact center spend', 'What did the graph catch?'],
    nfcu_pa_field_sovereignty: ['Why did the auto loan rate stay local?', 'Show me the routing logic', 'What did the frontier model do?'],
    nfcu_pa_kag_provenance: ['Show all fields flagged sensitive', 'Show me the routing logic', 'What did the frontier model do?'],
    nfcu_pa_routing_logic: ['Run the cost report', 'Show me the budget guardrail', 'Which tasks used the frontier model?'],
    nfcu_pa_budget_guardrail: ['Show me who is near their budget', 'Show the routing logic', 'Run the cost report'],
    nfcu_pa_cost_usage: ['Show me the highest-cost tasks', 'Break it down by persona', 'Show frontier usage this month'],
    nfcu_pa_cache_reuse: ['Show cache hit rate this month', 'Run the cost report', 'Which answers are cached?'],
    nfcu_pa_observability: ['Expand a flagged action', 'Compare governance across initiatives', 'Show the enterprise agent inventory'],
    nfcu_pa_agent_inventory: ['Group these by foundry', 'Show anything not yet under governance', 'Onboard an agent to governance'],
  };

  it("offers every follow-up spec v2 specifies, on every turn", () => {
    for (const [key, wanted] of Object.entries(SPEC_FOLLOWUPS)) {
      for (const chip of wanted) {
        expect(
          flows[key].suggested_chips,
          `${key} drops spec v2 follow-up "${chip}"`,
        ).toContain(chip);
      }
    }
  });

  it('can be walked end to end by clicking the offered chips', () => {
    for (const [from, chip, to] of GOLDEN_CHIPS) {
      expect(
        flows[from].suggested_chips,
        `turn ${from} does not offer "${chip}", so the golden path stops here`,
      ).toContain(chip);
      expect(chipToFlowKey[chip], `"${chip}" does not resolve`).toBe(to);
    }
  });

  it('reaches every one of the nine turns from the greeting', () => {
    // Walk it for real: start at the greeting, follow the golden chips, and
    // confirm we visit all nine turns in order.
    const visited = ['nfcu_pa_greeting'];
    let current = 'nfcu_pa_greeting';
    for (const [from, chip, to] of GOLDEN_CHIPS) {
      expect(current).toBe(from);
      expect(flows[from].suggested_chips).toContain(chip);
      current = chipToFlowKey[chip];
      visited.push(current);
      expect(current).toBe(to);
    }
    expect(visited).toEqual(GOLDEN_PATH);
  });

  it('gives every flow a message, sources and a confidence block', () => {
    for (const [key, flow] of Object.entries(flows)) {
      expect(flow.ai_message, `${key} has no ai_message`).toBeTruthy();
      expect(flow.data_sources_used?.length, `${key} cites no sources`).toBeGreaterThan(0);
      expect(flow.confidence?.score, `${key} has no confidence score`).toBeGreaterThan(0);
    }
  });

  // The floating assistant bar offers page-scoped chips per route. Each must
  // resolve, or the presenter clicks a suggested question on Data Sources and
  // gets nothing — the same silent failure the golden-path checks guard, but on
  // a surface those checks don't reach.
  it('resolves every assistant-bar chip on every page', () => {
    for (const [route, ctx] of Object.entries(ASSISTANT_CONTEXT)) {
      for (const chip of ctx.chips) {
        const key = chipToFlowKey[chip];
        expect(key, `assistant chip "${chip}" on ${route} maps to nothing`).toBeDefined();
        expect(flows[key], `assistant chip "${chip}" on ${route} points at missing flow "${key}"`).toBeDefined();
      }
    }
  });

  it('opens at enterprise altitude, with the contact center as the example — CR-07', () => {
    const greeting = flows.nfcu_pa_greeting.ai_message;
    expect(greeting).toMatch(/enterprise/i);
    // The reframe must not delete the concrete thread the demo drills into.
    expect(greeting).toMatch(/auto loan spike/i);
  });

  it('states three routing gates, not two — CR-05', () => {
    const routing = flows.nfcu_pa_routing_logic.ai_message;
    expect(routing).toMatch(/three gates/i);
    expect(routing).toMatch(/within budget/i);
    expect(routing).not.toMatch(/^Two gates/i);
  });

  it('zooms turn 8 out to the enterprise, not the contact center — CR-06', () => {
    const obs = flows.nfcu_pa_observability.ai_message;
    expect(obs).toMatch(/across the enterprise/i);
    expect(obs).toMatch(/one governance model/i);
  });
});
