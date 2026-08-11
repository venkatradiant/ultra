import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock } from 'lucide-react';
import LineageTraceModal from './LineageTraceModal';
import { ACCENT_SOFT } from '../tokens';
import { STATE, STATE_WORD, STATE_WORD_CLASS } from './trustTokens';

// ─── Data Trust Strip (ESFCU) ─────────────────────────────────────
// Forked from the USSFCU CEO build, then generalised across both ESFCU personas.
// First-class governance surface, rendered in both Conversation Mode (card /
// compact / expanded) and Presentation Mode (variant="ribbon" — the full-width
// navy assurance ribbon), all from the SAME trustStrip.json so the two modes can
// never disagree.
//
// Spec §13 names four widgets, and each persona names four DIFFERENT ones: the
// CEO watches post-merger reconciliation and NCUA readiness, the CRO watches
// fraud-model coverage and SAR aging. What does not differ is the chrome — four
// variants, the state vocabulary, the lineage hand-off, and the rule that status
// is ALWAYS text-plus-icon and never colour alone.
//
// So the chrome lives here and each persona supplies a `widgets` array of
// descriptors. A descriptor is deliberately variant-aware rather than a single
// value getter: these tiles genuinely differ per variant (the ribbon draws a
// gauge, the expanded card lists source rows, the compact chip has room for
// three words), and pretending otherwise would mean four near-identical configs
// instead of one.

/**
 * The ribbon's radial gauge — the NCUA tile for the CEO, exam readiness for the
 * CRO. Exported because a descriptor's `ribbon` renderer needs it and the deck's
 * scoped CSS is what makes it legible.
 */
