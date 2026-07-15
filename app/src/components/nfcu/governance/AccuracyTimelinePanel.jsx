import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function AccuracyTimelinePanel({ series }) {
  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[9px] uppercase tracking-wider font-bold text-text-subtle">Accuracy & Avg Confidence · 14d</div>
          <p className="text-[11px] text-text-muted mt-0.5">Daily back-test outcomes vs. mean confidence on those turns</p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={32} />
            <YAxis yAxisId="right" orientation="right" domain={[60, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            <Line yAxisId="left" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="var(--color-brand)" strokeWidth={2} dot={{ r: 2.5 }} />
            <Line yAxisId="right" type="monotone" dataKey="avg_confidence" name="Avg Confidence" stroke="#16A34A" strokeWidth={2} dot={{ r: 2.5 }} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
