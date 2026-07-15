const drivers = [
  { label: 'Unplanned PTO — Mortgage Servicing', pct: 44, hours: 151 },
  { label: 'Tax Season Prep (projected)', pct: 22, hours: 75 },
  { label: 'New Hire Gap Coverage', pct: 18, hours: 62 },
  { label: 'Other / Ad Hoc', pct: 16, hours: 54 },
];

export default function NFCUOvertimeBudgetBar() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-text-muted">Q2 Overtime Budget Tracker</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Source: HR System + Dynamics 365 WFM</p>
        </div>
        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">78% used — 10 wks left</span>
      </div>

      {/* Main budget bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-text-muted font-medium">Q2 Budget Utilization</span>
          <span className="text-[10px] font-bold text-amber-600">342 hrs / ~440 hrs budget</span>
        </div>
        <div className="relative w-full bg-surface-2 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: '78%' }} />
          <div className="absolute top-0 left-[71%] h-full w-0.5 bg-red-400 opacity-70" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-text-subtle">0%</span>
          <span className="text-[10px] text-red-500 font-semibold">Projected: 140% by Q2 end</span>
          <span className="text-[10px] text-text-subtle">100%</span>
        </div>
      </div>

      {/* Breakdown */}
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Top Drivers (342 hrs MTD)</p>
      <div className="space-y-2">
        {drivers.map((d) => (
          <div key={d.label}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-text-muted">{d.label}</span>
              <span className="text-[10px] font-semibold text-text-muted">{d.hours} hrs ({d.pct}%)</span>
            </div>
            <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${d.pct >= 40 ? 'bg-red-400' : d.pct >= 20 ? 'bg-amber-400' : 'bg-brand/40'}`}
                style={{ width: `${d.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
        <span className="text-[10px] text-text-subtle">Hybrid plan cost: $11,200</span>
        <span className="text-[10px] font-semibold text-brand">→ Hybrid lands Q2 at ~85% of budget</span>
      </div>
    </div>
  );
}
