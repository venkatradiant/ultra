import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import LayerHealthGauge from './LayerHealthGauge';
import { STATE_STYLES, statusForScore } from './stateStyles';

const ORDER = ['healthy', 'degraded', 'failed', 'recovering'];

function HealthBar({ state, count, total }) {
  const style = STATE_STYLES[state];
  const pct = total ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10.5px] font-medium text-text-muted w-[68px] flex-shrink-0">{style.label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden min-w-0">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${style.bar}`}
        />
      </div>
      <span className={`text-[11.5px] font-bold tabular-nums w-6 text-right flex-shrink-0 ${style.text}`}>
        {count}
      </span>
    </div>
  );
}

export default function SystemHealthOverview({ overview, onLayerClick }) {
  const trend = useMemo(
    () => (overview?.trend ?? []).map((value, i) => ({ i, value })),
    [overview?.trend],
  );

  if (!overview) {
    return <div className="bg-surface rounded-xl border border-border-subtle p-5 h-[196px]" />;
  }

  const notHealthy = overview.total - overview.healthy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center gap-2 mb-0.5">
        <Boxes className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold text-text">Platform Overview</h3>
        <span
          className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
            notHealthy === 0
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {notHealthy === 0 ? 'All healthy' : `${notHealthy} need attention`}
        </span>
      </div>
      <p className="text-xs text-text-subtle mb-4">
        The AI platform the AI Governance Admin oversees
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_1.1fr] gap-5 lg:gap-6">
        {/* Total */}
        <div className="flex lg:flex-col items-center lg:items-start gap-3 lg:gap-0">
          <div className="text-[40px] leading-none font-bold text-text tabular-nums">{overview.total}</div>
          <div className="text-[9.5px] text-text-subtle uppercase tracking-wide lg:mt-1">Components</div>
        </div>

        {/* Health split */}
        <div className="space-y-2 min-w-0">
          {ORDER.map((state) => (
            <HealthBar key={state} state={state} count={overview[state]} total={overview.total} />
          ))}
        </div>

        {/* Trend */}
        <div className="min-w-0">
          <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mb-1">Healthy % · last hour</div>
          <div className="h-[72px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="ao-health-trend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={['dataMin - 4', 'dataMax + 2']} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-brand)"
                  strokeWidth={2}
                  fill="url(#ao-health-trend)"
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[9.5px] text-text-subtle tabular-nums">
            <span>{overview.trend[0]}%</span>
            <span className="font-semibold text-text-muted">
              {overview.trend[overview.trend.length - 1]}% now
            </span>
          </div>
        </div>
      </div>

      {/* Layer gauges */}
      <div className="mt-4 pt-4 border-t border-border-subtle">
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">
          Layer health
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {overview.layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => onLayerClick?.(layer.id)}
              className="rounded-lg bg-surface-2 px-3 py-2.5 flex items-center gap-3 w-full text-left
                         hover:bg-surface-2/80 hover:ring-1 hover:ring-brand/20 transition-all cursor-pointer"
              title={`Scroll to ${layer.label} layer`}
            >
              <LayerHealthGauge score={layer.health} status={statusForScore(layer.health)} size={56} />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-text truncate">{layer.label}</div>
                <div className="text-[9.5px] text-text-subtle tabular-nums">
                  {layer.healthy}/{layer.total} healthy
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}