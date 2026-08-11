/**
 * The CRO's fixtures have to agree with each other.
 *
 * Every headline figure in this demo appears in three or four places at once —
 * a KPI tile, a signal card, a chart, the trust strip, a deck slide — and each
 * of those is a separate JSON file. On the CEO build the same shape produced a
 * string of contradictions found only by reading slides side by side: two
 * membership sparklines that disagreed, a "~5 weeks" that pointed at September,
 * a growth rate that could not be derived from the series under it.
 *
 * A demo that contradicts itself in front of a supervisory committee is worse
 * than one with fewer numbers, so the arithmetic is asserted here rather than
 * trusted. These are not tests of the code — they are tests of the story.
 */
import { describe, it, expect } from 'vitest';

import kpis from './kpis.json';
import signals from './signals.json';
import trustStrip from './trustStrip.json';
import scamTrend from './scamTrend.json';
import lossBreakdown from './lossBreakdown.json';
import forecast from './forecast.json';
import linkGraph from './linkGraph.json';
import alertQueue from './alertQueue.json';
import cases from './cases.json';
import coverage from './coverage.json';
import sarItems from './sarItems.json';
import response from './response.json';
import lineage from './lineage.json';
import dataSources from './dataSources.json';

describe('ESFCU CRO fixtures — the consistency spine', () => {
  it('makes the trailing four weeks add up to the 148 everything else quotes', () => {
    const weeks = scamTrend.series;
    const recent = weeks.slice(4).reduce((n, w) => n + w.total, 0);
    const prior = weeks.slice(0, 4).reduce((n, w) => n + w.total, 0);
    expect(recent).toBe(scamTrend.recent_30_days);
    expect(prior).toBe(scamTrend.prior_30_days);
    expect(recent).toBe(148);
    expect(prior).toBe(94);
    // The signal card and the KPI tile both quote 148 in prose, and the Risk
    // Signals hero reads its tiles straight off these metrics.
    expect(signals[0].metric_text).toContain('148');
    expect(signals[0].metrics.cases_30d).toBe(recent);
    expect(signals[0].metrics.cases_prior_30d).toBe(prior);
    expect(kpis.kpis.scam_cases.calc).toBeTruthy();
  });

  it('makes each week’s channel split add up to that week’s total', () => {
    for (const w of scamTrend.series) {
      expect(w.digital + w.ach + w.card + w.branch, `week ${w.week}`).toBe(w.total);
    }
  });

  it('derives the growth figure from the series rather than asserting it', () => {
    const expected = Math.round(
      ((scamTrend.recent_30_days - scamTrend.prior_30_days) / scamTrend.prior_30_days) * 100,
    );
    expect(scamTrend.growth_pct).toBe(expected);
  });

  it('quotes one catch rate across the signal, the forecast and the deck', () => {
    // The Risk Signals hero, the forecast exhibit and the KPI tile all state
    // "71% caught before loss". Three files, one number.
    expect(signals[0].metrics.caught_before_loss_pct).toBe(forecast.catch_rate.baseline_pct);
    expect(forecast.catch_rate.response_pct).toBeGreaterThan(forecast.catch_rate.baseline_pct);
    expect(signals[0].metrics.net_loss_ytd_usd).toBe(lossBreakdown.total);
  });

  it('makes the loss breakdown sum to the $612K on the KPI tile', () => {
    const total = lossBreakdown.segments.reduce((n, s) => n + s.amount, 0);
    expect(total).toBe(lossBreakdown.total);
    expect(total).toBe(612000);
  });

  it('keeps coverage arithmetic identical in the trust strip and the coverage fixture', () => {
    const w = trustStrip.widgets.model_coverage;
    expect(coverage.accounts_in_scope).toBe(w.accounts_in_scope);
    expect(coverage.accounts_scored).toBe(w.accounts_scored);
    expect(coverage.coverage_pct).toBe(w.coverage_pct);

    // ...and makes that percentage derivable, not just stated.
    expect(Math.round((w.accounts_scored / w.accounts_in_scope) * 100)).toBe(w.coverage_pct);

    const scoped = coverage.items.reduce((n, i) => n + i.inScope, 0);
    const scored = coverage.items.reduce((n, i) => n + i.scored, 0);
    expect(scoped).toBe(coverage.accounts_in_scope);
    expect(scored).toBe(coverage.accounts_scored);
    for (const item of coverage.items) {
      expect(item.inScope - item.scored, `${item.book} gap`).toBe(item.gap);
    }
  });

  it('keeps the false-positive rate derivable from the queue it describes', () => {
    expect(alertQueue.false_positive_count + alertQueue.fraud_likely_count).toBe(alertQueue.open_total);
    expect(Math.round((alertQueue.false_positive_count / alertQueue.open_total) * 100)).toBe(
      alertQueue.false_positive_pct,
    );
    expect(alertQueue.false_positive_pct).toBe(62);
    expect(alertQueue.alerts).toHaveLength(alertQueue.shown);
  });

  it('gives every alert a movement equal to the ranks it sits between', () => {
    for (const a of alertQueue.alerts) {
      expect(a.rankBefore - a.rankAfter, a.id).toBe(a.movement);
      expect(a.isFalsePositive, a.id).toBe(!a.likelyFraud);
    }
    // The re-rank has to actually re-rank: every fraud-likely alert ends up
    // above every benign one, which is the claim Step 5 makes out loud.
    const worstFraud = Math.max(...alertQueue.alerts.filter((a) => a.likelyFraud).map((a) => a.rankAfter));
    const bestBenign = Math.min(...alertQueue.alerts.filter((a) => !a.likelyFraud).map((a) => a.rankAfter));
    expect(worstFraud).toBeLessThan(bestBenign);
  });

  it('keeps the mule cluster the same size everywhere it is counted', () => {
    const receivers = linkGraph.nodes.filter((n) => n.type === 'receiver');
    const hops = linkGraph.nodes.filter((n) => n.type === 'hop');
    expect(receivers).toHaveLength(linkGraph.repeating_receivers);
    expect(receivers.length + hops.length).toBe(linkGraph.flagged_accounts);
    expect(linkGraph.flagged_accounts).toBe(14);
    // Signal 3 and the Step 6 hold action both name the same cluster.
    expect(signals[2].metric_text).toContain('14');
    expect(response.next_steps.some((s) => s.detail.includes('Nine repeating receivers'))).toBe(true);
  });

  it('leaves no dangling edge in the link graph', () => {
    const ids = new Set(linkGraph.nodes.map((n) => n.id));
    for (const e of linkGraph.edges) {
      expect(ids.has(e.from), `edge from ${e.from}`).toBe(true);
      expect(ids.has(e.to), `edge to ${e.to}`).toBe(true);
    }
    // Every flagged account has to be reachable, or it is drawn floating with
    // no explanation of why it is in the cluster at all.
    const touched = new Set(linkGraph.edges.flatMap((e) => [e.from, e.to]));
    for (const n of linkGraph.nodes) expect(touched.has(n.id), `${n.id} is unconnected`).toBe(true);
  });

  it('resolves every case’s linked accounts to a real graph node', () => {
    const ids = new Set(linkGraph.nodes.map((n) => n.id));
    for (const c of cases.cases) {
      for (const a of c.linkedAccounts) {
        expect(ids.has(a), `${c.id} links to ${a}, which is not in the graph`).toBe(true);
      }
    }
  });

  it('keeps the SAR aging split identical in the trust strip and the SAR queue', () => {
    const w = trustStrip.widgets.open_regulatory;
    expect(sarItems.items).toHaveLength(w.open_count);
    expect(sarItems.open_count).toBe(w.open_count);
    expect(sarItems.on_time_pct).toBe(w.on_time_pct);
    const dueSoon = sarItems.items.filter((s) => s.daysToDeadline <= 7);
    expect(dueSoon).toHaveLength(w.due_within_7_days);
    const byBucket = Object.fromEntries(w.aging.map((b) => [b.bucket, b.count]));
    expect(sarItems.items.filter((s) => s.daysToDeadline <= 7)).toHaveLength(byBucket['Due ≤ 7 days']);
    expect(sarItems.items.filter((s) => s.daysToDeadline > 7 && s.daysToDeadline <= 14)).toHaveLength(
      byBucket['8–14 days'],
    );
    expect(sarItems.items.filter((s) => s.daysToDeadline > 14)).toHaveLength(byBucket['15–30 days']);
  });

  it('makes the forecast’s avoided loss the difference it claims to be', () => {
    const o = forecast.outcome;
    expect(o.baseline_loss - o.response_loss).toBe(o.avoided_loss);
    const projected = forecast.series.filter((p) => p.actual == null);
    expect(projected.reduce((n, p) => n + p.baseline, 0)).toBe(o.baseline_cases);
    expect(projected.reduce((n, p) => n + p.response, 0)).toBe(o.response_cases);
    // The response path can only ever be at or below baseline, or the chart
    // shows the intervention making things worse.
    for (const p of forecast.series) expect(p.response, p.week).toBeLessThanOrEqual(p.baseline);
    // The forecast picks up where the actuals stop, at the last observed week.
    const lastActual = scamTrend.series[scamTrend.series.length - 1];
    const handover = forecast.series.find((p) => p.week === lastActual.week);
    expect(handover?.actual).toBe(lastActual.total);
  });

  it('marks the attrition figure as industry, never as an ESFCU measurement', () => {
    expect(kpis.kpis.attrition_after_fraud.provenance).toBe('industry');
    expect(forecast.attrition.provenance).toBe('industry');
    expect(forecast.attrition.relative_uplift_pct).toBe(31);
    const fig = lineage.figures.find((f) => f.id === 'attrition_after_fraud');
    expect(fig?.warning).toContain('ESFCU has not measured');
    // It is the only non-illustrative figure the CRO carries. If a second one
    // appears, it needs the same scrutiny rather than inheriting this pass.
    const nonIllustrative = Object.entries(kpis.kpis).filter(([, v]) => v.provenance !== 'illustrative');
    expect(nonIllustrative.map(([k]) => k)).toEqual(['attrition_after_fraud']);
  });

  it('gives every KPI a provenance the pill can render', () => {
    for (const [id, k] of Object.entries(kpis.kpis)) {
      expect(['esfcu', 'industry', 'illustrative'], id).toContain(k.provenance);
      expect(k.sourceCitation, id).toBeTruthy();
      expect(k.sourceLabel, id).toBeTruthy();
      expect(k.target, id).toBeTruthy();
      expect(k.calc, id).toBeTruthy();
    }
  });

  it('gives every signal the action §6 requires and a severity the cards render', () => {
    expect(signals).toHaveLength(5);
    for (const s of signals) {
      expect(['critical', 'warning', 'info'], s.id).toContain(s.severity);
      expect(s.action, s.id).toBeTruthy();
      expect(s.confidence?.score, s.id).toBeGreaterThan(0);
    }
    // §6's shape: one hero risk, a trust concern, an anomaly, an efficiency
    // opportunity and a compliance item — so exactly one critical.
    expect(signals.filter((s) => s.severity === 'critical')).toHaveLength(1);
  });

  it('names the stalled feed in the data-source list it is stalled in', () => {
    const stalled = trustStrip.widgets.feed_freshness.sources.filter((s) => s.state === 'critical');
    expect(stalled).toHaveLength(1);
    const partial = dataSources.filter((d) => d.status === 'partial');
    expect(partial.map((d) => d.name)).toContain(stalled[0].name);
  });

  it('marks exactly one response option recommended and gives every step an owner', () => {
    expect(response.options.filter((o) => o.recommended)).toHaveLength(1);
    for (const o of response.options) expect(o.attributes, o.id).toHaveLength(3);
    for (const s of response.next_steps) {
      expect(s.owner, `step ${s.n}`).toBeTruthy();
      expect(s.timeframe, `step ${s.n}`).toBeTruthy();
    }
    expect(response.next_steps.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('gives every lineage chain an end the CRO can act on', () => {
    for (const f of lineage.figures) {
      expect(f.chain.length, f.id).toBeGreaterThan(1);
      const last = f.chain[f.chain.length - 1];
      // The final stage says either "safe to cite" or why it is not. A chain
      // that just stops is the failure this whole surface exists to prevent.
      expect(last.note, f.id).toMatch(/cite|Cite|BLOCKED/);
      if (f.warning) expect(last.note, `${f.id} is warned but its chain reads clean`).not.toMatch(/^Safe to cite/);
    }
  });
});
