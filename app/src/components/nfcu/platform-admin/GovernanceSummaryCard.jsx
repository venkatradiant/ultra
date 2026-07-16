import { motion } from 'framer-motion';
import { ClipboardCheck, ShieldOff, Sparkles, TrendingDown, Activity, CircleDot, CheckCircle2 } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getGovernanceSummary } from '@/data/nfcu/platform-admin/governanceData';

/**
 * The closing turn — the month-to-date governance summary.
 *
 * This was a wall of prose in the chat bubble, with its `**Sovereignty.**`
 * markers rendering as literal asterisks. The four claims Daniel actually needs
 * to make — sovereignty, frontier usage, cost, observability — are four
 * numbers, so they read as four numbers here, each with the sentence that
 * qualifies it. Open items are separated out because they're the only part
 * anyone has to act on.
 */
const TONES = {
  emerald: { icon: 'text-emerald-600', bg: 'bg-emerald-500/10', value: 'text-emerald-700' },
  violet: { icon: 'text-violet-600', bg: 'bg-violet-500/10', value: 'text-violet-700' },
  blue: { icon: 'text-blue-600', bg: 'bg-blue-500/10', value: 'text-blue-700' },
  brand: { icon: 'text-brand', bg: 'bg-brand/10', value: 'text-brand' },
};

const ICONS = {
  sovereignty: ShieldOff,
  frontier: Sparkles,
  cost: TrendingDown,
  observability: Activity,
};

function Pillar({ pillar, index }) {
  const tone = TONES[pillar.tone] ?? TONES.brand;
  const Icon = ICONS[pillar.id] ?? CircleDot;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
      className="rounded-lg border border-border-subtle p-3.5 min-w-0"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${tone.bg}`}>
          <Icon className={`w-3 h-3 ${tone.icon}`} />
        </span>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">
          {pillar.label}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={`text-[22px] font-bold leading-none tabular-nums ${tone.value}`}>
          {pillar.headline}
        </span>
        <span className="text-[10px] text-text-subtle font-medium leading-tight">{pillar.unit}</span>
      </div>

      <p className="text-[11px] font-medium text-text mt-1.5 leading-snug">{pillar.support}</p>
      <p className="text-[10.5px] text-text-muted mt-1 leading-snug">{pillar.detail}</p>
    </motion.div>
  );
}

export default function GovernanceSummaryCard() {
  const data = useAsyncData(getGovernanceSummary);
  if (!data) return null;

  const open = data.openItems ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <ClipboardCheck className="w-4 h-4 text-brand flex-shrink-0" />
          <h3 className="text-sm font-semibold text-text">Governance Summary</h3>
        </div>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
          {data.verdict}
        </span>
      </div>
      <p className="text-xs text-text-subtle mb-4">{data.period}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {data.pillars.map((p, i) => (
          <Pillar key={p.id} pillar={p} index={i} />
        ))}
      </div>

      {/* Open items — the only part anyone has to act on, so it doesn't sit
          inside the grid competing with the four green numbers. */}
      <div className="mt-4 pt-4 border-t border-border-subtle">
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">
          Open items
        </div>

        {open.length === 0 ? (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Nothing outstanding.
          </div>
        ) : (
          <div className="space-y-2">
            {open.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200 px-3 py-2.5"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] text-indigo-900 leading-snug">{item.text}</p>
                  <p className="text-[9.5px] text-indigo-700/80 mt-0.5 font-medium">
                    {item.id} · {item.owner}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-700 pl-0.5">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
              Everything else is green.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
