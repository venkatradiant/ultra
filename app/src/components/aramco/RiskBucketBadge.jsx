/**
 * RiskBucketBadge — the four risk buckets every TrackLynk finding is framed in.
 *
 * Deliberately NOT brand-tinted. The product brand is coral, and on a safety
 * product a coral badge next to a coral button reads as chrome rather than as
 * risk. Each bucket owns a distinct hue so a "safety" flag can never be mistaken
 * for a primary action.
 */
import { ShieldAlert, HeartPulse, Wrench, Scale } from 'lucide-react';

const BUCKETS = {
  safety: {
    label: 'Safety',
    icon: ShieldAlert,
    classes: 'bg-rose-50 text-rose-800 border-rose-200',
    dot: 'bg-rose-700',
  },
  health: {
    label: 'Health',
    icon: HeartPulse,
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-600',
  },
  equipment: {
    label: 'Equipment',
    icon: Wrench,
    classes: 'bg-sky-50 text-sky-800 border-sky-200',
    dot: 'bg-sky-600',
  },
  compliance: {
    label: 'Compliance',
    icon: Scale,
    classes: 'bg-violet-50 text-violet-800 border-violet-200',
    dot: 'bg-violet-600',
  },
};

/** The four buckets in their canonical order — for legends and filter rows. */
export const RISK_BUCKET_ORDER = ['safety', 'health', 'equipment', 'compliance'];

export function riskBucketMeta(bucket) {
  return BUCKETS[bucket] || null;
}

export default function RiskBucketBadge({ bucket, size = 'md', withIcon = true, className = '' }) {
  const meta = BUCKETS[bucket];
  if (!meta) return null;
  const Icon = meta.icon;
  const sizing =
    size === 'sm'
      ? 'text-[9.5px] px-1.5 py-0.5 gap-1'
      : size === 'lg'
      ? 'text-[12px] px-2.5 py-1 gap-1.5'
      : 'text-[10.5px] px-2 py-0.5 gap-1';
  const iconSize = size === 'lg' ? 'w-3.5 h-3.5' : size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-wide whitespace-nowrap ${meta.classes} ${sizing} ${className}`}
    >
      {withIcon ? <Icon className={`${iconSize} flex-shrink-0`} /> : <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />}
      {meta.label}
    </span>
  );
}
