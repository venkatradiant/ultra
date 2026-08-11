import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ArrowRight, Radar } from 'lucide-react';
import ExhibitCard from '../shared/ExhibitCard';
import LineageTraceModal from '../shared/LineageTraceModal';
import coverage from '../../../data/esfcu/cro/coverage.json';
import lineage from '../../../data/esfcu/cro/lineage.json';
import { STATE_COLOR } from '../tokens';

/**
 * Spec §10 Step 3: "reconciliation panel: channels reconciled vs the coverage
 * gap, the un-scored book highlighted, a lineage trail expandable to source,
 * and a clear 'reconcile before you cite this' badge."
 *
 * Shaped after the CEO's ReconciliationPanel, but the thing being reconciled is
 * different in kind. His was a *figure* that two systems disagreed about. Hers
 * is a *population* one system cannot see at all — the channels agree perfectly,
 * and that is exactly what makes the gap dangerous: a clean reconciliation
 * across four sources reads as "everything is covered" right up until you ask
 * what the fifth one is scoring.
 *
 * So the un-scored book is not a footnote here. It is the panel's headline.
 */

function ChannelRow({ channel }) {
  const ok = channel.reconciled;
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="flex min-w-0 items-start gap-1.5">
        <Icon className="mt-px h-3.5 w-3.5 flex-shrink-0" style={{ color: STATE_COLOR[channel.state] }} />
        <span className="min-w-0">
          <span className="block text-[11.5px] font-semibold text-text">{channel.channel}</span>
          <span className="block text-[10px] leading-snug text-text-subtle">{channel.note}</span>
        </span>
      </span>
      <span
        className="flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
        style={{ color: STATE_COLOR[channel.state], background: `${STATE_COLOR[channel.state]}14` }}
      >
        {ok ? 'Reconciled' : 'Gap'}
      </span>
    </div>
  );
}

function CoverageBar({ item }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: `${STATE_COLOR[item.state]}44`, background: `${STATE_COLOR[item.state]}0A` }}>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[11.5px] font-bold text-text">{item.book}</span>
        <span className="text-[13px] font-bold tabular-nums" style={{ color: STATE_COLOR[item.state] }}>
          {item.pctScored}% scored
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${item.pctScored}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: STATE_COLOR[item.state] }}
        />
      </div>
      <p className="mt-1 text-[10px] tabular-nums text-text-muted">
        {item.scored.toLocaleString()} of {item.inScope.toLocaleString()} accounts ·{' '}
        <span className="font-semibold">{item.gap.toLocaleString()} unmonitored</span>
      </p>
      <p className="text-[10px] leading-snug text-text-subtle">{item.gapReason}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1 border-t pt-2" style={{ borderColor: `${STATE_COLOR[item.state]}33` }}>
        {item.lineage.map((stage, i) => (
          <span key={stage} className="inline-flex items-center gap-1">
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                stage.includes('incomplete') ? 'bg-amber-100 text-amber-900' : 'bg-white text-text-muted'
              }`}
            >
              {stage}
            </span>
            {i < item.lineage.length - 1 ? <ArrowRight className="h-2.5 w-2.5 text-text-subtle" /> : null}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function FraudReconciliationPanel() {
  const [traceOpen, setTraceOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="What reconciles, and what is not covered"
        note="The channels agree. The question is what the fraud model can see."
        source={coverage.source}
        asOf={coverage.as_of}
        confidence={coverage.confidence}
        provenance={coverage.provenance}
      >
        <span className="mb-3 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
          <AlertTriangle className="h-3 w-3" />
          {coverage.cite_warning}
        </span>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wide text-text-subtle">
              Channel reconciliation
            </p>
            <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface px-3 py-1">
              {coverage.channels.map((c) => <ChannelRow key={c.channel} channel={c} />)}
            </div>
          </div>

          <div>
            <p className="mb-1 flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wide text-text-subtle">
              <Radar className="h-3 w-3" /> Fraud-model coverage
            </p>
            <div className="space-y-2">
              {coverage.items.map((i) => <CoverageBar key={i.book} item={i} />)}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTraceOpen(true)}
          className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline"
        >
          Trace the coverage figure to source <span aria-hidden>→</span>
        </button>

        <LineageTraceModal
          open={traceOpen}
          onClose={() => setTraceOpen(false)}
          initialFigureId="model_coverage"
          figures={lineage.figures}
        />
      </ExhibitCard>
    </motion.div>
  );
}
