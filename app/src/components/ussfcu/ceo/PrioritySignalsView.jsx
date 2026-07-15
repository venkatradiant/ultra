import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Users, ShieldAlert, Presentation, Route, ShieldCheck, Gauge, Landmark, CalendarDays } from 'lucide-react';
import signals from '../../../data/ussfcu/ceo/signals.json';
import trust from '../../../data/ussfcu/ceo/trustStrip.json';
import SignalCard from '../../cards/SignalCard';
import PresentationMode from './presentation/PresentationMode';
import LineageTraceModal from './LineageTraceModal';

const primary = signals.find((s) => s.primary) || signals[0];
const secondary = signals.filter((s) => s !== primary);

function HeroSignal({ onBriefing, onTrace }) {
  const m = primary.metrics;
  const tiles = [
    { l: 'Loan-to-share', k: `${m.loan_to_share_pct}%`, s: '5-year high' },
    { l: 'Loan growth', k: `+${m.net_loan_growth_ytd_pct}%`, s: `shares +${m.share_growth_ytd_pct}%` },
    { l: '90-day pipeline', k: '$312M', s: 'MeridianLink' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="rounded-2xl bg-brand text-white p-5"
      style={{ boxShadow: '0 8px 30px rgba(0,48,135,0.18)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded-md bg-[#E4CE96] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#06182B]">Primary</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#E4CE96]">
          <span className="h-2 w-2 rounded-full bg-[#E4CE96]" /> Watch · Balance sheet
        </span>
        <span className="ml-auto text-[11px] font-semibold tabular-nums" style={{ color: '#7fd3a6' }}>Confidence {primary.confidence.score}%</span>
      </div>
      <h3 className="text-[19px] font-bold leading-tight">{primary.title}</h3>
      <p className="text-[12.5px] text-white/70 mt-1.5 leading-relaxed">{primary.description}</p>

      <div className="grid grid-cols-3 gap-2.5 mt-4">
        {tiles.map((t) => (
          <div key={t.l} className="rounded-xl bg-white/[0.06] border border-white/10 p-3">
            <p className="text-[9.5px] uppercase tracking-wide text-white/50">{t.l}</p>
            <p className="text-[22px] font-bold text-[#E4CE96] leading-none mt-1 tabular-nums">{t.k}</p>
            <p className="text-[10px] text-white/50 mt-1">{t.s}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onBriefing} className="inline-flex items-center gap-1.5 rounded-lg bg-[#E4CE96] px-3.5 py-2 text-[12px] font-semibold text-[#06182B] transition-colors hover:bg-[#d8bd7d]">
          <Presentation className="h-3.5 w-3.5" /> View Full Briefing
        </button>
        <button type="button" onClick={onTrace} className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-2 text-[12px] font-semibold text-white/90 transition-colors hover:bg-white/10">
          <Route className="h-3.5 w-3.5" /> Trace to source
        </button>
      </div>
    </motion.div>
  );
}

function PostureRow({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-2.5 py-2.5 border-b border-border-subtle last:border-0">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand/[0.07] text-brand">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-[11.5px] text-text-muted flex-1">{label}</span>
      <span className={`text-[12px] font-semibold tabular-nums ${tone === 'good' ? 'text-[#00897B]' : 'text-text'}`}>{value}</span>
    </div>
  );
}

export default function PrioritySignalsView() {
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const validatedTime = trust.validated_at?.slice(11, 16);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 overflow-y-auto scrollbar-sleek px-6 pt-6 pb-10">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Priority Signals</h2>
        <p className="text-[12px] text-text-muted mb-5 max-w-2xl">
          The small set of state-of-the-business signals at the top of the house — validated overnight and
          traceable to source. One needs a decision before board prep; two are steady.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Signals */}
          <div className="lg:col-span-2 space-y-3">
            <HeroSignal onBriefing={() => setPresentationOpen(true)} onTrace={() => setTraceOpen(true)} />
            {secondary.map((s) => (
              <SignalCard key={s.id} signal={s} />
            ))}
          </div>

          {/* Executive posture */}
          <div>
            <div className="bg-surface rounded-2xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 className="text-[13px] font-semibold text-text mb-1">Executive Posture</h3>
              <p className="text-[11.5px] text-text-muted leading-relaxed mb-3">
                A strong, well-run institution with one thing to manage — liquidity — and a national membership
                opportunity beyond the DMV.
              </p>
              <PostureRow icon={ShieldCheck} label={`Data trust · validated ${validatedTime} ET`} value={`${trust.data_trust_score}%`} tone="good" />
              <PostureRow icon={Gauge} label={`NCUA exam readiness · next ${trust.widgets.ncua_exam_readiness.next_window}`} value={`${trust.widgets.ncua_exam_readiness.score}/100`} tone="good" />
              <PostureRow icon={Landmark} label="Net worth ratio · well capitalized" value="7.50%" tone="good" />
              <PostureRow icon={CalendarDays} label="Next board meeting" value="Sep 2026" />
            </div>

            <div className="mt-3 rounded-2xl border border-brand/10 bg-brand/[0.03] p-4">
              <p className="text-[11.5px] font-semibold text-brand">Recommended before the September board</p>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                A targeted deposit campaign to the DMV core and Senate-alumni segments, paired with a funding-line
                review, closes the liquidity gap by year end and holds a buffer through Q1.
              </p>
              <button
                type="button"
                onClick={() => setPresentationOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#00246b]"
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
