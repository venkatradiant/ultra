import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

/**
 * Sensitive Field Registry — every field the KAG flags as sensitive, the rule that
 * flags it, and its source system. Data: { title, subtitle, rows[] }.
 */
const classPill = (c) => {
  if (c.startsWith('PII')) return 'bg-red-50 text-red-600 border border-red-200';
  if (c.startsWith('Sensitive')) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-surface-2 text-text-muted border border-border';
};

export default function SensitiveFieldRegistry({ data }) {
  if (!data?.rows) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center gap-2 mb-0.5">
        <ShieldAlert className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold text-text">{data.title}</h3>
        <span className="ml-auto text-[10px] font-semibold text-text-subtle">{data.rows.length} fields</span>
      </div>
      <p className="text-xs text-text-subtle mb-4">{data.subtitle}</p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Field</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Classification</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Rule</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Source System</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, idx) => (
              <tr key={idx} className="border-b border-border-subtle hover:bg-surface-2/50 transition-colors">
                <td className="py-3 px-3 text-text font-medium text-[11px] whitespace-nowrap">{row.field}</td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${classPill(row.classification)}`}>
                    {row.classification}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">{row.rule}</span>
                </td>
                <td className="py-3 px-3 text-text-muted text-[11px]">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
