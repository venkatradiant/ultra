/**
 * PatternCardGrid — 207 anomalies as six decisions.
 *
 * This is the demo's first real claim, so the grid is ranked by dollar impact
 * rather than by the order the engine emitted them, and the edge-case group is
 * pulled out below the rule instead of sitting sixth in the list. That
 * separation is the honest part: five anomalies with no shared root cause are
 * not a seventh of the work, they are a different kind of work, and averaging
 * them into a "six patterns" claim would overstate what bulk resolution does.
 *
 * Each card links to its own detail view; the conversation chips are the other
 * way in, and both land on the same route.
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getPatterns } from '../../data/att/billing-operator';
import IllustrativeChip from './IllustrativeChip';
import ConfidencePill from './ConfidencePill';

const SEVERITY = {
  critical: { icon: AlertCircle, ring: 'border-rose-200', chip: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Critical' },
  warning: { icon: AlertTriangle, ring: 'border-amber-200', chip: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Warning' },
  info: { icon: Info, ring: 'border-border', chip: 'bg-surface-2 text-text-muted border-border', label: 'Info' },
};

function money(n) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

function PatternCard({ pattern, index, onOpen }) {
  const sev = SEVERITY[pattern.severity] || SEVERITY.info;
  const SevIcon = sev.icon;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(pattern.id)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={`group text-left rounded-xl border bg-surface p-4 min-w-0 transition-all duration-200 hover:shadow-[0_6px_20px_-10px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 cursor-pointer ${sev.ring} ${
        pattern.hero ? 'ring-1 ring-brand/25' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <SevIcon className={`w-3.5 h-3.5 flex-shrink-0 ${pattern.severity === 'critical' ? 'text-rose-600' : pattern.severity === 'warning' ? 'text-amber-600' : 'text-text-subtle'}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 border ${sev.chip}`}>
            {sev.label}
          </span>
          {pattern.hero && (
            <span className="text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 border border-brand/30 bg-brand/8 text-brand">
              Hero
            </span>
          )}
        </div>
        <ArrowUpRight className="w-4 h-4 text-text-subtle group-hover:text-brand transition-colors flex-shrink-0" />
      </div>

      <p className="text-[13.5px] font-bold text-text leading-snug">{pattern.name}</p>
      <p className="text-[11.5px] text-text-muted mt-1 leading-relaxed line-clamp-2">{pattern.description}</p>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-subtle">
        <div className="min-w-0">
          <p className="text-base font-bold text-text leading-none">{pattern.impactedAccounts}</p>
          <p className="text-[9px] text-text-subtle uppercase tracking-wider mt-0.5">accounts</p>
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-text leading-none">{money(pattern.totalFinancialDelta)}</p>
          <p className="text-[9px] text-text-subtle uppercase tracking-wider mt-0.5">impact</p>
        </div>
        <div className="ml-auto flex-shrink-0">
          <ConfidencePill value={pattern.averageConfidence} />
        </div>
      </div>

      <p className="text-[10px] text-text-subtle mt-2.5 leading-snug">
        <span className="font-medium text-text-muted">Root cause:</span> {pattern.rootCause}
      </p>
      <p className="inline-flex items-center gap-1 text-[10px] text-text-subtle mt-1.5">
        <Clock className="w-2.5 h-2.5" /> {pattern.estimatedResolutionTime} to resolve
      </p>
    </motion.button>
  );
}

export default function PatternCardGrid({ getter = getPatterns, onSelect = null }) {
  const patterns = useAsyncData(getter);
  const navigate = useNavigate();
  if (!patterns) return null;

  const open = (id) => {
    if (onSelect) return onSelect(id);
    navigate(`/patterns?pattern=${id}`);
  };

  const grouped = patterns.filter((p) => !p.edgeCase).sort((a, b) => b.totalFinancialDelta - a.totalFinancialDelta);
  const edge = patterns.filter((p) => p.edgeCase);
  const totalImpact = patterns.reduce((s, p) => s + p.totalFinancialDelta, 0);
  const totalAccounts = patterns.reduce((s, p) => s + p.impactedAccounts, 0);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-text tracking-tight">
            Six Resolvable Patterns · {totalAccounts} accounts · {money(totalImpact)}
          </h3>
          <p className="text-[11px] text-text-subtle mt-0.5">
            Ranked by dollar impact. Click any pattern to review its accounts and apply a bulk fix.
          </p>
        </div>
        <IllustrativeChip />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {grouped.map((p, i) => (
          <PatternCard key={p.id} pattern={p} index={i} onOpen={open} />
        ))}
      </div>

      {edge.length > 0 && (
        <>
          <div className="flex items-center gap-3 mt-5 mb-3">
            <span className="h-px flex-1 bg-border-subtle" />
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-text-subtle">
              Not bulk-resolvable
            </span>
            <span className="h-px flex-1 bg-border-subtle" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {edge.map((p, i) => (
              <PatternCard key={p.id} pattern={p} index={grouped.length + i} onOpen={open} />
            ))}
          </div>
          <p className="text-[10.5px] text-text-subtle mt-3 leading-relaxed">
            These five did not group because nothing explains them yet. They carry the highest dollar
            figure per account of the whole cycle and need individual investigation — which is where the
            time freed by the five bulk fixes should go.
          </p>
        </>
      )}
    </div>
  );
}
