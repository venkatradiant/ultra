import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Gauge, GitMerge, AlertTriangle } from 'lucide-react';
import { STATE_COLOR } from '../tokens';
import { RibbonGauge, RibbonBig } from '../shared/DataTrustStrip';
import { RibbonIcons, STATE_WORD } from '../shared/trustTokens';

/**
 * The CEO's four trust widgets (spec §13), as descriptors for the shared strip.
 *
 * This is where ESFCU's CEO diverges from USSFCU's: the fourth tile is POST-
 * MERGER RECONCILIATION, not lineage-on-demand. Lineage is still one click away
 * — it is the *action* on the reconciliation tile, which is exactly where a CEO
 * reaches for it: the figure he cannot yet cite.
 */

const STATE_ICON = {
  good: (props) => <ShieldCheck {...props} />,
  warning: (props) => <AlertTriangle {...props} />,
  critical: (props) => <AlertTriangle {...props} />,
};

const ceoWidgets = [
  {
    key: 'pipeline_health',
    icon: Activity,
    name: 'Pipeline & Freshness',
    nameRoomy: 'Pipeline & Data Freshness',
    nameCompact: 'Pipeline',
    ribbonTitle: 'Pipeline & freshness',
    ribbonIcon: RibbonIcons.pipeline,
    state: (w) => w.pipeline_health.state,
    value: (w) => w.pipeline_health.summary,
    valueCompact: (w) => {
      const src = w.pipeline_health.sources || [];
      const stalled = src.filter((s) => s.state === 'critical').length;
      return `${src.length - stalled}/${src.length} loaded`;
    },
    subRoomy: (w) => w.pipeline_health.detail,
    body: (w) => (
      <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
        {w.pipeline_health.sources.map((s) => {
          const Icon = STATE_ICON[s.state] || STATE_ICON.good;
          return (
            <div key={s.name} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 min-w-0">
                <Icon className="w-3 h-3 flex-shrink-0" style={{ color: STATE_COLOR[s.state] || STATE_COLOR.good }} />
                <span className="text-[11px] text-text-muted truncate">{s.name}</span>
              </span>
              <span className="text-[10px] text-text-subtle tabular-nums flex-shrink-0">
                {s.loaded_at}{s.note ? ` · ${s.note}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    ),
    ribbon: (w) => {
      const sources = w.pipeline_health.sources || [];
      const loaded = sources.filter((s) => s.state !== 'critical').length;
      return (
        <>
          {/* The count alone was colour-coded and wordless. The state word rides
              with it so the tile still reads correctly in greyscale, in print,
              and to anyone who cannot separate the green from the amber. */}
          <RibbonBig state={w.pipeline_health.state}>{loaded} / {sources.length}</RibbonBig>
          <div className="st">{w.pipeline_health.detail}</div>
          <div className="srcl"><span className="d" />{sources.slice(0, 3).map((s) => s.name).join(' · ')}</div>
        </>
      );
    },
  },
  {
    key: 'post_merger_reconciliation',
    icon: GitMerge,
    name: 'Post-Merger Reconciliation',
    nameCompact: 'Reconciliation',
    ribbonTitle: 'Post-merger reconciliation',
    ribbonIcon: RibbonIcons.recon,
    traceable: true,
    hint: 'Trace the figure to source',
    hintCompact: 'Trace to source',
    state: (w) => w.post_merger_reconciliation.state,
    value: (w) => w.post_merger_reconciliation.summary,
    valueCompact: (w) => w.post_merger_reconciliation.status_label,
    subRoomy: (w) => w.post_merger_reconciliation.detail,
    highlight: (w) => ({
      value: w.post_merger_reconciliation.cite_warning,
      sub: `${w.post_merger_reconciliation.summary} — ${w.post_merger_reconciliation.detail}`,
    }),
    body: (w) => (
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3">
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
          <AlertTriangle className="h-3 w-3" />
          {w.post_merger_reconciliation.cite_warning}
        </span>
        <span className="text-[10px] text-text-subtle">{w.post_merger_reconciliation.figure} · Howard University division</span>
      </div>
    ),
    ribbon: (w) => (
      <>
        <div className="big"><span className="warn">{w.post_merger_reconciliation.status_label}</span></div>
        <div className="st">{w.post_merger_reconciliation.summary}. {w.post_merger_reconciliation.cite_warning}.</div>
        <div className="srcl" style={{ marginTop: 12 }}><span className="d" />Enterprise DW vs division ledger</div>
      </>
    ),
  },
  {
    key: 'open_audit_issues',
    icon: ShieldCheck,
    name: 'Open Audit & Exam',
    nameRoomy: 'Open Audit & Exam Issues',
    nameCompact: 'Audit',
    ribbonTitle: 'Open audit & exam issues',
    ribbonIcon: RibbonIcons.audit,
    state: (w) => w.open_audit_issues.state,
    value: (w) => w.open_audit_issues.summary,
    valueCompact: (w) => `${w.open_audit_issues.open_count} open`,
    subRoomy: (w) => w.open_audit_issues.detail,
    ribbon: (w) => (
      <>
        <RibbonBig state={w.open_audit_issues.state} suffix={`open · ${STATE_WORD[w.open_audit_issues.state]}`}>
          {w.open_audit_issues.open_count}
        </RibbonBig>
        <div className="st">{w.open_audit_issues.detail}</div>
      </>
    ),
  },
  {
    key: 'ncua_exam_readiness',
    icon: Gauge,
    name: 'NCUA Exam Readiness',
    nameCompact: 'NCUA',
    ribbonTitle: 'NCUA exam readiness',
    ribbonIcon: RibbonIcons.ncua,
    state: (w) => w.ncua_exam_readiness.state,
    value: (w) => `${w.ncua_exam_readiness.score} / 100`,
    valueCompact: (w) => `${w.ncua_exam_readiness.score}/100`,
    sub: (w) => w.ncua_exam_readiness.status_label,
    subRoomy: (w) =>
      `${w.ncua_exam_readiness.status_label} · Next window ${w.ncua_exam_readiness.next_window} · ${w.ncua_exam_readiness.detail}`,
    cardBody: (w) => (
      <div className="mt-1.5 h-1 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${w.ncua_exam_readiness.score}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-full rounded-full bg-brand"
        />
      </div>
    ),
    body: (w) => (
      <div className="mt-3 h-2 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${w.ncua_exam_readiness.score}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-full rounded-full bg-brand"
        />
      </div>
    ),
    ribbon: (w) => (
      <RibbonGauge
        score={w.ncua_exam_readiness.score}
        caption={
          <>
            {w.ncua_exam_readiness.status_label} posture. Next window <b style={{ color: '#cddcea' }}>{w.ncua_exam_readiness.next_window}</b>.
          </>
        }
      />
    ),
  },
];

export default ceoWidgets;
