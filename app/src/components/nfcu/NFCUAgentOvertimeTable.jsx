const agents = [
  { name: 'Agent Torres', quality: 94, aht: '7:12', otCount: 3, status: 'Available', fit: 'Best fit' },
  { name: 'Agent Williams', quality: 91, aht: '7:48', otCount: 2, status: 'Available', fit: 'Strong fit' },
  { name: 'Agent Chen', quality: 89, aht: '8:05', otCount: 1, status: 'Available', fit: 'Good fit' },
  { name: 'Agent Davis', quality: 87, aht: '8:22', otCount: 0, status: 'Available', fit: '' },
  { name: 'Agent Martinez', quality: 85, aht: '8:41', otCount: 0, status: 'Available', fit: '' },
];

export default function NFCUAgentOvertimeTable() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">Available Agents — Mortgage Certification + Overtime History</p>
        <p className="text-[10px] text-text-subtle mt-0.5">Cross-referenced from Dynamics 365 Agent Profiles × HR System</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-2">
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Agent</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Quality Score</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">AHT</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">OT (60 days)</th>
            <th className="text-center px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Fit</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a, i) => (
            <tr key={a.name} className={`${i % 2 === 0 ? 'bg-surface' : 'bg-gray-50/40'} hover:bg-blue-50/30 transition-colors`}>
              <td className="px-4 py-2.5">
                <span className="font-semibold text-text">{a.name}</span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className={`font-bold ${a.quality >= 90 ? 'text-emerald-600' : a.quality >= 85 ? 'text-brand' : 'text-amber-600'}`}>
                  {a.quality}
                </span>
                <span className="text-text-subtle">/100</span>
              </td>
              <td className="px-3 py-2.5 text-center font-medium text-text-muted">{a.aht}</td>
              <td className="px-3 py-2.5 text-center">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  a.otCount >= 2 ? 'bg-brand/10 text-brand' : a.otCount === 1 ? 'bg-amber-50 text-amber-700' : 'bg-surface-2 text-text-muted'
                }`}>
                  {a.otCount}× accepted
                </span>
              </td>
              <td className="px-4 py-2.5 text-center">
                {a.fit && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    a.fit === 'Best fit' ? 'bg-emerald-100 text-emerald-700' : a.fit === 'Strong fit' ? 'bg-blue-100 text-blue-700' : 'bg-surface-2 text-text-muted'
                  }`}>
                    {a.fit}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-amber-50/60">
        <p className="text-[10px] text-amber-700 font-medium">Certification: Mortgage Servicing — all 5 agents verified via Dynamics 365</p>
      </div>
    </div>
  );
}
