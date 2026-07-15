import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Gauge, Route, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import trust from '../../../data/ussfcu/ceo/trustStrip.json';
import LineageTraceModal from './LineageTraceModal';
import { askProps } from './presentation/askAbout';

// ─── Data Trust Strip ─────────────────────────────────────────────
// First-class, reusable governance surface. Renders in both Conversation Mode
// (default card grid) and Presentation Mode (variant="ribbon" — the full-width
// navy board ribbon on the assurance slide), from the SAME trustStrip.json.
// Status is ALWAYS text-plus-icon, never color alone. Pass `expanded` to reveal
// the per-source pipeline detail (Step 4).

// Gold-stroked ribbon icons (Presentation Mode), matching the approved mockup.
const RibbonIcons = {
  pipeline: <svg viewBox="0 0 24 24" fill="none" stroke="#E4CE96" strokeWidth="2"><path d="M5 12l4 4L19 6" /></svg>,
  audit: <svg viewBox="0 0 24 24" fill="none" stroke="#E4CE96" strokeWidth="2"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" /></svg>,
  ncua: <svg viewBox="0 0 24 24" fill="none" stroke="#E4CE96" strokeWidth="2"><path d="M12 3a9 9 0 109 9" /><path d="M12 12l5-3" /></svg>,
  lineage: <svg viewBox="0 0 24 24" fill="none" stroke="#E4CE96" strokeWidth="2"><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /><path d="M9 7h4a3 3 0 013 3v4" /></svg>,
};

