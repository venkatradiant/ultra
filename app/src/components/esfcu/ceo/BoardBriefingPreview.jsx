import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Presentation, User, Clock } from 'lucide-react';
import brief from '../../../data/esfcu/ceo/boardBriefing.json';

// Step 6 — "Draft the board briefing and recommend an action."
// The drafted briefing: its sections as thumbnails, the recommended actions with
// an owner set and a response-timeframe chip each, and the View Full Briefing
// affordance that launches Presentation Mode.
// `onViewFullBriefing` is optional on purpose: with no handler the button
// dispatches `esfcu-ceo:open-presentation`, which PersonaWorkspace already
// listens for. That is how the manifest wires it — passing a no-op would make
// the button dead.
export default function BoardBriefingPreview({ onViewFullBriefing = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 flex-shrink-0 text-brand" />
          <p className="truncate text-xs font-semibold text-text-muted">{brief.title} — ready to present</p>
        </div>
        <span className="inline-flex flex-shrink-0 items-center gap-1 rounded bg-[#B45309]/10 px-1.5 py-0.5 text-[9.5px] font-semibold text-[#B45309]">
          <ShieldCheck className="h-2.5 w-2.5" />
          {brief.confidence}% validated · division pending
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {brief.sections.map((s, i) => (
          <div key={s.id} className="rounded-lg border border-border-subtle bg-surface p-2.5">
            <div className="mb-1.5 flex h-5 w-5 items-center justify-center rounded bg-brand/[0.06] text-[10px] font-bold text-brand">{i + 1}</div>
            <p className="text-[10.5px] font-semibold leading-tight text-text">{s.label}</p>
            <p className="mt-0.5 text-[9px] leading-snug text-text-subtle">{s.text}</p>
          </div>
        ))}
      </div>

      {/* Recommended actions — owner set + response timeframe, per spec §15a */}
      <div className="mt-3.5">
        <p className="mb-2 text-[9.5px] font-bold uppercase tracking-wide text-text-subtle">Recommended actions</p>
        <div className="space-y-2">
          {brief.recommended_actions.map((a) => (
            <div key={a.id} className="rounded-lg border border-border-subtle bg-surface p-2.5">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                  {a.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-semibold leading-tight text-text">{a.title}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-text-muted">{a.description}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded bg-brand/[0.06] px-1.5 py-0.5 text-[9px] font-semibold text-brand">
                      <User className="h-2.5 w-2.5" /> {a.owner}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">
                      <Clock className="h-2.5 w-2.5" /> {a.timeframe}
                    </span>
                    <span className="text-[8.5px] text-text-subtle">{a.owner_note}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-snug text-text-muted">
        Every figure carries its source-to-report trace, so the board and an NCUA examiner can see how each number was
        built — and where the Howard University division still breaks.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (onViewFullBriefing) onViewFullBriefing();
            else window.dispatchEvent(new CustomEvent('esfcu-ceo:open-presentation'));
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-white/95 transition-colors hover:bg-[#002a50]"
        >
          <Presentation className="h-3.5 w-3.5" />
          View Full Briefing
        </button>
        <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-text-subtle">
          Opens the board-ready Presentation Mode deck
        </span>
      </div>
    </motion.div>
  );
}
