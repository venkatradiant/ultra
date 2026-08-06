/**
 * RetrainingInsights — the forecast, and the four retrains behind it.
 *
 * The "+6–8%" is a projection, and the honest way to present a projection is
 * next to its track record: the last four retrains delivered +5.2%, +3.8%,
 * +6.4% and +4.1%, averaging +4.9%. That spread is what tells an admin how much
 * to trust the estimate — a forecast shown alone is a number to believe, a
 * forecast shown with its history is a number to reason about.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle2, TrendingUp } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

export default function RetrainingInsights({ retraining, history = [] }) {
  const [triggered, setTriggered] = useState(false);
  if (!retraining) return null;

  const avgHistory = history.length
    ? (history.reduce((s, h) => s + h.improvement, 0) / history.length).toFixed(1)
    : retraining.lastFourAverage;
  const range = history.length
    ? `${Math.min(...history.map((h) => h.improvement))}% to ${Math.max(...history.map((h) => h.improvement))}%`
    : null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text tracking-tight">
            <Brain className="w-4 h-4 text-brand" /> Model Retraining Insights
          </h3>
          <p className="text-[11px] text-text-subtle mt-0.5">
            Every operator correction is training data for the next pass.
          </p>
        </div>
        <IllustrativeChip />
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-2/40 p-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[12px] font-semibold text-text">Training Data Quality</span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              {retraining.dataQualityLabel}
            </span>
            <span className="text-lg font-bold text-text tabular-nums">{retraining.dataQualityScore}%</span>
          </span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${retraining.dataQualityScore}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full bg-emerald-500"
          />
        </div>
        <p className="text-[10.5px] text-text-subtle mt-2">
          {retraining.correctionsCaptured.toLocaleString()} {retraining.correctionsNote}
        </p>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">
          Top improvement areas
        </p>
        <ul className="space-y-1.5">
          {retraining.improvementAreas.map((a) => (
            <li key={a.area} className="flex items-center gap-3">
              <span className="text-[11.5px] text-text-muted min-w-0 flex-1 truncate">{a.area}</span>
              <span className="h-1.5 rounded-full bg-brand/70" style={{ width: `${a.lift * 12}px` }} />
              <span className="text-[11.5px] font-bold text-emerald-700 tabular-nums w-12 text-right">
                +{a.lift}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3.5 pt-3.5 border-t border-border-subtle">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[12px] font-semibold text-text">Next Retraining Schedule</span>
          <span className="text-[12px] font-bold text-text">{retraining.nextSchedule}</span>
        </div>
        <p className="inline-flex items-center gap-1.5 text-[11px] text-text-muted mt-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-brand" />
          Estimated {retraining.estimatedImprovement}
          {range && (
            <span className="text-text-subtle">
              — last four averaged +{avgHistory}%, ranging {range}
            </span>
          )}
        </p>

        {triggered ? (
          <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-500/[0.07] p-3.5">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4" /> Early retraining started
            </p>
            <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">
              Running on v2.4.1 with the {retraining.correctionsCaptured.toLocaleString()} captured
              corrections, weighted toward tax-rule and sync detection. The result will be versioned and the
              trigger logged with your ID and timestamp. The current cycle continues on v2.4.1 until the new
              version validates — illustrative, no job was queued.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setTriggered(true)}
            className="mt-3 w-full rounded-lg bg-brand px-3.5 py-2.5 text-[12px] font-semibold text-white hover:brightness-110 transition-all cursor-pointer"
          >
            Trigger Early Retraining
          </button>
        )}
      </div>
    </div>
  );
}
