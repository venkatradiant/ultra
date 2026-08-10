import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Activity, TrendingDown, ExternalLink } from 'lucide-react';
import anomalies from '../../../data/esfcu/ceo/anomalies.json';
import ExhibitCard from './ExhibitCard';
import LineageTraceModal from './LineageTraceModal';

// Step 5 — "Is anything out of policy or unusual?"
// Two flagged items, each with a severity tag and an evidence link; the branch
// item carries a sparkline showing the break in its own trend.

const CATEGORY_ICON = { Pipeline: Activity, Deposits: TrendingDown };

export default function AnomalyList() {
  const [traceOpen, setTraceOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Out of pattern — flagged before the board sees it"
        note={`${anomalies.items.length} items · neither is a policy breach today`}
        source={anomalies.source}
        asOf={anomalies.as_of}
        confidence={anomalies.confidence}
        illustrative
      >
        <div className="space-y-3">
          {anomalies.items.map((a) => {
            const Icon = CATEGORY_ICON[a.category] || AlertTriangle;
            const spark = a.sparkline?.map((v, i) => ({ i, v }));
            return (
              <div key={a.id} className="rounded-xl border border-border-subtle bg-surface-2 p-3.5">
                <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold leading-tight text-text">{a.title}</p>
                      <p className="text-[9.5px] uppercase tracking-wide text-text-subtle">{a.category}</p>
                    </div>
                  </div>
                  {/* Severity is icon + word, never colour alone. */}
                  <span className="inline-flex flex-shrink-0 items-center gap-1 rounded bg-[#B45309]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#B45309]">
                    <AlertTriangle className="h-2.5 w-2.5" /> Attention
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed text-text-muted">{a.description}</p>

                <div className="mt-2.5 flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-semibold tabular-nums text-[#B45309]">{a.metric_text}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-text-subtle">{a.detail}</p>
                  </div>
                  {spark ? (
                    <div className="w-28 flex-shrink-0">
                      <div className="h-9">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={spark} margin={{ top: 3, right: 2, left: 2, bottom: 0 }}>
                            <Line type="monotone" dataKey="v" stroke="#B45309" strokeWidth={1.9} dot={false} animationDuration={900} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="mt-0.5 text-right text-[8.5px] text-text-subtle">{a.sparkline_unit}</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-2">
                  <span className="text-[10px] text-text-subtle">{a.policy_note}</span>
                  <button
                    type="button"
                    onClick={() => setTraceOpen(true)}
                    className="inline-flex flex-shrink-0 items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> {a.evidence_label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2.5 text-[10px] leading-snug text-text-subtle">{anomalies.note}</p>

        <LineageTraceModal open={traceOpen} onClose={() => setTraceOpen(false)} initialFigureId="consolidated_deposits" />
      </ExhibitCard>
    </motion.div>
  );
}
