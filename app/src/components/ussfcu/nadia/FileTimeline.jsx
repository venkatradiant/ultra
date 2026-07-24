import { motion } from 'framer-motion';
import { FileText, Check, AlertTriangle, CircleDashed, MessageSquare } from 'lucide-react';
import data from '../../../data/ussfcu/nadia/fileTimeline.json';

// Single-file view: member attributes, the disclosure timeline with the late
// Loan Estimate flagged, the interaction count, and the trigger words highlighted.
const eventMeta = {
  ok: { icon: Check, ring: 'border-emerald-500', dot: 'bg-emerald-500' },
  late: { icon: AlertTriangle, ring: 'border-amber-500', dot: 'bg-amber-500' },
  missing: { icon: CircleDashed, ring: 'border-red-400', dot: 'bg-red-400' },
};

export default function FileTimeline() {
  const { member, events, interactions, footnote, title } = data;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-brand" />
        <p className="text-xs font-semibold text-text-muted">{title}</p>
      </div>

      {/* Member attributes */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {[member.product, `Age ${member.age}`, member.origination, member.channel].map((a) => (
          <span key={a} className="text-[10px] font-medium text-text-muted bg-surface border border-border-subtle rounded px-2 py-0.5">{a}</span>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative pl-1">
        {events.map((e, idx) => {
          const meta = eventMeta[e.status] || eventMeta.ok;
          const Icon = meta.icon;
          const isLast = idx === events.length - 1;
          return (
            <div key={e.id} className="flex gap-3 relative">
              {!isLast && <span className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />}
              <span className={`w-6 h-6 rounded-full bg-surface border-2 ${meta.ring} flex items-center justify-center flex-shrink-0 z-10`}>
                <Icon className={`w-3 h-3 ${e.status === 'ok' ? 'text-emerald-600' : e.status === 'late' ? 'text-amber-600' : 'text-red-500'}`} />
              </span>
              <div className={`min-w-0 flex-1 ${isLast ? '' : 'pb-3'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-text leading-tight">{e.label}</p>
                  <span className="text-[9.5px] text-text-subtle flex-shrink-0">{e.date}</span>
                </div>
                {e.note && <p className={`text-[9.5px] mt-0.5 font-medium ${e.status === 'late' ? 'text-amber-600' : 'text-red-500'}`}>{e.note}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactions */}
      <div className="mt-3 flex items-center gap-2 bg-surface rounded-lg border border-border-subtle px-3 py-2">
        <MessageSquare className="w-3.5 h-3.5 text-text-subtle flex-shrink-0" />
        <span className="text-[10.5px] text-text-muted">{interactions.count} interactions in the window</span>
        <div className="ml-auto flex gap-1.5">
          {interactions.trigger_words.map((t) => (
            <span key={t.word} className="text-[9.5px] font-semibold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
              “{t.word}” ×{t.occurrences}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[9.5px] text-text-subtle mt-2.5 leading-snug">{footnote}</p>
    </motion.div>
  );
}
