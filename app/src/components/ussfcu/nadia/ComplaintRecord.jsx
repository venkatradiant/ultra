import { motion } from 'framer-motion';
import { MessageSquareWarning, Check } from 'lucide-react';
import data from '../../../data/ussfcu/nadia/complaintRecord.json';

// A logged complaint record: category, member and file link, transcript excerpt,
// and status — now visible in the complaint register.
export default function ComplaintRecord() {
  const { title, record, footnote } = data;
  const fields = [
    { label: 'Category', value: record.category },
    { label: 'Regulation', value: record.regulation },
    { label: 'Member file', value: record.member_file },
    { label: 'Channel', value: record.channel },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="w-4 h-4 text-brand" />
          <p className="text-xs font-semibold text-text-muted">{title}</p>
        </div>
        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
          <Check className="w-2.5 h-2.5" />
          {record.status}
        </span>
      </div>

      <div className="bg-surface rounded-lg border border-border-subtle p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-semibold text-text-muted">{record.id}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-2.5">
          {fields.map((f) => (
            <div key={f.label}>
              <p className="text-[8.5px] font-semibold uppercase tracking-wide text-text-subtle">{f.label}</p>
              <p className="text-[11px] font-medium text-text leading-tight mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border-subtle pt-2">
          <p className="text-[8.5px] font-semibold uppercase tracking-wide text-text-subtle mb-1">Evidence · {record.evidence}</p>
          <p className="text-[11px] italic text-text-muted leading-snug">{record.excerpt}</p>
        </div>
      </div>

      <p className="text-[9.5px] text-text-subtle mt-2.5 leading-snug">{footnote}</p>
    </motion.div>
  );
}
