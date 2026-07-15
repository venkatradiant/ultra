import metrics from '../../data/nfcu/director/director_metrics.json';

const statusConfig = {
  critical: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border border-red-200', label: 'Critical', sl: 'text-red-600' },
  warning: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'Warning', sl: 'text-amber-600' },
  healthy: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Healthy', sl: 'text-emerald-600' },
};

export default function NFCUTeamRollupTable() {
  const teams = metrics.team_rollup;
  const aggregate = Math.round(teams.reduce((s, t) => s + t.service_level, 0) / teams.length);

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-text-muted">Manager Roll-up — Service Level by Team</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Source: Dynamics 365 Contact Center (4-team aggregation)</p>
        </div>
        <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
          Aggregate {aggregate}% — below target
        </span>
      </div>
      <div className="overflow-x-auto scrollbar-sleek">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-surface-2">
              <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Team</th>
              <th className="text-left px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Manager</th>
              <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Status</th>
              <th className="text-right px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">SL</th>
              <th className="text-right px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Agents</th>
              <th className="text-right px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Waiting</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t, i) => {
              const s = statusConfig[t.status];
              return (
                <tr key={t.id} className={`${i % 2 === 0 ? 'bg-surface' : 'bg-gray-50/40'} hover:bg-blue-50/30 transition-colors`}>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-text">{t.name}</div>
                    {t.note && <div className="text-[10px] text-text-subtle mt-0.5">{t.note}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-text-muted">{t.manager}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </td>
                  <td className={`px-3 py-2.5 text-right font-bold ${s.sl}`}>{t.service_level}%</td>
                  <td className="px-3 py-2.5 text-right font-medium text-text-muted">{t.agents}</td>
                  <td className={`px-4 py-2.5 text-right font-bold ${t.status === 'critical' ? 'text-red-600' : 'text-text-muted'}`}>{t.members_waiting}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-gray-50/50 flex items-center justify-between">
        <span className="text-[10px] text-text-subtle">Target SL across all teams: 80/20</span>
        <span className="text-[10px] font-semibold text-text-muted">2 critical · 1 warning · 2 healthy</span>
      </div>
    </div>
  );
}
