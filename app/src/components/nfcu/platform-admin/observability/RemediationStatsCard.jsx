import { motion } from 'framer-motion';
import { Wrench, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

/**
 * Remediation Stats Card
 * Compounding totals — values only grow as orchestrator pushes after each remediation.
 * Data from GET /api/remediation/stats
 */
export default function RemediationStatsCard({ data }) {
  // Show zeros if no data yet — don't hide the card
  const safeData = data ?? {
    incidents_processed: 0,
    components_remediated: 0,
    successful_remediations: 0,
    failed_remediations: 0,
    escalations_raised: 0,
    success_rate_percent: 0,
    last_updated: null
  };
  if (!data) data = safeData;

  const stats = [
    {
      label: 'Successful',
      value: data.successful_remediations,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Failed',
      value: data.failed_remediations,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
    },
    {
      label: 'Escalated',
      value: data.escalations_raised,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
    },
  ];

  const successRate = data.success_rate_percent ?? 0;
  const rateColor = successRate >= 80 ? 'text-emerald-700' : successRate >= 50 ? 'text-amber-700' : 'text-red-700';
  const rateBg = successRate >= 80 ? 'bg-emerald-50 border-emerald-200' : successRate >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <Wrench className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold text-text">Remediation Stats</h3>
        <span className="ml-auto text-[10px] text-text-subtle">compounding · per cycle</span>
      </div>
      <p className="text-xs text-text-subtle mb-4">
        Cumulative remediation outcomes since system start · {data.incidents_processed ?? 0} incidents processed
      </p>

      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-lg border px-3 py-2.5 text-center ${bg}`}>
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <div className={`text-[26px] font-bold tabular-nums leading-none ${color}`}>{value ?? 0}</div>
            <div className="text-[9px] text-text-subtle uppercase tracking-wide mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${rateBg}`}>
        <div>
          <div className={`text-[9.5px] font-semibold uppercase tracking-wide ${rateColor}`}>Success Rate</div>
          <div className="text-[10px] text-text-subtle mt-0.5">Across all remediations</div>
        </div>
        <span className={`text-[26px] font-bold tabular-nums ${rateColor}`}>
          {successRate}%
        </span>
      </div>
    </motion.div>
  );
}