import escalationData from '../../data/risk/escalation_log.json';

const PRIORITY_STYLES = {
  Critical: 'bg-red-50 text-red-700',
  High: 'bg-amber-50 text-amber-700',
  Medium: 'bg-blue-50 text-blue-700',
};

const STATUS_STYLES = {
  'In Progress': 'text-blue-600',
  'Escalated to Fraud Team': 'text-red-600',
  'Under Review': 'text-amber-600',
  'Pending Review': 'text-text-muted',
};

export default function EscalationTable() {
  const { escalations, summary } = escalationData;

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Escalation Pipeline</h3>
      <p className="text-[11px] text-text-subtle mb-3">
        {summary.total_open} open | {summary.total_escalated} escalated | Avg resolution: {summary.avg_resolution_days} days
      </p>
      <div className="space-y-2.5">
        {escalations.map((esc) => (
          <div key={esc.id} className="border border-border-subtle rounded-lg p-2.5">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${PRIORITY_STYLES[esc.priority] || 'bg-surface-2 text-text-muted'}`}>
                    {esc.priority.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-text-subtle">{esc.id}</span>
                </div>
                <p className="text-xs font-semibold text-text mt-1">{esc.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-text-subtle mt-1">
              <span className={`font-medium ${STATUS_STYLES[esc.status] || 'text-text-muted'}`}>{esc.status}</span>
              <span>•</span>
              <span>{esc.assigned_to}</span>
            </div>
            <p className="text-[10px] text-text-muted mt-1.5">{esc.notes}</p>
            <div className="flex gap-3 text-[10px] text-text-subtle mt-1.5">
              <span>Opened: {esc.opened}</span>
              <span>Target: {esc.target_resolution}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-border-subtle flex justify-between text-[10px] text-text-subtle">
        <span>Closed this month: {summary.total_closed_this_month}</span>
        <span>Avg resolution: {summary.avg_resolution_days} days</span>
      </div>
    </div>
  );
}
