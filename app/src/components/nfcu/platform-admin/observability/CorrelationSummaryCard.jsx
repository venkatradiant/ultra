import { motion } from 'framer-motion';
import { GitMerge } from 'lucide-react';

/**
 * Correlation Summary Card
 * Compounding totals — values only grow as orchestrator pushes updates every 60s.
 * Data from GET /api/correlation/summary
 */
export default function CorrelationSummaryCard({ data }) {
  // Show zeros if no data yet — don't hide the card
  if (!data) data = {
    total_alerts: 0,
    total_incidents: 0,
    total_tickets_created: 0,
    noise_reduction_percent: 0,
    ticket_ids: [],
    last_updated: null
  };

  const stats = [
    { label: 'Raw Alerts', value: data.total_alerts, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    { label: 'Incidents', value: data.total_incidents, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Jira Tickets', value: data.total_tickets_created, color: 'text-brand', bg: 'bg-brand/5 border-brand/20' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <GitMerge className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold text-text">Correlation Summary</h3>
        <span className="ml-auto text-[10px] text-text-subtle">compounding · 60s</span>
      </div>
      <p className="text-xs text-text-subtle mb-4">
        Cumulative suppression of raw alerts into incidents and tickets
      </p>

      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {stats.map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-lg border px-3 py-2.5 text-center ${bg}`}>
            <div className={`text-[26px] font-bold tabular-nums leading-none ${color}`}>{value ?? 0}</div>
            <div className="text-[9px] text-text-subtle uppercase tracking-wide mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
        <div>
          <div className="text-[9.5px] font-semibold text-emerald-800 uppercase tracking-wide">Noise Reduction</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Alerts suppressed to tickets</div>
        </div>
        <span className="text-[26px] font-bold tabular-nums text-emerald-700">
          {data.noise_reduction_percent ?? 0}%
        </span>
      </div>

      {data.ticket_ids?.length > 0 && (
        <div className="mt-3">
          <div className="text-[9.5px] text-text-muted uppercase tracking-wider mb-1.5">Open Tickets</div>
          <div className="flex flex-wrap gap-1.5">
            {data.ticket_ids.slice(0, 10).map((id) => (
              <span key={id} className="text-[9.5px] font-mono font-semibold px-1.5 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                {id}
              </span>
            ))}
            {data.ticket_ids.length > 10 && (
              <span className="text-[9.5px] text-text-subtle px-1.5 py-0.5">+{data.ticket_ids.length - 10} more</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}