import { describe, it, expect } from 'vitest';
import {
  getCategories,
  getComponents,
  getComponent,
  getComponentMetrics,
  getComponentActivity,
  getRootCause,
  getSystemOverview,
  AGENT_STATE_BRIDGE,
  turn6HealthToState,
  COUNTER_METRICS,
  METRIC_META,
  metricSeries,
} from './observabilityData';
import {
  GOVERNANCE,
  COST_REPORT,
  BUDGET_GUARDRAIL,
  getCacheReuse,
  getBudgetGuardrail,
} from './governanceData';
import {
  getAgentRegistry,
  getRegistryByFoundry,
  getUngovernedAgents,
} from './agentRegistryData';

describe('observability data — overview reconciles with the component list', () => {
  it('reports a total equal to the number of components', async () => {
    const overview = await getSystemOverview();
    const components = await getComponents();
    expect(overview.total).toBe(components.length);
  });

  it('has health counts that sum to the total', async () => {
    const o = await getSystemOverview();
    expect(o.healthy + o.degraded + o.failed + o.recovering).toBe(o.total);
  });

  it('derives each layer gauge from that layer members', async () => {
    const overview = await getSystemOverview();
    for (const layer of overview.layers) {
      const members = await getComponents({ layer: layer.id });
      const healthy = members.filter((c) => c.state === 'healthy').length;
      expect(layer.total).toBe(members.length);
      expect(layer.healthy).toBe(healthy);
      expect(layer.health).toBeCloseTo((healthy / members.length) * 100, 1);
    }
  });

  it('accounts for every component in exactly one layer', async () => {
    const overview = await getSystemOverview();
    const summed = overview.layers.reduce((n, l) => n + l.total, 0);
    expect(summed).toBe(overview.total);
  });
});

// The invariant that matters most: turn 6 and this page describe the same three
// agents. If they ever disagree, a technical audience catches it live.
describe('observability data — agrees with the turn-6 governance dashboard', () => {
  it('covers every agent that turn 6 reports', () => {
    for (const agent of GOVERNANCE.agents) {
      expect(AGENT_STATE_BRIDGE[agent.name]).toBeDefined();
    }
  });

  it('gives each turn-6 agent a matching component state', async () => {
    for (const agent of GOVERNANCE.agents) {
      const { componentId } = AGENT_STATE_BRIDGE[agent.name];
      const component = await getComponent(componentId);
      expect(component, `${agent.name} -> ${componentId}`).not.toBeNull();
      expect(component?.state).toBe(turn6HealthToState(agent.health));
    }
  });

  it('keeps Card Disputes as the degraded agent the page diagnoses', async () => {
    const card = await getComponent('card-disputes-assist');
    expect(card?.state).toBe('degraded');
    // Turn 6 flags it without explanation; this page must supply the diagnosis.
    expect(await getRootCause('card-disputes-assist')).not.toBeNull();
  });

  it('states the bridge maps Watch to degraded and Healthy to healthy', () => {
    expect(turn6HealthToState('Healthy')).toBe('healthy');
    expect(turn6HealthToState('Watch')).toBe('degraded');
  });
});

// The figures a technical audience will add up. Spec v2 owns them; these lock
// them down so a later edit can't quietly move one.
describe('governance arithmetic — the spec-owned numbers', () => {
  it('keeps the cost report reconciled and untouched by the new turns', () => {
    const rows = COST_REPORT.rows;
    const f = COST_REPORT.footer;
    expect(rows.length).toBe(f.totalTasks);
    expect(rows.filter((r) => r.model === 'Frontier').length).toBe(f.frontierTasks);
    expect(+rows.reduce((s, r) => s + r.cost, 0).toFixed(2)).toBe(f.total);
    // 1 - 0.63/2.18 = 71.1%
    expect(f.saved).toBe(`${Math.round((1 - f.total / f.allFrontier) * 100)}%`);
  });

  it('derives the month frontier share from the agent rows', () => {
    const tasks = GOVERNANCE.agents.reduce((s, a) => s + a.tasks, 0);
    const frontier = GOVERNANCE.agents.reduce((s, a) => s + a.frontier, 0);
    expect(GOVERNANCE.frontierTaskShare).toBe(`${Math.round((frontier / tasks) * 100)}%`);
  });

  it('groups every agent under an initiative for the enterprise view', () => {
    for (const a of GOVERNANCE.agents) expect(a.initiative).toBeTruthy();
    // The enterprise point only lands if it is not all one initiative.
    expect(new Set(GOVERNANCE.agents.map((a) => a.initiative)).size).toBeGreaterThan(1);
  });
});

