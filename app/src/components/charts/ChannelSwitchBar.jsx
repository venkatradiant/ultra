import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import channelData from '../../data/cx/channel_switching.json';

const data = channelData.by_journey_stage.map((d) => ({
  stage: d.stage.length > 16 ? d.stage.slice(0, 16) + '…' : d.stage,
  fullStage: d.stage,
  switches: d.switches,
  switchRate: d.switch_rate,
}));

const CRITICAL_THRESHOLD = 10;

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-1">{d.fullStage}</p>
      <p className="text-text-muted">{d.switches} switches ({d.switchRate}% rate)</p>
    </div>
  );
}

export default function ChannelSwitchBar() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Channel Switches by Journey Stage</h3>
      <p className="text-[11px] text-text-subtle mb-3">Digital-to-branch switches this week</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="stage" width={110} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="switches" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.switchRate >= CRITICAL_THRESHOLD ? '#CC0000' : 'var(--color-brand)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
