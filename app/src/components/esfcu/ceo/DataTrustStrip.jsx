import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Gauge, GitMerge, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import trust from '../../../data/esfcu/ceo/trustStrip.json';
import LineageTraceModal from './LineageTraceModal';
import { ACCENT_SOFT, STATE_COLOR } from './tokens';

// ─── Data Trust Strip (ESFCU) ─────────────────────────────────────
// Forked from the USSFCU CEO build. First-class governance surface, rendered in
// both Conversation Mode (card / compact / expanded) and Presentation Mode
// (variant="ribbon" — the full-width navy assurance ribbon), all from the SAME
// trustStrip.json so the two modes can never disagree.
//
// Spec §13 names four widgets, and this is where ESFCU diverges from USSFCU:
// the fourth tile is POST-MERGER RECONCILIATION, not lineage-on-demand. Lineage
// is still one click away — it is the action on the reconciliation tile, which
// is exactly where a CEO reaches for it: the figure he cannot yet cite.
//
// Status is ALWAYS text-plus-icon, never colour alone.

// Warm-stroked ribbon icons (Presentation Mode).
const RibbonIcons = {
  pipeline: <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_SOFT} strokeWidth="2"><path d="M5 12l4 4L19 6" /></svg>,
  recon: <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_SOFT} strokeWidth="2"><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /><path d="M9 7h4a3 3 0 013 3v4" /></svg>,
  audit: <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_SOFT} strokeWidth="2"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" /></svg>,
  ncua: <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_SOFT} strokeWidth="2"><path d="M12 3a9 9 0 109 9" /><path d="M12 12l5-3" /></svg>,
};

// Presentation Mode ribbon. Uses the scoped .trust/.tw classes defined in
// presentation.css, which only exist inside .esfcu-pm-root.
function TrustRibbon({ onTrace }) {
  const w = trust.widgets;
  const validatedTime = trust.validated_at?.slice(11, 16);
  const sources = w.pipeline_health.sources || [];
  const loaded = sources.filter((s) => s.state !== 'critical').length;
  const R = 26;
  const CIRC = 2 * Math.PI * R;
  const score = w.ncua_exam_readiness.score;
  const dash = (score / 100) * CIRC;
  const recon = w.post_merger_reconciliation;

  return (
    <div className="trust">
      <div className="tw">
        <div className="ic">{RibbonIcons.pipeline}</div>
        <div className="th">Pipeline &amp; freshness</div>
        <div className="big good">{loaded} / {sources.length}</div>
        <div className="st">
          Six sources loaded and reconciled at <b style={{ color: '#cddcea' }}>{validatedTime} ET</b>. The Howard University
          division nightly job stalled — shown, not hidden.
        </div>
        <div className="srcl"><span className="d" />{sources.slice(0, 3).map((s) => s.name).join(' · ')}</div>
      </div>

      <div
        className="tw"
        onClick={onTrace}
        role={onTrace ? 'button' : undefined}
        style={onTrace ? { cursor: 'pointer' } : undefined}
      >
        <div className="ic">{RibbonIcons.recon}</div>
        <div className="th">Post-merger reconciliation</div>
        <div className="big"><span className="warn">{recon.status_label}</span></div>
        <div className="st">{recon.summary}. {recon.cite_warning}.</div>
        <div className="srcl" style={{ marginTop: 12 }}><span className="d" />Enterprise DW vs division ledger</div>
      </div>

      <div className="tw">
        <div className="ic">{RibbonIcons.audit}</div>
        <div className="th">Open audit &amp; exam issues</div>
        <div className="big"><span className="good">{w.open_audit_issues.open_count}</span> <span style={{ fontSize: 15, color: '#93aabf' }}>open</span></div>
        <div className="st">{w.open_audit_issues.detail}</div>
      </div>

      <div className="tw">
        <div className="ic">{RibbonIcons.ncua}</div>
        <div className="th">NCUA exam readiness</div>
        <div className="gw">
          <svg width="74" height="74" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r={R} fill="none" stroke="#04223c" strokeWidth="7" />
            <circle cx="32" cy="32" r={R} fill="none" stroke={ACCENT_SOFT} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${dash.toFixed(1)} ${(CIRC - dash).toFixed(1)}`} transform="rotate(-90 32 32)" />
            <text x="32" y="38" textAnchor="middle" fontFamily="Fraunces" fontSize="19" fontWeight="600" fill="#fff">{score}</text>
          </svg>
          <div className="st" style={{ marginTop: 0 }}>
            {w.ncua_exam_readiness.status_label} posture. Next window <b style={{ color: '#cddcea' }}>{w.ncua_exam_readiness.next_window}</b>.
          </div>
        </div>
      </div>
    </div>
  );
}

const STATE = {
  good: { label: 'Good', color: STATE_COLOR.good, bg: 'bg-[#00897B]/10', text: 'text-[#00897B]', Icon: CheckCircle2 },
  warning: { label: 'Attention', color: STATE_COLOR.warning, bg: 'bg-[#B45309]/10', text: 'text-[#B45309]', Icon: AlertTriangle },
  critical: { label: 'Critical', color: STATE_COLOR.critical, bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', Icon: AlertTriangle },
};

function StatePill({ state }) {
  const s = STATE[state] || STATE.good;
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[9.5px] font-semibold px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>
      <Icon className="w-2.5 h-2.5" />
      {s.label}
    </span>
  );
}

function WidgetTile({ icon: Icon, name, value, sub, state, children, onClick, hint, roomy = false }) {
  const clickable = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={`rounded-xl bg-surface border border-border-subtle flex flex-col ${roomy ? 'p-4' : 'p-2.5'} ${clickable ? 'cursor-pointer hover:border-brand/25 transition-colors duration-200' : ''}`}
    >
      <div className={`flex items-center justify-between gap-2 ${roomy ? 'mb-2.5' : 'mb-1.5'}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className={`flex-shrink-0 text-brand ${roomy ? 'w-3.5 h-3.5' : 'w-3 h-3'}`} />
          <p className={`font-semibold text-text-subtle uppercase tracking-wide truncate ${roomy ? 'text-[9.5px] tracking-[0.08em]' : 'text-[8.5px]'}`}>{name}</p>
        </div>
        <StatePill state={state} />
      </div>
      <p className={`font-bold text-text leading-tight ${roomy ? 'text-[15px]' : 'text-[13px]'}`}>{value}</p>
      {sub ? <p className={`text-text-subtle ${roomy ? 'text-[11px] mt-1.5 leading-relaxed' : 'text-[9.5px] mt-0.5 leading-snug'}`}>{sub}</p> : null}
      {children}
      {hint ? <p className={`inline-flex items-center gap-1 font-semibold text-brand ${roomy ? 'mt-3 text-[10px]' : 'mt-1.5 text-[9.5px]'}`}>{hint} <span aria-hidden>→</span></p> : null}
    </div>
  );
}