describe('cache reuse — month scope, must not disturb the session cost report', () => {
  it('counts the same month the agent rows describe', async () => {
    const c = await getCacheReuse();
    const tasks = GOVERNANCE.agents.reduce((s, a) => s + a.tasks, 0);
    expect(c.month.tasks).toBe(tasks);
  });

  it('derives hit rate and cost avoided rather than restating them', async () => {
    const c = await getCacheReuse();
    const { tasks, cacheHits, avgCostPerQuery, avgTokensPerCall } = c.month;
    expect(c.month.hitRatePct).toBeCloseTo((cacheHits / tasks) * 100, 1);
    expect(c.month.costAvoided).toBeCloseTo(cacheHits * avgCostPerQuery, 2);
    expect(c.month.tokensAvoided).toBe(cacheHits * avgTokensPerCall);
  });

  it('serves the second query from cache at zero tokens and zero cost', async () => {
    const { pair } = await getCacheReuse();
    expect(pair.first.served).toBe('model');
    expect(pair.second.served).toBe('cache');
    expect(pair.second.tokens).toBe(0);
    expect(pair.second.cost).toBe(0);
    // A cache hit that wasn't faster would make the whole turn pointless.
    expect(pair.second.latencyMs).toBeLessThan(pair.first.latencyMs);
    expect(pair.similarity).toBeGreaterThanOrEqual(pair.threshold);
  });
});

describe('budget guardrail — both spec sentences must be true at once', () => {
  it('crosses the soft budget but never breaches the hard cap', async () => {
    const b = await getBudgetGuardrail();
    expect(b.budget).toBeLessThan(b.cap);
    expect(b.spendAtDownshift).toBeGreaterThan(b.budget); // "crossed their budget"
    expect(b.finalSpend).toBeLessThanOrEqual(b.cap); // "spend stayed inside the cap"
  });

  it('shows the downshift actually prevented a breach', async () => {
    const b = await getBudgetGuardrail();
    expect(b.counterfactual).toBeGreaterThan(b.cap);
    expect(b.finalSpend).toBeLessThan(b.counterfactual);
  });

  it('reconciles the spend curve with the quoted figures', () => {
    const s = BUDGET_GUARDRAIL.spendByTask;
    expect(s.length).toBe(BUDGET_GUARDRAIL.totalTasks);
    expect(s[BUDGET_GUARDRAIL.downshiftAtTask - 1]).toBe(BUDGET_GUARDRAIL.spendAtDownshift);
    expect(s[s.length - 1]).toBe(BUDGET_GUARDRAIL.finalSpend);
    // Cumulative spend can never go down.
    for (let i = 1; i < s.length; i += 1) expect(s[i]).toBeGreaterThanOrEqual(s[i - 1]);
    expect(BUDGET_GUARDRAIL.before.tasks + BUDGET_GUARDRAIL.after.tasks).toBe(BUDGET_GUARDRAIL.totalTasks);
  });
});

describe('agent registry — one governance model across many foundries', () => {
  it('has exactly 3 ungoverned agents, as spec v2 Step 9 states', async () => {
    const r = await getAgentRegistry();
    expect(r.ungoverned).toBe(3);
    expect((await getUngovernedAgents()).length).toBe(3);
  });

  it('derives totals from the rows', async () => {
    const r = await getAgentRegistry();
    expect(r.governed + r.ungoverned).toBe(r.total);
    expect(r.total).toBe(r.rows.length);
  });

  it('lists every agent turn 8 reports on', async () => {
    const { rows } = await getAgentRegistry();
    for (const agent of GOVERNANCE.agents) {
      const row = rows.find((x) => x.agent === agent.name);
      expect(row, `${agent.name} is reported in turn 8 but missing from the registry`).toBeDefined();
      expect(row?.governed).toBe(true);
    }
  });

  it('reports PII-safety as unknown for ungoverned agents, never as safe', async () => {
    // The whole point of the screen: outside the layer, nobody can answer this.
    for (const a of await getUngovernedAgents()) {
      expect(a.piiSafe).toBeNull();
      expect(a.withinBudget).toBeNull();
      expect(a.policyVersion).toBe('—');
    }
  });

  it('spans more than one foundry, and the pivot reconciles to the rows', async () => {
    const groups = await getRegistryByFoundry();
    const r = await getAgentRegistry();
    expect(groups.length).toBeGreaterThan(1);
    expect(groups.reduce((s, g) => s + g.total, 0)).toBe(r.total);
    expect(groups.reduce((s, g) => s + g.ungoverned, 0)).toBe(r.ungoverned);
  });
});

