import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SignalCard from '../cards/SignalCard';

function formatRelative(seconds) {
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

// "Last updated" mini chip — a quiet alternative to a ticker. Pulses softly,
// counts up in seconds since the last data refresh, and re-anchors whenever
// the visible signal set changes.
function LiveRefreshChip({ stamp }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const secondsSince = Math.max(0, Math.round((now - stamp) / 1000));
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-subtle tabular-nums">
      <motion.span
        className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      Updated {formatRelative(secondsSince)}
    </span>
  );
}

export default function PrioritySignalsRow({ baseline, snapshot }) {
  const visible = useMemo(() => {
    const all = baseline?.priority_signals_inline || [];
    const ids = snapshot?.signalIds;
    if (!ids) return all;
    if (ids.length === 0) return [];
    const order = new Map(ids.map((id, idx) => [id, idx]));
    return all
      .filter((s) => order.has(s.id))
      .sort((a, b) => order.get(a.id) - order.get(b.id));
  }, [baseline, snapshot]);

  // Re-anchor the "Updated Xs ago" clock when the visible set changes —
  // simulates a live re-fetch each time the snapshot advances.
  const visibleKey = visible.map((s) => s.id).join('|');
  const [stamp, setStamp] = useState(() => Date.now());
  useEffect(() => {
    setStamp(Date.now());
  }, [visibleKey]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-red-600">
          <motion.span
            className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          Live · Right now
        </span>
        <LiveRefreshChip stamp={stamp} />
      </div>

      {!visible.length ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 p-3 text-[11px] font-medium text-emerald-700">
          No active priority signals — operations within target band.
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {visible.map((sig) => (
              <motion.div
                key={sig.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <SignalCard signal={sig} tone="urgent" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