// Compact chip for the in-conversation strip — icon + short value, low weight.
function CompactStat({ name, value, state, onClick }) {
  const s = STATE[state] || STATE.good;
  const Icon = s.Icon;
  const clickable = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      title={`${name} · ${value}`}
      className={`flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2 py-1.5 min-w-0 ${clickable ? 'cursor-pointer hover:border-brand/30' : ''}`}
    >
      <Icon className="h-3 w-3 flex-shrink-0" style={{ color: s.color }} />
      <div className="min-w-0 leading-tight">
        <p className="text-[8px] font-semibold uppercase tracking-wide text-text-subtle truncate">{name}</p>
        <p className="text-[10px] font-semibold text-text-muted truncate">{value}</p>
      </div>
    </div>
  );
}

export default function DataTrustStrip({ expanded = false, compact = false, variant = 'card', onTrace }) {
  const w = trust.widgets;
  const recon = w.post_merger_reconciliation;
  const validatedTime = trust.validated_at?.slice(11, 16);
  const [traceOpen, setTraceOpen] = useState(false);
  // The consolidated figure is the one Girado cannot cite yet, so it is the one
  // the trace opens on.
  const openTrace = () => setTraceOpen(true);

  if (variant === 'ribbon') return <TrustRibbon onTrace={onTrace} />;

  if (compact) {
    const src = w.pipeline_health.sources || [];
    const stalled = src.filter((s) => s.state === 'critical').length;
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl border border-border bg-gray-50/70 px-3 py-2.5"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 flex-shrink-0 text-brand/70" />
            <span className="text-[9.5px] font-semibold uppercase tracking-wide text-text-muted">Data Trust</span>
            <span className="text-[10px] font-bold tabular-nums text-[#00897B]">{trust.data_trust_score}%</span>
          </div>
          <span className="inline-flex flex-shrink-0 items-center gap-1 text-[9px] text-text-subtle">
            <Clock className="h-2.5 w-2.5" /> Validated {validatedTime} ET
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <CompactStat name="Pipeline" value={`${src.length - stalled}/${src.length} loaded`} state={w.pipeline_health.state} />
          <CompactStat name="Reconciliation" value={recon.status_label} state={recon.state} onClick={openTrace} />
          <CompactStat name="Audit" value={`${w.open_audit_issues.open_count} open`} state={w.open_audit_issues.state} />
          <CompactStat name="NCUA" value={`${w.ncua_exam_readiness.score}/100`} state={w.ncua_exam_readiness.state} />
        </div>
        <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="consolidated_deposits" />
      </motion.div>
    );
  }

  if (expanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-brand/10 bg-brand/[0.02] p-4"
      >
        <div className="mb-3.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-brand" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand">Data Trust Strip</span>
          </div>
          <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-[10px] font-semibold text-text-muted">
            <span className="font-bold tabular-nums text-[#00897B]">{trust.data_trust_score}%</span>
            <span className="text-text-subtle">·</span>
            <Clock className="h-2.5 w-2.5" /> Validated {validatedTime} ET
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          <WidgetTile
            roomy
            icon={Activity}
            name="Pipeline & Data Freshness"
            value={w.pipeline_health.summary}
            sub={w.pipeline_health.detail}
            state={w.pipeline_health.state}
          >
            <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
              {w.pipeline_health.sources.map((s) => {
                const st = STATE[s.state] || STATE.good;
                const Icon = st.Icon;
                return (
                  <div key={s.name} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Icon className="w-3 h-3 flex-shrink-0" style={{ color: st.color }} />
                      <span className="text-[11px] text-text-muted truncate">{s.name}</span>
                    </span>
                    <span className="text-[10px] text-text-subtle tabular-nums flex-shrink-0">
                      {s.loaded_at}{s.note ? ` · ${s.note}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </WidgetTile>

          <WidgetTile
            roomy
            icon={GitMerge}
            name="Post-Merger Reconciliation"
            value={recon.summary}
            sub={recon.detail}
            state={recon.state}
            onClick={openTrace}
            hint="Trace the figure to source"
          >
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
                <AlertTriangle className="h-3 w-3" />
                {recon.cite_warning}
              </span>
              <span className="text-[10px] text-text-subtle">{recon.figure} · Howard University division</span>
            </div>
          </WidgetTile>

          <WidgetTile
            roomy
            icon={ShieldCheck}
            name="Open Audit & Exam Issues"
            value={w.open_audit_issues.summary}
            sub={w.open_audit_issues.detail}
            state={w.open_audit_issues.state}
          />

          <WidgetTile
            roomy
            icon={Gauge}
            name="NCUA Exam Readiness"
            value={`${w.ncua_exam_readiness.score} / 100`}
            sub={`${w.ncua_exam_readiness.status_label} · Next window ${w.ncua_exam_readiness.next_window} · ${w.ncua_exam_readiness.detail}`}
            state={w.ncua_exam_readiness.state}
          >
            <div className="mt-3 h-2 rounded-full bg-surface-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${w.ncua_exam_readiness.score}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full rounded-full bg-brand"
              />
            </div>
          </WidgetTile>
        </div>
        <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="consolidated_deposits" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-brand/10 bg-brand/[0.02] p-3"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-brand" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-brand">Data Trust Strip</span>
        </div>
        <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-[10px] font-semibold text-text-muted">
          <span className="font-bold tabular-nums text-[#00897B]">{trust.data_trust_score}%</span>
          <span className="text-text-subtle">·</span>
          <Clock className="h-2.5 w-2.5" /> Validated {validatedTime} ET
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <WidgetTile
          icon={Activity}
          name="Pipeline & Freshness"
          value={w.pipeline_health.summary}
          state={w.pipeline_health.state}
        />

        <WidgetTile
          icon={GitMerge}
          name="Post-Merger Reconciliation"
          value={recon.summary}
          state={recon.state}
          onClick={openTrace}
          hint="Trace to source"
        />

        <WidgetTile
          icon={ShieldCheck}
          name="Open Audit & Exam"
          value={w.open_audit_issues.summary}
          state={w.open_audit_issues.state}
        />

        <WidgetTile
          icon={Gauge}
          name="NCUA Exam Readiness"
          value={`${w.ncua_exam_readiness.score} / 100`}
          sub={w.ncua_exam_readiness.status_label}
          state={w.ncua_exam_readiness.state}
        >
          <div className="mt-1.5 h-1 rounded-full bg-surface-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${w.ncua_exam_readiness.score}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-full rounded-full bg-brand"
            />
          </div>
        </WidgetTile>
      </div>

      <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="consolidated_deposits" />
    </motion.div>
  );
}
