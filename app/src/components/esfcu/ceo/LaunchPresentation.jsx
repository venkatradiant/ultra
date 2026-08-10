import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Presentation } from 'lucide-react';

/**
 * Step 7's visualization is, per spec §10, "Launches Presentation Mode, the
 * full-screen slide deck" — not a card that offers to. This mounts with the
 * turn, fires the deck's open event once, and then stands in the transcript as
 * the record of what happened plus a way back in.
 *
 * The once-guard matters: the chat thread re-renders on every subsequent turn,
 * and without it closing the deck would immediately re-open it.
 */
export default function LaunchPresentation() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    window.dispatchEvent(new CustomEvent('esfcu-ceo:open-presentation'));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-brand/15 bg-brand/[0.04] px-4 py-3"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand text-white">
        <Presentation className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-text">Presentation Mode opened</p>
        <p className="text-[11px] leading-snug text-text-muted">
          Seven board slides, the trust ribbon, and the recommended path. Close it with the header × to come back here.
        </p>
      </div>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('esfcu-ceo:open-presentation'))}
        className="flex-shrink-0 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#002a50]"
      >
        Reopen the briefing
      </button>
    </motion.div>
  );
}