export function RibbonGauge({ score, caption }) {
  const R = 26;
  const CIRC = 2 * Math.PI * R;
  const dash = (score / 100) * CIRC;
  return (
    <div className="gw">
      <svg width="74" height="74" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={R} fill="none" stroke="#04223c" strokeWidth="7" />
        <circle cx="32" cy="32" r={R} fill="none" stroke={ACCENT_SOFT} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${dash.toFixed(1)} ${(CIRC - dash).toFixed(1)}`} transform="rotate(-90 32 32)" />
        <text x="32" y="38" textAnchor="middle" fontFamily="Fraunces" fontSize="19" fontWeight="600" fill="#fff">{score}</text>
      </svg>
      <div className="st" style={{ marginTop: 0 }}>{caption}</div>
    </div>
  );
}

/** A ribbon headline: the figure, colour-coded, with its state word beside it. */
export function RibbonBig({ state, children, suffix }) {
  return (
    <div className="big">
      <span className={STATE_WORD_CLASS[state]}>{children}</span>{' '}
      <span style={{ fontSize: 15, color: '#93aabf' }}>{suffix ?? STATE_WORD[state]}</span>
    </div>
  );
}

export function StatePill({ state }) {
  const s = STATE[state] || STATE.good;
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[9.5px] font-semibold px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>
      <Icon className="w-2.5 h-2.5" />
      {s.label}
    </span>
  );
}

export function WidgetTile({ icon: Icon, name, value, sub, state, children, onClick, hint, roomy = false }) {
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

/** Compact chip for the in-conversation strip — icon + short value, low weight. */
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

/**
 * Every ESFCU trust strip, driven by a `widgets` descriptor array.
 *
 * Each descriptor is:
 *   { key, icon, name, nameRoomy?, nameCompact?, ribbonTitle, ribbonIcon,
 *     state(w), value(w), valueCompact(w), sub(w)?, subRoomy(w)?,
 *     body(w)?,        // extra children in the expanded card
 *     ribbon(w)?,      // the ribbon tile's own body, replacing value/sub
 *     traceable?,      // wires the tile to the lineage modal
 *     hint?, hintCompact?,
 *     highlight(w)?    // { value, sub } used when `highlight` is on
 *   }
 *
 * `highlight` is spec §10 Step 3's second AI Response row — the trust strip has
 * to *visibly* change when the conversation reaches the figure it cannot cite.
 * The underlying state was already pending from first load, so what the step
 * owes is not a data change but a seen one: the widget pulses once and promotes
 * its warning from a detail line to the headline. A descriptor opts in by
 * supplying `highlight`; the rest ignore the flag.
 */
export default function DataTrustStrip({
  trust,
  widgets,
  lineageFigureId,
  lineageFigures,
  title = 'Data Trust Strip',
  expanded = false,
  compact = false,
  variant = 'card',
  onTrace,
  highlight = false,
}) {
  const w = trust.widgets;
  const validatedTime = trust.validated_at?.slice(11, 16);
  const [traceOpen, setTraceOpen] = useState(false);
  const openTrace = () => setTraceOpen(true);

  const lineage = lineageFigureId ? (
    <LineageTraceModal
      open={traceOpen}
      onClose={() => setTraceOpen(false)}
      initialFigureId={lineageFigureId}
      figures={lineageFigures}
    />
  ) : null;

  if (variant === 'ribbon') {
    return (
      <div className="trust">
        {widgets.map((d) => (
          <div
            key={d.key}
            className="tw"
            onClick={d.traceable ? onTrace : undefined}
            role={d.traceable && onTrace ? 'button' : undefined}
            style={d.traceable && onTrace ? { cursor: 'pointer' } : undefined}
          >
            <div className="ic">{d.ribbonIcon}</div>
            <div className="th">{d.ribbonTitle ?? d.name}</div>
            {d.ribbon(w)}
          </div>
        ))}
      </div>
    );
  }

  if (compact) {
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
          {widgets.map((d) => (
            <CompactStat
              key={d.key}
              name={d.nameCompact ?? d.name}
              value={d.valueCompact(w)}
              state={d.state(w)}
              onClick={d.traceable ? openTrace : undefined}
            />
          ))}
        </div>
        {lineage}
      </motion.div>
    );
  }

  const header = (
    <div className={`flex items-center justify-between gap-2 ${expanded ? 'mb-3.5' : 'mb-2.5'}`}>
      <div className="flex min-w-0 items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-brand" />
        <span className="text-[11px] font-bold uppercase tracking-wide text-brand">{title}</span>
      </div>
      <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-[10px] font-semibold text-text-muted">
        <span className="font-bold tabular-nums text-[#00897B]">{trust.data_trust_score}%</span>
        <span className="text-text-subtle">·</span>
        <Clock className="h-2.5 w-2.5" /> Validated {validatedTime} ET
      </span>
    </div>
  );

  if (expanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-brand/10 bg-brand/[0.02] p-4"
      >
        {header}
        <div className="grid grid-cols-1 gap-3.5">
          {widgets.map((d) => {
            const hl = highlight && d.highlight ? d.highlight(w) : null;
            const tile = (
              <WidgetTile
                roomy
                icon={d.icon}
                name={d.nameRoomy ?? d.name}
                value={hl ? hl.value : d.value(w)}
                sub={hl ? hl.sub : (d.subRoomy ?? d.sub)?.(w)}
                state={d.state(w)}
                onClick={d.traceable ? openTrace : undefined}
                hint={d.traceable ? d.hint : undefined}
              >
                {d.body?.(w)}
              </WidgetTile>
            );
            // Only a widget that opts into `highlight` gets the pulse wrapper —
            // the others must not pick up a second animated container.
            return d.highlight ? (
              <motion.div
                key={d.key}
                initial={highlight ? { boxShadow: '0 0 0 0 rgba(180,83,9,0)' } : false}
                animate={highlight ? { boxShadow: ['0 0 0 0 rgba(180,83,9,0)', '0 0 0 6px rgba(180,83,9,0.18)', '0 0 0 0 rgba(180,83,9,0)'] } : {}}
                transition={{ duration: 1.6, times: [0, 0.4, 1], delay: 0.25 }}
                className="rounded-xl"
              >
                {tile}
              </motion.div>
            ) : (
              <Fragment key={d.key}>{tile}</Fragment>
            );
          })}
        </div>
        {lineage}
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
      {header}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {widgets.map((d) => (
          <WidgetTile
            key={d.key}
            icon={d.icon}
            name={d.name}
            value={d.value(w)}
            sub={d.sub?.(w)}
            state={d.state(w)}
            onClick={d.traceable ? openTrace : undefined}
            hint={d.traceable ? d.hintCompact : undefined}
          >
            {d.cardBody?.(w)}
          </WidgetTile>
        ))}
      </div>
      {lineage}
    </motion.div>
  );
}