describe('observability data — API contract shape', () => {
  it('returns categories with a layer, sorted alphabetically', async () => {
    const cats = await getCategories();
    expect(cats.length).toBeGreaterThan(0);
    for (const c of cats) {
      expect(c).toHaveProperty('category');
      expect(c).toHaveProperty('layer');
    }
    const names = cats.map((c) => c.category);
    expect(names).toEqual([...names].sort());
  });

  it('filters components by category and by layer', async () => {
    const agents = await getComponents({ category: 'ai_agents' });
    expect(agents.length).toBeGreaterThan(0);
    expect(agents.every((c) => c.category === 'ai_agents')).toBe(true);

    const network = await getComponents({ layer: 'network_layer' });
    expect(network.every((c) => c.layer === 'network_layer')).toBe(true);
  });

  it('reports metrics_count matching the metrics actually returned', async () => {
    for (const c of await getComponents()) {
      const m = await getComponentMetrics(c.component);
      expect(m?.metrics_count).toBe(Object.keys(m?.metrics ?? {}).length);
    }
  });

  it('returns null for an unknown component rather than throwing', async () => {
    expect(await getComponent('does-not-exist')).toBeNull();
    expect(await getComponentMetrics('does-not-exist')).toBeNull();
  });

  it('gives every component an activity log, even the healthy ones', async () => {
    for (const c of await getComponents()) {
      const a = await getComponentActivity(c.component);
      expect(a.total_events).toBe(a.events.length);
      expect(a.total_events).toBeGreaterThan(0);
      expect(a.events.every((e) => e.component === c.component)).toBe(true);
    }
  });

  it('labels every metric it emits', async () => {
    for (const c of await getComponents()) {
      const m = await getComponentMetrics(c.component);
      for (const key of Object.keys(m?.metrics ?? {})) {
        expect(METRIC_META[key], `missing METRIC_META for "${key}"`).toBeDefined();
      }
    }
  });
});

describe('observability data — live simulation', () => {
  it('is deterministic: the same tick always yields the same value', async () => {
    const a = await getComponentMetrics('auto-loan-assist', 7);
    const b = await getComponentMetrics('auto-loan-assist', 7);
    expect(a).toEqual(b);
  });

  it('moves between ticks, so the page reads as live', async () => {
    const a = await getComponentMetrics('auto-loan-assist', 1);
    const b = await getComponentMetrics('auto-loan-assist', 2);
    expect(a?.metrics).not.toEqual(b?.metrics);
  });

  it('never lets a cumulative counter tick downwards', async () => {
    // pii_blocked_count is the Gate 1 tally — a decrease would be nonsense.
    let previous = -Infinity;
    for (let tick = 0; tick < 40; tick += 1) {
      const m = await getComponentMetrics('frontier-egress-gateway', tick);
      const value = m?.metrics.pii_blocked_count ?? 0;
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });

  it('keeps percentage metrics within 0-100', async () => {
    for (let tick = 0; tick < 20; tick += 1) {
      for (const c of await getComponents()) {
        const m = await getComponentMetrics(c.component, tick);
        for (const [key, value] of Object.entries(m?.metrics ?? {})) {
          expect(value).toBeGreaterThanOrEqual(0);
          const max = METRIC_META[key]?.max;
          if (max != null) expect(value).toBeLessThanOrEqual(max);
        }
      }
    }
  });

  it('ends a metric series on the value the tile shows', async () => {
    // The series and the live value come from one jitter function, so the last
    // plotted point must equal the current reading or the chart contradicts it.
    const tick = 12;
    const component = await getComponent('slm-inference-pool-02');
    const metrics = await getComponentMetrics('slm-inference-pool-02', tick);
    for (const [key, baseline] of Object.entries(component?.metrics ?? {})) {
      if (COUNTER_METRICS.has(key)) continue;
      const series = metricSeries('slm-inference-pool-02', key, baseline, tick);
      expect(series[series.length - 1].value).toBe(metrics?.metrics[key]);
    }
  });
});

describe('observability data — remediation stays human-approved', () => {
  it('never reports an executed action that no human approved', async () => {
    for (const c of await getComponents()) {
      const rca = await getRootCause(c.component);
      if (!rca) continue;
      if (rca.status === 'completed') {
        expect(rca.outcome, `${c.component} completed without an outcome`).toBeDefined();
        expect(rca.outcome).toMatch(/approved/i);
      }
    }
  });

  it('logs no action execution that is not preceded by an approval', async () => {
    for (const c of await getComponents()) {
      const { events } = await getComponentActivity(c.component);
      const startedAt = events.findIndex((e) => /^Starting action:/.test(e.message));
      if (startedAt === -1) continue;
      const approvedBefore = events
        .slice(0, startedAt)
        .some((e) => /approved by/i.test(e.message));
      expect(approvedBefore, `${c.component} executed an action with no approval`).toBe(true);
    }
  });

  it('gives every root cause evidence and a policy to justify it', async () => {
    for (const c of await getComponents()) {
      const rca = await getRootCause(c.component);
      if (!rca) continue;
      expect(rca.evidence.length).toBeGreaterThan(0);
      expect(rca.policy).toBeTruthy();
      expect(rca.confidence).toBeGreaterThan(0);
      expect(rca.confidence).toBeLessThanOrEqual(100);
    }
  });

  it('offers a diagnosis for every component that is not healthy', async () => {
    for (const c of await getComponents()) {
      if (c.state === 'healthy') continue;
      expect(await getRootCause(c.component), `${c.component} is ${c.state} with no RCA`).not.toBeNull();
    }
  });
});
