/**
 * Spec §13 "domain pattern": one consistent risk read reused across the
 * finance views — a value, its parameter or limit, the headroom or breach, a
 * trend sparkline, and the source and freshness. The delinquency, limit,
 * capital, liquidity and SEG views all open with a row of these.
 */
const TONES = {
  critical: { value: 'text-critical', pill: 'bg-critical-subtle text-critical border-critical/20', line: 'var(--color-critical)' },
  warning: { value: 'text-warning', pill: 'bg-warning-subtle text-warning border-warning/20', line: 'var(--color-warning)' },
  success: { value: 'text-text', pill: 'bg-success-subtle text-success border-success/20', line: 'var(--color-success)' },
  neutral: { value: 'text-text', pill: 'bg-surface text-text-muted border-border', line: 'var(--color-brand)' },
};

function Sparkline({ points, color }) {
  if (!points || points.length < 2) return null;
  const w = 64;
  const h = 20;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * w},${h - 2 - ((p - min) / span) * (h - 4)}`)
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0" aria-hidden="true">
      <polyline points={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RiskRead({ label, value, limit, status, tone = 'neutral', trend, source, freshness = 'Overnight scan' }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <div className="min-w-0 rounded-lg border border-border-subtle bg-surface p-3">
      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-subtle" title={label}>{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <span className={`text-[18px] font-bold leading-none tabular-nums ${t.value}`}>{value}</span>
        <Sparkline points={trend} color={t.line} />
      </div>
      {limit ? <p className="mt-1.5 text-[10.5px] text-text-muted">{limit}</p> : null}
      {status ? (
        <span className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${t.pill}`}>{status}</span>
      ) : null}
      <p className="mt-1.5 text-[9.5px] leading-snug text-text-subtle">
        {source} · {freshness}
      </p>
    </div>
  );
}
