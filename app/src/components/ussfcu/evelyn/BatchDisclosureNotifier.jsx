import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MailCheck, MapPin } from 'lucide-react';
import data from '../../../data/ussfcu/evelyn/batchNotifications.json';

// Part 3 of the deep-query spec, portfolio altitude: the batch of mortgages
// waiting on a disclosure. Filter by state, then a single human-in-the-loop
// approval sends the notices. Filter/approve state is local/visual only.
export default function BatchDisclosureNotifier() {
  const { title, subtitle, total, disclosure_type, by_state, approval_copy, sent_copy } = data;
  const [state, setState] = useState('ALL');
  const [sent, setSent] = useState(false);

  const count = state === 'ALL' ? total : (by_state.find((s) => s.state === state)?.count ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center gap-2 mb-1">
        <Send className="w-4 h-4 text-brand" />
        <p className="text-xs font-semibold text-text-muted">{title}</p>
      </div>
      <p className="text-[10px] text-text-subtle mb-3">{subtitle}</p>

      {/* Batch summary */}
      <div className="flex items-stretch gap-2 mb-3">
        <div className="bg-surface rounded-lg border border-border-subtle px-4 py-3 flex flex-col justify-center">
          <span className="text-[26px] font-bold text-text leading-none">{count}</span>
          <span className="text-[9.5px] text-text-subtle font-medium mt-1">{state === 'ALL' ? 'across all states' : `in ${state}`}</span>
        </div>
        <div className="flex-1 bg-surface rounded-lg border border-border-subtle px-3 py-2.5 flex items-center">
          <p className="text-[10.5px] text-text-muted leading-snug">{disclosure_type} · pending on {count} {count === 1 ? 'file' : 'files'}</p>
        </div>
      </div>

      {/* Filter by state */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin className="w-3 h-3 text-text-subtle" />
          <span className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">Filter by state</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => !sent && setState('ALL')}
            className={`text-[10.5px] font-semibold rounded-full px-2.5 py-1 border transition-colors ${
              state === 'ALL' ? 'bg-brand text-white border-brand' : 'bg-surface text-text-muted border-border hover:border-brand/40'
            } ${sent ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            All states · {total}
          </button>
          {by_state.map((s) => (
            <button
              key={s.state}
              type="button"
              onClick={() => !sent && setState(s.state)}
              className={`text-[10.5px] font-semibold rounded-full px-2.5 py-1 border transition-colors ${
                state === s.state ? 'bg-brand text-white border-brand' : 'bg-surface text-text-muted border-border hover:border-brand/40'
              } ${sent ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {s.label} · {s.count}
            </button>
          ))}
        </div>
      </div>

      {/* Human-in-the-loop approval */}
      {sent ? (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <MailCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-emerald-800">Sent. {count} {sent_copy}</p>
            <p className="text-[10px] text-emerald-700/80 mt-0.5">Each notice is on the exam evidence trail with its member and file.</p>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setSent(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand text-white text-[12px] font-semibold py-2.5 hover:bg-brand-hover transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Approve &amp; send {count} {count === 1 ? 'notification' : 'notifications'}
          </button>
          <p className="text-[9.5px] text-text-subtle mt-2 leading-snug">{approval_copy}</p>
        </div>
      )}
    </motion.div>
  );
}
