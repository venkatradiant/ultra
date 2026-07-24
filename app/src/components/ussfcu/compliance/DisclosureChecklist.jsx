import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle, CircleDashed } from 'lucide-react';

// Shared member-specific disclosure checklist. Each disclosure carries its
// regulation, required-by rule, and a status. Driven by the `data` prop.
const statusMeta = {
  delivered: { icon: Check, dot: 'bg-emerald-600 border-emerald-600', text: 'text-emerald-700', label: 'Delivered', badge: 'bg-emerald-100 text-emerald-700' },
  on_file: { icon: Check, dot: 'bg-emerald-600 border-emerald-600', text: 'text-emerald-700', label: 'On file', badge: 'bg-emerald-100 text-emerald-700' },
  pending: { icon: CircleDashed, dot: 'bg-surface border-border', text: 'text-text-muted', label: 'Pending', badge: 'bg-slate-100 text-slate-600' },
  late: { icon: AlertTriangle, dot: 'bg-amber-500 border-amber-500', text: 'text-amber-700', label: 'Late — cure', badge: 'bg-amber-100 text-amber-700' },
  past_due: { icon: AlertTriangle, dot: 'bg-red-500 border-red-500', text: 'text-red-700', label: 'Past due', badge: 'bg-red-100 text-red-600' },
};

export default function DisclosureChecklist({ data }) {
  if (!data) return null;
  const { title, member_label, items = [], footnote } = data;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="mb-3">
        <p className="text-xs font-semibold text-text-muted">{title}</p>
        {member_label && <p className="text-[10px] text-text-subtle mt-0.5">{member_label}</p>}
      </div>

      <div className="space-y-1.5">
        {items.map((it, idx) => {
          const meta = statusMeta[it.status] || statusMeta.pending;
          const Icon = meta.icon;
          return (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="flex items-center gap-2.5 bg-surface rounded-lg px-3 py-2 border border-border-subtle"
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border ${meta.dot}`}>
                <Icon className="w-2.5 h-2.5 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-text leading-tight">{it.disclosure}</p>
                <p className="text-[9.5px] text-text-subtle leading-snug mt-0.5">{it.regulation} · {it.required_by}</p>
              </div>
              <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${meta.badge}`}>
                {meta.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {footnote && <p className="text-[9.5px] text-text-subtle mt-2.5 leading-snug">{footnote}</p>}
    </motion.div>
  );
}
