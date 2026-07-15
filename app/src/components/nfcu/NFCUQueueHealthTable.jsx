const queues = [
  { name: 'Auto Loans', status: 'critical', waiting: 127, waitTime: '12:47', serviceLevel: '54%', agents: 14, note: 'Intervention active' },
  { name: 'Mortgage Servicing', status: 'warning', waiting: 18, waitTime: '4:12', serviceLevel: '78%', agents: 11, note: 'Sentiment risk' },
  { name: 'General Banking', status: 'ok', waiting: 4, waitTime: '0:58', serviceLevel: '87%', agents: 22, note: '' },
  { name: 'Member Onboarding', status: 'ok', waiting: 2, waitTime: '0:42', serviceLevel: '91%', agents: 8, note: '' },
  { name: 'Digital Support', status: 'ok', waiting: 6, waitTime: '1:14', serviceLevel: '83%', agents: 10, note: '' },
];

const statusConfig = {
  critical: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border border-red-200', label: 'Critical' },
  warning: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'Warning' },
  ok: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'On Target' },
};

export default function NFCUQueueHealthTable() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <p className="text-xs font-semibold text-text-muted">Live Queue Snapshot — Dynamics 365</p>
        <span className="text-[10px] text-text-subtle font-medium">Updated just now</span>
      </div>
      <div className="overflow-x-auto scrollbar-sleek">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-surface-2">
              <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Queue</th>
              <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Status</th>
              <th className="text-right px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Waiting</th>
              <th className="text-right px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Avg Wait</th>
              <th className="text-right px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">SL (80/20)</th>
              <th className="text-right px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Agents</th>
            </tr>
          </thead>
          <tbody>
            {queues.map((q, i) => {
              const s = statusConfig[q.status];
              return (
                <tr key={q.name} className={`${i % 2 === 0 ? 'bg-surface' : 'bg-gray-50/40'} hover:bg-blue-50/30 transition-colors`}>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-text">{q.name}</div>
                    {q.note && <div className="text-[10px] text-text-subtle mt-0.5">{q.note}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </td>
                  <td className={`px-3 py-2.5 text-right font-bold ${q.status === 'critical' ? 'text-red-600' : 'text-text-muted'}`}>{q.waiting}</td>
                  <td className={`px-3 py-2.5 text-right font-medium ${q.status === 'critical' ? 'text-red-600' : 'text-text-muted'}`}>{q.waitTime}</td>
                  <td className={`px-3 py-2.5 text-right font-bold ${
                    q.status === 'critical' ? 'text-red-600' : q.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>{q.serviceLevel}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-text-muted">{q.agents}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle flex items-center justify-between bg-gray-50/50">
        <span className="text-[10px] text-text-subtle">Target service level: 80/20 across all queues</span>
        <span className="text-[10px] font-semibold text-text-muted">Overall: 71.3%</span>
      </div>
    </div>
  );
}
