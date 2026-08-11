import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Gauge, Radar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { STATE_COLOR } from '../tokens';
import { RibbonGauge, RibbonBig } from '../shared/DataTrustStrip';
import { RibbonIcons, STATE_WORD } from '../shared/trustTokens';

/**
 * The CRO's four trust widgets (spec §13's risk-persona list): feed freshness,
 * fraud-model coverage, open regulatory items, and exam readiness.
 *
 * Two of them are the CEO's shapes wearing different content — freshness maps
 * onto his pipeline tile, exam readiness onto his NCUA gauge. The other two do
 * not: coverage is a share of a population with a named gap, and SAR aging is a
 * deadline queue. That is why the strip takes descriptors rather than data.
 *
 * The tile that carries the demo is coverage. It is the one figure Renata
 * cannot put in front of the supervisory committee, and spec §10 Step 3 turns
 * that from a detail line into the headline mid-conversation.
 */

const STATE_ICON = { good: CheckCircle2, warning: AlertTriangle, critical: AlertTriangle };

const croWidgets = [
  {
    key: 'feed_freshness',
    icon: Activity,
    name: 'Feed Freshness',
    nameRoomy: 'Data Freshness by Source',
    nameCompact: 'Feeds',
    ribbonTitle: 'Data freshness by source',
    ribbonIcon: RibbonIcons.pipeline,
    state: (w) => w.feed_freshness.state,
    value: (w) => w.feed_freshness.summary,
    valueCompact: (w) => {
      const src = w.feed_freshness.sources || [];
      const stalled = src.filter((s) => s.state === 'critical').length;
      return `${src.length - stalled}/${src.length} current`;
    },
    subRoomy: (w) => w.feed_freshness.detail,
    body: (w) => (
      <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
        {w.feed_freshness.sources.map((s) => {
          const Icon = STATE_ICON[s.state] || STATE_ICON.good;
          return (
            <div key={s.name} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <Icon className="h-3 w-3 flex-shrink-0" style={{ color: STATE_COLOR[s.state] || STATE_COLOR.good }} />
                <span className="truncate text-[11px] text-text-muted">{s.name}</span>
              </span>
              <span className="flex-shrink-0 text-[10px] tabular-nums text-text-subtle">
                {s.loaded_at}{s.note ? ` · ${s.note}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    ),
    ribbon: (w) => {
      const sources = w.feed_freshness.sources || [];
      const current = sources.filter((s) => s.state !== 'critical').length;
      return (
        <>
          <RibbonBig state={w.feed_freshness.state}>{current} / {sources.length}</RibbonBig>
          <div className="st">{w.feed_freshness.detail}</div>
          <div className="srcl"><span className="d" />{sources.slice(0, 3).map((s) => s.name).join(' · ')}</div>
        </>
      );
    },
  },
  {
    key: 'model_coverage',
    icon: Radar,
    name: 'Fraud-Model Coverage',
    nameCompact: 'Coverage',
    ribbonTitle: 'Fraud-model coverage',
    ribbonIcon: RibbonIcons.coverage,
    traceable: true,
    hint: 'Trace the coverage figure to source',
    hintCompact: 'Trace to source',
    state: (w) => w.model_coverage.state,
    value: (w) => w.model_coverage.summary,
    valueCompact: (w) => w.model_coverage.status_label,
    subRoomy: (w) => w.model_coverage.detail,
    // Spec §10 Step 3: "trust strip updates: fraud-model coverage shows
    // 'Howard University pending, reconcile before you cite this'". The state
    // was already pending on first load, so what the step owes is a visible
    // change, not a data one — the warning is promoted to the headline.
    highlight: (w) => ({
      value: w.model_coverage.cite_warning,
      sub: `${w.model_coverage.summary} — ${w.model_coverage.detail}`,
    }),
    body: (w) => (
      <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
        {w.model_coverage.breakdown.map((b) => (
          <div key={b.book}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate text-[11px] text-text-muted">{b.book}</span>
              <span className="flex-shrink-0 text-[10px] font-semibold tabular-nums" style={{ color: STATE_COLOR[b.state] }}>
                {b.pct}% scored
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${b.pct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: STATE_COLOR[b.state] }}
              />
            </div>
            <p className="mt-0.5 text-[9.5px] tabular-nums text-text-subtle">
              {b.scored.toLocaleString()} of {b.in_scope.toLocaleString()} accounts
            </p>
          </div>
        ))}
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
          <AlertTriangle className="h-3 w-3" />
          {w.model_coverage.cite_warning}
        </span>
      </div>
    ),
    ribbon: (w) => (
      <>
        <div className="big"><span className="warn">{w.model_coverage.coverage_pct}%</span> <span style={{ fontSize: 15, color: '#93aabf' }}>scored</span></div>
        <div className="st">{w.model_coverage.summary}. {w.model_coverage.cite_warning}.</div>
        <div className="srcl" style={{ marginTop: 12 }}><span className="d" />Fraud-scoring model vs account master</div>
      </>
    ),
  },
  {
    key: 'open_regulatory',
    icon: ShieldCheck,
    name: 'Open Regulatory',
    nameRoomy: 'Open Regulatory Items',
    nameCompact: 'SARs',
    ribbonTitle: 'Open regulatory items',
    ribbonIcon: RibbonIcons.sar,
    state: (w) => w.open_regulatory.state,
    value: (w) => w.open_regulatory.summary,
    valueCompact: (w) => `${w.open_regulatory.open_count} open`,
    subRoomy: (w) => w.open_regulatory.detail,
    body: (w) => (
      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border-subtle pt-3">
        {w.open_regulatory.aging.map((b) => (
          <span
            key={b.bucket}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold"
            style={{ color: STATE_COLOR[b.state], background: `${STATE_COLOR[b.state]}14` }}
          >
            {b.count} · {b.bucket}
          </span>
        ))}
      </div>
    ),
    ribbon: (w) => (
      <>
        <RibbonBig state={w.open_regulatory.state} suffix={`open · ${STATE_WORD[w.open_regulatory.state]}`}>
          {w.open_regulatory.open_count}
        </RibbonBig>
        <div className="st">{w.open_regulatory.detail}</div>
      </>
    ),
  },
  {
    key: 'exam_readiness',
    icon: Gauge,
    name: 'NCUA & BSA Readiness',
    nameCompact: 'Exam',
    ribbonTitle: 'NCUA & BSA exam readiness',
    ribbonIcon: RibbonIcons.ncua,
    state: (w) => w.exam_readiness.state,
    value: (w) => `${w.exam_readiness.score} / 100`,
    valueCompact: (w) => `${w.exam_readiness.score}/100`,
    sub: (w) => w.exam_readiness.status_label,
    subRoomy: (w) =>
      `${w.exam_readiness.status_label} · Next window ${w.exam_readiness.next_window} · ${w.exam_readiness.detail}`,
    cardBody: (w) => (
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${w.exam_readiness.score}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-full rounded-full bg-brand"
        />
      </div>
    ),
    body: (w) => (
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${w.exam_readiness.score}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-full rounded-full bg-brand"
        />
      </div>
    ),
    ribbon: (w) => (
      <RibbonGauge
        score={w.exam_readiness.score}
        caption={
          <>
            {w.exam_readiness.status_label} posture. Next window <b style={{ color: '#cddcea' }}>{w.exam_readiness.next_window}</b>.
          </>
        }
      />
    ),
  },
];

export default croWidgets;
