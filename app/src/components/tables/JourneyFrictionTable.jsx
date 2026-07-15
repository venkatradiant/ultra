import frictionData from '../../data/cx/cx_journey_friction.json';

const trendColors = {
  worsening: 'text-red-600 bg-red-50',
  stable: 'text-amber-600 bg-amber-50',
  improving: 'text-emerald-600 bg-emerald-50',
};

export default function JourneyFrictionTable() {
  const journeys = frictionData.journeys.sort((a, b) => b.drop_off_rate - a.drop_off_rate);

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Journey Friction Breakdown</h3>
      <p className="text-[11px] text-text-subtle mb-3">All active journeys ranked by drop-off rate</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2 pr-2 font-semibold text-text-muted">Journey</th>
              <th className="text-right py-2 px-2 font-semibold text-text-muted">Drop-off</th>
              <th className="text-right py-2 px-2 font-semibold text-text-muted">CSAT</th>
              <th className="text-right py-2 px-2 font-semibold text-text-muted">Switches</th>
              <th className="text-right py-2 pl-2 font-semibold text-text-muted">Trend</th>
            </tr>
          </thead>
          <tbody>
            {journeys.map((j) => (
              <tr key={j.name} className="border-b border-gray-50 last:border-0">
                <td className="py-2 pr-2">
                  <div className="font-medium text-text">{j.name}</div>
                  <div className="text-[10px] text-text-subtle mt-0.5">Friction: {j.friction_step}</div>
                </td>
                <td className={`text-right py-2 px-2 font-bold ${j.drop_off_rate > 40 ? 'text-red-600' : 'text-text-muted'}`}>
                  {j.drop_off_rate}%
                </td>
                <td className={`text-right py-2 px-2 font-medium ${j.avg_csat < 3.0 ? 'text-red-600' : 'text-text-muted'}`}>
                  {j.avg_csat}
                </td>
                <td className="text-right py-2 px-2 text-text-muted">{j.channel_switches}</td>
                <td className="text-right py-2 pl-2">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${trendColors[j.trend] || 'text-text-muted bg-surface-2'}`}>
                    {j.trend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
