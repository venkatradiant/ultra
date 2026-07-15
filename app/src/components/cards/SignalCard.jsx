import { AlertTriangle, TrendingDown, Users, LineChart } from 'lucide-react';
import SourceBadge from '../chat/SourceBadge';
import { tierFor, colorFor } from '../../utils/confidence';

const severityStyles = {
  critical: { border: 'border-red-200',   bg: 'bg-red-50',   icon: AlertTriangle, iconColor: 'text-red-500',    dot: 'bg-red-500'    },
  warning:  { border: 'border-amber-200', bg: 'bg-amber-50', icon: TrendingDown,  iconColor: 'text-amber-500',  dot: 'bg-amber-500'  },
  info:     { border: 'border-blue-200',  bg: 'bg-blue-50',  icon: Users,         iconColor: 'text-blue-500',   dot: 'bg-blue-500'   },
};

const calmStyle = {
  border: 'border-border',
  bg: 'bg-surface',
  icon: LineChart,
  iconColor: 'text-slate-400',
  dot: 'bg-slate-300',
};

// Compact variant — designed for a 3-tile row inside the briefing panel.
// Footprint: small icon + truncated title + 2-line description + tiny meta.
// No source badges, no confidence chip. The chat conversation is where deep
// detail lives.
function CompactCard({ signal, style, tone }) {
  const Icon = style.icon;
  const isCalm = tone === 'calm';
  const meta = isCalm
    ? signal.horizon
    : signal.affected_count != null
      ? `${signal.affected_count.toLocaleString()} members`
      : null;

  return (
    <div className={`h-full rounded-lg border ${style.border} ${style.bg} p-2 flex flex-col gap-1`}>
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon className={`w-3 h-3 flex-shrink-0 ${style.iconColor}`} />
        <h4 className={`text-[10.5px] font-semibold leading-tight truncate ${isCalm ? 'text-text-muted' : 'text-text'}`}>
          {signal.title}
        </h4>
      </div>
      <p
        className={`text-[10px] leading-snug ${isCalm ? 'text-text-muted' : 'text-text-muted'}`}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {signal.description}
      </p>
      {meta ? (
        <div className="flex items-center justify-between gap-1 mt-auto pt-0.5">
          <span className={`text-[9px] font-medium ${isCalm ? 'text-slate-400 uppercase tracking-wide' : 'text-text-muted'} truncate`}>
            {meta}
          </span>
          {!isCalm && signal.confidence?.score != null ? (
            <span
              className="text-[9px] font-bold tabular-nums flex-shrink-0"
              style={{ color: colorFor(tierFor(signal.confidence.score)) }}
            >
              {signal.confidence.score}%
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function SignalCard({ signal, tone = 'urgent', compact = false }) {
  const isCalm = tone === 'calm';
  const style = isCalm
    ? calmStyle
    : (severityStyles[signal.severity] || severityStyles.info);

  if (compact) return <CompactCard signal={signal} style={style} tone={tone} />;

  const Icon = style.icon;
  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${style.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`text-sm font-semibold ${isCalm ? 'text-text-muted' : 'text-text'}`}>
              {signal.title}
            </h4>
            {isCalm && signal.horizon ? (
              <span className="flex-shrink-0 text-[9.5px] font-semibold uppercase tracking-wide text-slate-400 tabular-nums">
                {signal.horizon}
              </span>
            ) : null}
          </div>
          <p className={`text-xs leading-relaxed mb-2 ${isCalm ? 'text-text-muted' : 'text-text-muted'}`}>
            {signal.description}
          </p>
          {!isCalm && (signal.affected_count != null || signal.trend) ? (
            <div className="flex items-center gap-3 text-xs text-text-muted">
              {signal.affected_count != null ? (
                <span className="font-medium">{signal.affected_count.toLocaleString()} members affected</span>
              ) : null}
              {signal.trend ? (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  signal.trend === 'worsening' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {signal.trend}
                </span>
              ) : null}
            </div>
          ) : null}
          {(signal.sources || signal.confidence) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {signal.sources && signal.sources.map((s, i) => <SourceBadge key={i} source={s} />)}
              {signal.confidence && (
                <span
                  className="ml-auto text-[10px] font-semibold tabular-nums"
                  style={{ color: colorFor(tierFor(signal.confidence.score)) }}
                >
                  Confidence {signal.confidence.score}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
