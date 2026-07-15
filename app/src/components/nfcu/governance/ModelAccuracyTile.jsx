import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import useTickingValue, { useRelativeTimer } from '../../../hooks/useTickingValue';

export default function ModelAccuracyTile({ accuracy }) {
  const live = useTickingValue(accuracy.score_24h, 0.08, 4500);
  const seconds = useRelativeTimer(8);
  const series = (accuracy.spark_24h || []).map((v, i) => ({ i, v }));

  const delta = accuracy.delta_7d_pp ?? 0;
  const Trend = delta > 0.1 ? TrendingUp : delta < -0.1 ? TrendingDown : Minus;
  const trendColor = delta > 0.1 ? 'text-green-600' : delta < -0.1 ? 'text-red-600' : 'text-text-subtle';
  const onTarget = live >= (accuracy.target ?? 90);

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[9px] uppercase tracking-wider font-bold text-text-subtle">Model Accuracy · 24h</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <motion.span
              key={Math.round(live * 10)}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-2xl font-bold text-text tabular-nums"
            >
              {live.toFixed(1)}%
            </motion.span>
            <span className={`inline-flex items-center text-[11px] font-semibold ${trendColor}`}>
              <Trend className="w-3 h-3 mr-0.5" />
              {delta > 0 ? '+' : ''}{delta.toFixed(1)} pp
            </span>
          </div>
        </div>
        <span
          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
            onTarget ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'
          }`}
        >
          {onTarget ? 'On target' : 'Below target'}
        </span>
      </div>

      <div className="h-12 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
            <Line type="monotone" dataKey="v" stroke="var(--color-brand)" strokeWidth={1.6} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] text-text-subtle mt-1.5">
        <span>Target {accuracy.target}%</span>
        <span>Last refresh: {seconds}s ago</span>
      </div>
    </div>
  );
}
