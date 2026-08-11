import { useState } from 'react';
import { motion } from 'framer-motion';
import { Presentation, Route, Radar, Gauge, FileText, Siren } from 'lucide-react';
import signals from '../../../data/esfcu/cro/signals.json';
import trust from '../../../data/esfcu/cro/trustStrip.json';
import lineage from '../../../data/esfcu/cro/lineage.json';
import response from '../../../data/esfcu/cro/response.json';
import SignalCard from '../../cards/SignalCard';
import LineageTraceModal from '../shared/LineageTraceModal';
import CroPresentationMode from './presentation/PresentationMode';
import { ACCENT_SOFT } from '../tokens';

/**
 * `/risk`, relabelled "Risk Signals" for this persona. The five spec §6 signal
 * cards with the scam surge promoted to a navy hero, plus the risk posture rail.
 *
 * Same layout as the CEO's Priority Signals page on purpose — a person moving
 * between the two personas should recognise the page and only have to read the
 * content. What differs is the rail: his answers "can I take this to the
 * board?", hers answers "can I take this to an examiner?".
 */
const primary = signals.find((s) => s.primary) || signals[0];
const secondary = signals.filter((s) => s !== primary);

function HeroSignal({ onBriefing, onTrace }) {
  // Every figure comes from the signal's own metrics — no literals, so the hero
  // cannot drift from the KPI tiles or the deck.
  const m = primary.metrics;
  const tiles = [
    { l: 'Cases, 30 days', k: `${m.cases_30d}`, s: `up from ${m.cases_prior_30d}` },
    { l: 'Caught before loss', k: `${m.caught_before_loss_pct}%`, s: 'target 85%' },
    { l: 'Time to detect', k: `${m.time_to_detect_days} days`, s: 'target under 1' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="rounded-2xl bg-brand p-5 text-white"
      style={{ boxShadow: '0 8px 30px rgba(0,55,104,0.20)' }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00243F]" style={{ background: ACCENT_SOFT }}>
          Primary
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: ACCENT_SOFT }}>
          <Siren className="h-3 w-3" /> Critical · Scam &amp; impersonation
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
          <Presentation className="h-3.5 w-3.5" /> View Full Risk Briefing
        </button>
        <button
          type="button"
          onClick={onTrace}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-2 text-[12px] font-semibold text-white/90 transition-colors hover:bg-white/10"
        >
          <Route className="h-3.5 w-3.5" /> Trace to source
        </button>
      </div>
      {/* The four secondary cards get their Action line from SignalCard; the
          hero has its own layout, so without this the one signal that most
          needs a recommended action would be the only one without it. */}
      {primary.action ? (
        <p className="mt-3 flex items-start gap-1.5 text-[11.5px] leading-snug text-white/75">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: ACCENT_SOFT }}>Action</span>
          <span>{primary.action}</span>
        </p>
      ) : null}
      <p className="mt-2 text-[10px] text-white/45">{primary.data_note}</p>
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

export default function RiskSignalsView() {
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const validatedTime = trust.validated_at?.slice(11, 16);
  const w = trust.widgets;
  const recommended = response.options.find((o) => o.recommended);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-1 flex-col">
      <div className="scrollbar-sleek flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">Risk Signals</h2>
        <p className="mb-5 max-w-2xl text-[12px] text-text-muted">
          The fraud and financial-crime signals as of this morning. One needs a decision today, one
          must be closed before the coverage figure is cited to the committee or an examiner, and the
          rest are the context that goes in the room with you.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <HeroSignal onBriefing={() => setPresentationOpen(true)} onTrace={() => setTraceOpen(true)} />
            {secondary.map((s) => (
              <SignalCard key={s.id} signal={s} showAction />
            ))}
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-border-subtle bg-surface p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 className="mb-1 text-[13px] font-semibold text-text">Exam &amp; Filing Posture</h3>
              <p className="mb-3 text-[11.5px] leading-relaxed text-text-muted">
                Defensible on every figure but one. The coverage gap is the item an examiner would
                find first, so it is the item on the page rather than in a footnote.
              </p>
              <PostureRow icon={Gauge} label={`Data trust · validated ${validatedTime} ET`} value={`${trust.data_trust_score}%`} tone="good" />
              <PostureRow icon={Radar} label="Fraud-model coverage · Howard University pending" value={w.model_coverage.status_label} tone="warn" />
              <PostureRow icon={FileText} label={`Open SARs · ${w.open_regulatory.due_within_7_days} due within 7 days`} value={`${w.open_regulatory.open_count} open`} tone="warn" />
              <PostureRow icon={Gauge} label={`NCUA & BSA readiness · next ${w.exam_readiness.next_window}`} value={`${w.exam_readiness.score}/100`} tone="warn" />
            </div>

            <div className="mt-3 rounded-2xl border border-brand/10 bg-brand/[0.03] p-4">
              <p className="text-[11.5px] font-semibold text-brand">Recommended before the committee</p>
              <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                {recommended.description} {response.closing_note}
              </p>
              <button
                type="button"
                onClick={() => setPresentationOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#002a50]"
              >
                <Presentation className="h-3.5 w-3.5" /> Open the risk briefing
              </button>
            </div>
          </div>
        </div>
      </div>

      {presentationOpen ? <CroPresentationMode onClose={() => setPresentationOpen(false)} /> : null}
      <LineageTraceModal
        open={traceOpen}
        onClose={() => setTraceOpen(false)}
        initialFigureId="scam_cases_30d"
        figures={lineage.figures}
      />
    </div>
  );
}
