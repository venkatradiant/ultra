/**
 * CriticalAlertDrawer — the incident, as a column beside the page.
 *
 * This replaces an expanding band, and the difference is the whole point.
 *
 * The band was in the layout: opening it pushed everything down. Measured on a
 * 900px window it took 599px — two thirds of the screen — leaving the
 * conversation 237px, with 344px of the alert's own content hidden behind a
 * second, nested scrollbar. Two stacked scrollers, the answer she had just
 * asked for squeezed into a strip, and the one action the beat exists for below
 * the fold of the inner one. It also had to slam shut every time she navigated,
 * because left open it would have buried whatever she went to look at.
 *
 * A column costs width, not height. `AppShell` reserves margin for it, so the
 * conversation keeps its full height, its own single scroller, and its scroll
 * position; the drawer simply sits next to it. Nothing is covered, so nothing
 * has to close — the incident follows her to the permit, the muster page and
 * the camera wall, and she never has to find her way back into it.
 *
 * **Below `lg` it is a full-screen sheet.** A 440px column on a phone is not a
 * column, it is the page — so on small screens it takes the screen honestly,
 * over a scrim, with the same close button.
 *
 * **Closing is always available and never destructive.** Escape, the ✕, and the
 * strip's own toggle all just hide the column. The red strip under the header
 * stays up until the incident is resolved: a man-down does not stop being a
 * man-down because she closed a panel.
 */
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useCriticalAlert } from '../../context/CriticalAlertContext';
import CriticalAlertPanel from './CriticalAlertPanel';

/** Where the alert has got to, in the app's own status colours. */
const STATUS_TONE = {
  new: 'bg-rose-700 text-white',
  acknowledged: 'bg-amber-500 text-white',
  dispatched: 'bg-brand text-white',
  resolved: 'bg-emerald-600 text-white',
};

/** Matches the `lg:mr-*` reserved by AppShell, so the column and the gap agree. */
export const DRAWER_WIDTH = 440;

export default function CriticalAlertDrawer() {
  const { active, alert, status, statusMeta, open, setOpen } = useCriticalAlert();

  // Escape closes, from anywhere. Registered on the document rather than the
  // panel because the point of this drawer is that focus is usually somewhere
  // else — she is reading the conversation next to it, not tabbing through it.
  //
  // Unless something modal is on top. The drawer's own links open things that
  // are modal — the full camera wall's viewer, for one — and those close on
  // Escape too. Without this check one press closed both, so dismissing the
  // camera she had just opened also shut the incident behind it, which is
  // precisely the "I pressed back and lost everything" the drawer exists to
  // stop. The drawer is the bottom of the stack, so it yields to anything
  // above it and takes the *next* press.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      // The drawer is deliberately not `aria-modal` — it sits beside the page,
      // not over it — so this selector finds only the things stacked on top.
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!active) return null;

  const resolved = status === 'resolved';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim, small screens only. On `lg` and up the drawer is beside the
              page rather than over it, and a scrim there would dim a
              conversation Gina is meant to be reading at the same time. */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-slate-950/40"
            aria-hidden="true"
          />

          <motion.aside
            key="drawer"
            role="dialog"
            aria-label={`${alert.title} — incident detail`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            style={{ ['--drawer-w']: `${DRAWER_WIDTH}px` }}
            className={`fixed z-50 top-0 right-0 bottom-0 w-full lg:w-[var(--drawer-w)] flex flex-col border-l-2 shadow-2xl bg-surface ${
              resolved ? 'border-emerald-600/50' : 'border-rose-700/50'
            }`}
          >
            {/* Neutral, deliberately.
                
                The header used to be washed in the same rose tint as the strip
                under the app header, and with both on screen at once the two
                competed: two red banners, adjacent, carrying the same six words
                — nothing said which one to read, and a colour used on two
                surfaces at once stops meaning "urgent" and starts meaning
                "decoration". So the wash is gone from both, and severity is
                carried by the things that are *about* severity: the icon and
                the status pill. One saturated element per surface. */}
            <header className="flex-shrink-0 border-b border-border bg-surface px-4 py-3">
              <div className="flex items-start gap-2.5">
                <span className={`flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 ${
                  resolved ? 'bg-emerald-600/12' : 'bg-rose-700/12'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${resolved ? 'text-emerald-700' : 'text-rose-700'}`} />
                </span>

                <p className="min-w-0 flex-1 text-[13px] font-bold tracking-tight leading-snug text-text">
                  {alert.title}
                </p>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close incident detail"
                  className="flex-shrink-0 w-7 h-7 rounded-lg border border-border bg-surface text-text-muted hover:text-text inline-flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* State before detail: what it is, then where it has got to, then
                  the particulars. */}
              <div className="mt-2 flex items-center gap-2 pl-[38px]">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  STATUS_TONE[status] ?? STATUS_TONE.new
                }`}>
                  {statusMeta.label}
                </span>
              </div>

              <p className="mt-1.5 pl-[38px] text-[10.5px] text-text-subtle leading-snug">
                Detected {alert.detectedLabel} · {alert.location.vesselName}, {alert.location.zoneName}
                <br />
                permit <span className="font-mono">{alert.permit.id}</span>
              </p>
            </header>

            {/* The column's one scroller. There is no second one inside it, and
                nothing outside it scrolls with it. */}
            <div className="flex-1 overflow-y-auto scrollbar-sleek">
              <CriticalAlertPanel />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
