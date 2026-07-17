import { motion } from 'framer-motion';
import { Recycle, Cpu, Zap, Scale, User } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getCacheReuse } from '@/data/nfcu/platform-admin/governanceData';

/**
 * Turn 7 — Semantic Cache Reuse. CR-04 / spec v2 Step 7.
 *
 * Shankar's most concrete token example: two users ask the same question, the
 * second never reaches a model. The whole design job is making that *visually*
 * obvious — so the two queries sit side by side and the second one is
 * conspicuously cheaper: no model, no tokens, no cost, faster.
 *
 * SCOPE: the month strip is month-wide and cross-user. It deliberately does not
 * touch the turn-6 cost report ($0.63 for one of Priya's sessions) — different
 * window. See the note in governanceData.CACHE_REUSE.
 */
function QueryCard({ q, cached }) {
  return (
    <div
      className={`flex-1 min-w-0 rounded-lg border px-3 py-2.5 ${
        cached ? 'border-emerald-200 bg-emerald-50/50' : 'border-border-subtle bg-surface-2'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-5 h-5 rounded bg-surface flex items-center justify-center flex-shrink-0">
          <User className="w-3 h-3 text-text-muted" />
        </span>
        <span className="text-[10.5px] font-semibold text-text truncate">{q.user}</span>
        <span className="ml-auto text-[9.5px] text-text-subtle tabular-nums flex-shrink-0">{q.at}</span>
      </div>

      <p className="text-[11px] text-text leading-snug mb-2">“{q.query}”</p>

      <span
        className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
          cached
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : 'bg-violet-50 text-violet-700 border border-violet-200'
        }`}
      >
        {cached ? 'CACHE HIT' : 'MODEL CALL'}
      </span>

      <div className="mt-2 pt-2 border-t border-border-subtle space-y-0.5">
        <div className="flex justify-between text-[10px]">
          <span className="text-text-subtle">Model</span>
          <span className="text-text font-medium text-right truncate ml-2">{q.model}</span>
        </div>
        <div className="flex justify-between text-[10px] tabular-nums">
          <span className="text-text-subtle">Tokens</span>
          <span className={cached ? 'text-emerald-700 font-bold' : 'text-text font-medium'}>
            {q.tokens.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-[10px] tabular-nums">
          <span className="text-text-subtle">Cost</span>
          <span className={cached ? 'text-emerald-700 font-bold' : 'text-text font-medium'}>
            ${q.cost.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-[10px] tabular-nums">
          <span className="text-text-subtle">Latency</span>
          <span className={cached ? 'text-emerald-700 font-bold' : 'text-text font-medium'}>
            {q.latencyMs.toLocaleString()}ms
          </span>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, value, label }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2.5 min-w-0">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-emerald-600 flex-shrink-0" />
        <span className="text-[15px] font-bold text-text tabular-nums truncate">{value}</span>
      </div>
      <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mt-0.5 truncate">{label}</div>
    </div>
  );
}

export default function CacheReusePanel() {
  const d = useAsyncData(getCacheReuse);
  if (!d) return null;

  const { pair, month } = d;
  const tokensK = `${Math.round(month.tokensAvoided / 1000)}K`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <div className="flex items-center gap-2">
          <Recycle className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-semibold text-text">Semantic Cache Reuse</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
          Zero new tokens
        </span>
      </div>
      <p className="text-xs text-text-subtle mb-4">Same question, two people, inside an hour</p>

      {/* The reuse, made obvious */}
      <div className="flex items-stretch gap-2">
        <QueryCard q={pair.first} cached={false} />
        <QueryCard q={pair.second} cached />
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-text-muted">
        <span className="font-semibold text-emerald-700 tabular-nums">
          {(pair.similarity * 100).toFixed(0)}% similar
        </span>
        <span className="text-text-subtle">
          · cleared the {(pair.threshold * 100).toFixed(0)}% reuse threshold, so the second call never reached a model
        </span>
      </div>

      {/* Month strip */}
      <div className="mt-4 pt-4 border-t border-border-subtle">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Reuse this month
          </span>
          <span className="ml-auto text-[9.5px] text-text-subtle tabular-nums">
            {month.cacheHits.toLocaleString()} of {month.tasks.toLocaleString()} tasks
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Metric icon={Recycle} value={`${month.hitRatePct}%`} label="Cache hit rate" />
          <Metric icon={Cpu} value={tokensK} label="Tokens avoided" />
          <Metric icon={Scale} value={`$${month.costAvoided.toFixed(2)}`} label="Cost avoided" />
          <Metric icon={Zap} value={`${(month.latencySavedMs / 1000).toFixed(1)}s`} label="Latency saved / hit" />
        </div>
      </div>

      <div className="flex items-start gap-2 mt-3 rounded-lg bg-amber-50/60 border border-amber-200 px-3 py-2">
        <Scale className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="text-[10.5px] text-amber-900">{d.policy}</p>
      </div>
    </motion.div>
  );
}
