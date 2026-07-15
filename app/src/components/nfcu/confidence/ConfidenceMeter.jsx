import { tierFor, colorFor } from '../../../utils/confidence';

export default function ConfidenceMeter({ confidence, compact = false }) {
  if (!confidence || typeof confidence.score !== 'number') return null;
  const score = Math.max(0, Math.min(100, confidence.score));
  const tier = tierFor(score);
  const color = colorFor(tier);

  const W = compact ? 44 : 56;
  const H = compact ? 22 : 28;
  const cx = W / 2;
  const cy = H;
  const r = compact ? 18 : 22;
  const startAngle = Math.PI;
  const endAngle = Math.PI - (score / 100) * Math.PI;

  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = score / 100 > 0.5 ? 1 : 0;

  const trackX1 = cx - r;
  const trackX2 = cx + r;

  return (
    <div className="inline-flex items-center gap-1.5">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label={`Confidence ${score}%`}>
        <path
          d={`M ${trackX1} ${cy} A ${r} ${r} 0 0 1 ${trackX2} ${cy}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={compact ? 3 : 4}
          strokeLinecap="round"
        />
        {score > 0 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth={compact ? 3 : 4}
            strokeLinecap="round"
          />
        )}
      </svg>
      <span className="text-[10px] font-semibold tabular-nums" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}
