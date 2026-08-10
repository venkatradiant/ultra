import { useState } from 'react';
import { motion } from 'framer-motion';
import { Presentation, Route, ShieldCheck, Gauge, Landmark, GitMerge } from 'lucide-react';
import signals from '../../../data/esfcu/ceo/signals.json';
import trust from '../../../data/esfcu/ceo/trustStrip.json';
import SignalCard from '../../cards/SignalCard';
import PresentationMode from './presentation/PresentationMode';
import LineageTraceModal from './LineageTraceModal';
import { ACCENT_SOFT } from './tokens';

// `/risk`, relabelled "Priority Signals" for this persona. The five spec §6
// signal cards with the liquidity watch promoted to a navy hero, plus the
// executive posture rail.
const primary = signals.find((s) => s.primary) || signals[0];
const secondary = signals.filter((s) => s !== primary);

function HeroSignal({ onBriefing, onTrace }) {
  const m = primary.metrics;
  const tiles = [
    { l: 'Loan-to-share', k: `${m.loan_to_share_pct}%`, s: `ceiling ${m.policy_ceiling_pct}%` },
    { l: 'Loan growth', k: `+${m.loan_growth_yoy_pct}%`, s: `shares +${m.share_growth_yoy_pct}%` },
    { l: 'On-hand liquidity', k: `${m.on_hand_liquidity_pct}%`, s: 'drifting' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="rounded-2xl bg-brand text-white p-5"
      style={{ boxShadow: '0 8px 30px rgba(0,55,104,0.20)' }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00243F]" style={{ background: ACCENT_SOFT }}>
          Primary
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: ACCENT_SOFT }}>
          <span className="h-2 w-2 rounded-full" style={{ background: ACCENT_SOFT }} /> Watch · Funding &amp; liquidity
        </span>
        <span className="ml-auto text-[11px] font-semibold tabular-nums" style={{ color: '#7fd3a6' }}>
          Confidence {primary.confidence.score}%
        </span>
      </div>
      <h3 className="text-[19px] font-bold leading-tight">{primary.title}</h3>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/70">{primary.description}</p>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.l} className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
            <p className="text-[9.5px] uppercase tracking-wide text-white/50">{t.l}</p>
            <p className="mt-1 text-[22px] font-bold leading-none tabular-nums" style={{ color: ACCENT_SOFT }}>{t.k}</p>
            <p className="mt-1 text-[10px] text-white/50">{t.s}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBriefing}
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-semibold text-[#00243F] transition-opacity hover:opacity-90"
          style={{ background: ACCENT_SOFT }}
        >
          <Presentation className="h-3.5 w-3.5" /> View Full Briefing
        </button>
        <button
          type="button"
          onClick={onTrace}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-2 text-[12px] font-semibold text-white/90 transition-colors hover:bg-white/10"
        >
          <Route className="h-3.5 w-3.5" /> Trace to source
        </button>
      </div>
      <p className="mt-3 text-[10px] text-white/45">{primary.data_note}</p>
    </motion.div>
  );
}

function PostureRow({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border-subtle py-2.5 last:border-0">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand/[0.07] text-brand">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="min-w-0 flex-1 text-[11.5px] text-text-muted">{label}</span>
      <span
        className={`flex-shrink-0 text-[12px] font-semibold tabular-nums ${
          tone === 'good' ? 'text-[#00897B]' : tone === 'warn' ? 'text-[#B45309]' : 'text-text'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function PrioritySignalsView() {
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const validatedTime = trust.validated_at?.slice(11, 16);
  const recon = trust.widgets.post_merger_reconciliation;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
      <div className="scrollbar-sleek flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">Priority Signals</h2>
        <p className="mb-5 max-w-2xl text-[12px] text-text-muted">
          The state-of-the-business signals at the top of the house — validated overnight and traceable to source.
          One needs a decision before the board pre-read, one must be reconciled before it is cited, and the rest
          are context you can carry into the room.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <HeroSignal onBriefing={() => setPresentationOpen(true)} onTrace={() => setTraceOpen(true)} />
            {secondary.map((s) => (
              <SignalCard key={s.id} signal={s} />
            ))}
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-border-subtle bg-surface p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 className="mb-1 text-[13px] font-semibold text-text">Executive Posture</h3>
              <p className="mb-3 text-[11.5px] leading-relaxed text-text-muted">
                A well-capitalized institution with one thing to manage — funding — and one figure to reconcile
                before it goes to the board.
              </p>
              <PostureRow icon={ShieldCheck} label={`Data trust · validated ${validatedTime} ET`} value={`${trust.data_trust_score}%`} tone="good" />
              <PostureRow icon={GitMerge} label="Post-merger reconciliation · Howard University division" value={recon.status_label} tone="warn" />
              <PostureRow icon={Gauge} label={`NCUA exam readiness · next ${trust.widgets.ncua_exam_readiness.next_window}`} value={`${trust.widgets.ncua_exam_readiness.score}/100`} tone="warn" />
              <PostureRow icon={Landmark} label="Net worth ratio · well capitalized" value="9.62%" tone="good" />
            </div>

            <div className="mt-3 rounded-2xl border border-brand/10 bg-brand/[0.03] p-4">
              <p className="text-[11.5px] font-semibold text-brand">Recommended before the board pre-read</p>
              <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                A targeted education-community deposit campaign timed to the fall inflow window, paired with a
                standby funding line, closes the gap now and holds a buffer through Q1 — and the Howard University
                reconciliation closes before the consolidated figure is cited.
              </p>
              <button
                type="button"
                onClick={() => setPresentationOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#002a50]"
              >
                <Presentation className="h-3.5 w-3.5" /> Open the board briefing
              </button>
            </div>
          </div>
        </div>
      </div>

      {presentationOpen ? <PresentationMode onClose={() => setPresentationOpen(false)} /> : null}
      <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="loan_to_share" />
    </div>
  );
}
