import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Filter, Sparkles } from 'lucide-react';
import ExhibitCard from '../shared/ExhibitCard';
import queue from '../../../data/esfcu/cro/alertQueue.json';
import { tierFor, colorFor } from '../../../utils/confidence';
import { STATE_COLOR } from '../tokens';

/**
 * Spec §10 Step 5: "a re-ranked alert queue showing noise pushed down."
 *
 * The exhibit is not the list — it is the *distance* each alert travelled. A
 * queue that simply shows eight fraud-likely alerts at the top proves nothing;
 * a queue that shows the top alert climbed 13 places while a fuel
 * pre-authorisation fell from position 1 to position 12 shows what the ranking
 * was costing a lean team. So the movement column is the point, and the toggle
 * lets you see the order it replaced.
 *
 * Noise is pushed down, never hidden. 149 of the 240 alerts are false positive
 * and every one of them is still in the queue — a fraud team that discovers the
 * AI silently dropped alerts stops trusting it, and rightly.
 */

function MovementChip({ movement }) {
  if (movement === 0) return <span className="text-[10px] text-text-subtle">—</span>;
  const up = movement > 0;
  const Icon = up ? ArrowUp : ArrowDown;
  const color = up ? STATE_COLOR.good : STATE_COLOR.warning;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums" style={{ color }}>
      <Icon className="h-2.5 w-2.5" />{Math.abs(movement)}
    </span>
  );
}

export default function AlertQueue({ compact = false }) {
  const [reranked, setReranked] = useState(true);
  const [fraudOnly, setFraudOnly] = useState(false);

  const rows = queue.alerts
    .filter((a) => (fraudOnly ? a.likelyFraud : true))
    .slice()
    .sort((a, b) => (reranked ? a.rankAfter - b.rankAfter : a.rankBefore - b.rankBefore));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Alert queue — re-ranked by real-fraud likelihood"
        note={queue.rerank_note}
        source={queue.source}
        asOf={queue.as_of}
        confidence={queue.confidence}
        provenance={queue.provenance}
      >
        <div className="mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-0">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">Open alerts</p>
            <p className="text-[14px] font-bold tabular-nums text-text">{queue.open_total}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">False positive</p>
            <p className="text-[14px] font-bold tabular-nums" style={{ color: STATE_COLOR.warning }}>
              {queue.false_positive_pct}%
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">Fraud-likely</p>
            <p className="text-[14px] font-bold tabular-nums" style={{ color: STATE_COLOR.good }}>
              {queue.fraud_likely_count}
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setReranked((v) => !v)}
              aria-pressed={reranked}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors ${
                reranked ? 'border-brand/30 bg-brand/[0.06] text-brand' : 'border-border-subtle text-text-muted hover:border-brand/20'
              }`}
            >
              <Sparkles className="h-3 w-3" /> {reranked ? 'AI order' : 'Original order'}
            </button>
            <button
              type="button"
              onClick={() => setFraudOnly((v) => !v)}
              aria-pressed={fraudOnly}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors ${
                fraudOnly ? 'border-brand/30 bg-brand/[0.06] text-brand' : 'border-border-subtle text-text-muted hover:border-brand/20'
              }`}
            >
              <Filter className="h-3 w-3" /> Fraud-likely only
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle">
                <th scope="col" className="py-1.5 pr-2 text-[9px] font-bold uppercase tracking-wide text-text-subtle">#</th>
                <th scope="col" className="py-1.5 pr-2 text-[9px] font-bold uppercase tracking-wide text-text-subtle">Alert</th>
                <th scope="col" className="py-1.5 pr-2 text-[9px] font-bold uppercase tracking-wide text-text-subtle">Channel</th>
                <th scope="col" className="py-1.5 pr-2 text-[9px] font-bold uppercase tracking-wide text-text-subtle">Rule</th>
                <th scope="col" className="py-1.5 pr-2 text-right text-[9px] font-bold uppercase tracking-wide text-text-subtle">Amount</th>
                <th scope="col" className="py-1.5 pr-2 text-right text-[9px] font-bold uppercase tracking-wide text-text-subtle">Score</th>
                <th scope="col" className="py-1.5 text-right text-[9px] font-bold uppercase tracking-wide text-text-subtle">
                  {reranked ? 'Moved' : 'AI rank'}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr
                  key={a.id}
                  className={`border-b border-border-subtle/60 last:border-0 ${a.likelyFraud ? '' : 'opacity-60'}`}
                >
                  <td className="py-1.5 pr-2 text-[10px] font-bold tabular-nums text-text-subtle">
                    {reranked ? a.rankAfter : a.rankBefore}
                  </td>
                  <td className="py-1.5 pr-2">
                    <span className="block text-[11px] font-semibold text-text">{a.id}</span>
                    {!compact ? <span className="block text-[9.5px] leading-snug text-text-subtle">{a.note}</span> : null}
                  </td>
                  <td className="py-1.5 pr-2 text-[10px] text-text-muted">{a.channel}</td>
                  <td className="py-1.5 pr-2 text-[10px] text-text-muted">{a.rule}</td>
                  <td className="py-1.5 pr-2 text-right text-[10.5px] font-semibold tabular-nums text-text">{a.amount_display}</td>
                  <td className="py-1.5 pr-2 text-right">
                    <span className="text-[10.5px] font-bold tabular-nums" style={{ color: colorFor(tierFor(a.score)) }}>
                      {a.score}
                    </span>
                  </td>
                  <td className="py-1.5 text-right">
                    {reranked ? <MovementChip movement={a.movement} /> : <span className="text-[10px] tabular-nums text-text-subtle">{a.rankAfter}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-[9.5px] text-text-subtle">
          {queue.shown} of {queue.open_total} alerts shown. Noise is ranked down, not removed — every
          false positive is still in the queue and still workable.
        </p>
      </ExhibitCard>
    </motion.div>
  );
}
