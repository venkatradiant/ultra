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
import { GOVERNANCE } from './governanceData';

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