// Presentation Mode ribbon. Uses the scoped .trust/.tw classes (defined in
// presentation.css and only present inside .pm-root). onTrace (optional) makes
// the Lineage-on-Demand widget open the deck's lineage overlay.
function TrustRibbon({ onTrace }) {
  const w = trust.widgets;
  const validatedTime = trust.validated_at?.slice(11, 16);
  const sources = w.pipeline_health.sources || [];
  const loaded = sources.filter((s) => s.state !== 'critical').length;
  const R = 26;
  const CIRC = 2 * Math.PI * R;
  const score = w.ncua_exam_readiness.score;
  const dash = (score / 100) * CIRC;

  return (
    <div className="trust">
      <div {...askProps('assur_pipeline', 'tw')}>
        <div className="ic">{RibbonIcons.pipeline}</div>
        <div className="th">Pipeline health</div>
        <div className="big good">{loaded} / {sources.length}</div>
        <div className="st">All sources loaded and reconciled at <b style={{ color: '#cddcea' }}>{validatedTime} ET</b>. Barafin loaded 41 min late; one dependent figure held for reconciliation.</div>
        <div className="srcl"><span className="d" />{sources.slice(0, 3).map((s) => s.name).join(' · ')}</div>
      </div>
      <div {...askProps('assur_exception', 'tw')}>
        <div className="ic">{RibbonIcons.audit}</div>
        <div className="th">Open audit issues</div>
        <div className="big"><span className="good">{w.open_audit_issues.open_count}</span> <span style={{ fontSize: 15, color: '#93aabf' }}>open</span></div>
        <div className="st">{w.open_audit_issues.detail}</div>
      </div>
      <div {...askProps('assur_ncua', 'tw')}>
        <div className="ic">{RibbonIcons.ncua}</div>
        <div className="th">NCUA exam readiness</div>
        <div className="gw">
          <svg width="74" height="74" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r={R} fill="none" stroke="#0a2540" strokeWidth="7" />
            <circle cx="32" cy="32" r={R} fill="none" stroke="#7fd3a6" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${dash.toFixed(1)} ${(CIRC - dash).toFixed(1)}`} transform="rotate(-90 32 32)" />
            <text x="32" y="38" textAnchor="middle" fontFamily="Fraunces" fontSize="19" fontWeight="600" fill="#fff">{score}</text>
          </svg>
          <div className="st" style={{ marginTop: 0 }}>{w.ncua_exam_readiness.status_label} posture. Next window <b style={{ color: '#cddcea' }}>{w.ncua_exam_readiness.next_window}</b>.</div>
        </div>
      </div>
      <div
        className="tw"
        onClick={onTrace}
        role={onTrace ? 'button' : undefined}
        style={onTrace ? { cursor: 'pointer' } : undefined}
      >
        <div className="ic">{RibbonIcons.lineage}</div>
        <div className="th">Lineage on demand</div>
        <div className="st" style={{ marginTop: 2 }}>Click any figure to trace its path.</div>
        <div className="tlin">
          {(w.lineage_on_demand.example_path || []).slice(0, 3).map((node, i, arr) => (
            <span key={node} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="tlchip">{node.replace(/\s*\(.*\)$/, '')}</span>
              {i < arr.length - 1 ? <span className="larrow" style={{ color: 'var(--gold-soft)' }}>&rarr;</span> : null}
            </span>
          ))}
        </div>
        <div className="srcl" style={{ marginTop: 12 }}><span className="d" />Full path, source to screen</div>
      </div>
    </div>
  );
}

const STATE = {
  good: { label: 'Good', color: '#00897B', bg: 'bg-[#00897B]/10', text: 'text-[#00897B]', Icon: CheckCircle2 },
  warning: { label: 'Warning', color: '#F59E0B', bg: 'bg-[#F59E0B]/10', text: 'text-[#B45309]', Icon: AlertTriangle },
  critical: { label: 'Critical', color: '#DC2626', bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', Icon: AlertTriangle },
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

// Compact chip for the in-conversation strip — icon + short value, low visual weight.
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
  const validatedTime = trust.validated_at?.slice(11, 16);
  const [traceOpen, setTraceOpen] = useState(false);

  // Presentation Mode — full-width navy ribbon (same data, board-ready styling).
  if (variant === 'ribbon') return <TrustRibbon onTrace={onTrace} />;

  // In-conversation — compact, low-key summary. The full briefing already carries
  // the prominent strip, so here we only surface the main info in a tight footprint.
  if (compact) {
    const src = w.pipeline_health.sources || [];
    const lateCount = src.filter((s) => s.state !== 'good').length;
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
          <CompactStat name="Pipeline" value={`${src.length}/${src.length} · ${lateCount} late`} state={w.pipeline_health.state} />
          <CompactStat name="Audit" value={`${w.open_audit_issues.open_count} open`} state={w.open_audit_issues.state} />
          <CompactStat name="NCUA" value={`${w.ncua_exam_readiness.score}/100`} state={w.ncua_exam_readiness.state} />
          <CompactStat name="Lineage" value="Trace a figure" state={w.lineage_on_demand.state} onClick={() => setTraceOpen(true)} />
        </div>
        <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="loan_to_share" />
      </motion.div>
    );
  }

  // In-conversation (detailed) — the fuller data view: per-source pipeline load
  // times, the lineage path, and each widget's full detail. Used for the
  // "Can I trust these numbers this morning?" assurance answer.
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
            name="Pipeline Health"
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
            icon={ShieldCheck}
            name="Open Audit Issues"
            value={w.open_audit_issues.summary}
            sub={w.open_audit_issues.detail}
            state={w.open_audit_issues.state}
          />

          <WidgetTile
            roomy
            icon={Gauge}
            name="NCUA Exam Readiness"
            value={`${w.ncua_exam_readiness.score} / 100`}
            sub={`${w.ncua_exam_readiness.status_label} · Next window ${w.ncua_exam_readiness.next_window}`}
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

          <WidgetTile
            roomy
            icon={Route}
            name="Lineage on Demand"
            value={w.lineage_on_demand.summary}
            sub={w.lineage_on_demand.detail}
            state={w.lineage_on_demand.state}
            onClick={() => setTraceOpen(true)}
            hint="Trace a figure"
          >
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border-subtle pt-3">
              {w.lineage_on_demand.example_path.map((node, i) => (
                <span key={node} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-brand bg-brand/[0.06] px-2 py-1 rounded-md">{node}</span>
                  {i < w.lineage_on_demand.example_path.length - 1 ? <span className="text-text-subtle text-[10px]">→</span> : null}
                </span>
              ))}
            </div>
          </WidgetTile>
        </div>
        <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="loan_to_share" />
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
      {/* Simple header — label + score inline */}
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

      {/* Governance widgets — compact, main info only */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <WidgetTile
          icon={Activity}
          name="Pipeline Health"
          value={w.pipeline_health.summary}
          state={w.pipeline_health.state}
        />

        <WidgetTile
          icon={ShieldCheck}
          name="Open Audit Issues"
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

        <WidgetTile
          icon={Route}
          name="Lineage on Demand"
          value={w.lineage_on_demand.summary}
          state={w.lineage_on_demand.state}
          onClick={() => setTraceOpen(true)}
          hint="Trace a figure"
        />
      </div>

      <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="loan_to_share" />
    </motion.div>
  );
}
