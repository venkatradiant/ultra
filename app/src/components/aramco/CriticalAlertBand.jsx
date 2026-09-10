/**
 * CriticalAlertBand — the alert's permanent home in the app chrome.
 *
 * One line, on every page, from detection until the incident is resolved. It
 * does not grow, it does not open, it does not scroll. Everything it used to
 * expand into now lives in `CriticalAlertDrawer`, beside the page rather than
 * on top of it.
 *
 * That split is what fixed the thing that was wrong here. Three constraints
 * shaped the original and the third kept breaking the first two:
 *
 *  • **It has to be impossible to miss.** So it sits directly under the header,
 *    in the one place on every page that is above the content. Unchanged.
 *  • **It must not block anything.** So it is a strip in the layout, never a
 *    modal, never a dialog that has to be dismissed before Gina can carry on
 *    reading her morning. Unchanged.
 *  • **It has to hold the whole incident.** This is the one that broke: holding
 *    the incident meant expanding to 599px of a 900px screen, which is blocking
 *    by another name. The detail moved to a column, and the strip went back to
 *    doing the one job it is good at.
 *
 * **It has two voices, and only one of them is loud.**
 *
 * With the drawer shut the strip *is* the alert, and it looks like one: rose
 * ground, a pulsing mark, the headline, the location, the permit, the status.
 * With the drawer open it steps back to a quiet neutral line — because the
 * drawer is now saying all of that, in more detail, nine pixels to the right.
 *
 * The first build did not do this, and side by side the two surfaces were the
 * same rose, the same weight, the same six words, with nothing to say which was
 * which. Red on two adjacent surfaces at once is not twice as urgent; it reads
 * as decoration, and then neither surface reads as urgent at all. So only one
 * of them is ever coloured, and it is whichever one Gina is actually reading.
 */
import { AlertTriangle, CornerUpLeft, PanelRightOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCriticalAlert } from '../../context/CriticalAlertContext';

/** Where the alert has got to, in the app's own status colours. */
const STATUS_TONE = {
  new: 'bg-rose-700 text-white',
  acknowledged: 'bg-amber-500 text-white',
  dispatched: 'bg-brand text-white',
  resolved: 'bg-emerald-600 text-white',
};

export default function CriticalAlertBand() {
  const { active, alert, status, statusMeta, open, setOpen } = useCriticalAlert();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // The way back. The drawer's supporting links are outward — the permit, the
  // camera wall, the muster — and the strip is the only chrome that follows her
  // to all of them, so it is the only honest place to put the return.
  const away = pathname !== '/ask';

  if (!active) return null;

  const resolved = status === 'resolved';
  // Quiet whenever the drawer is carrying the incident. See the note above.
  const quiet = open;

  return (
    <section
      aria-label="Critical safety alert"
      className={`flex-shrink-0 border-b ${
        quiet
          ? 'border-border bg-surface-2/50'
          : resolved
            ? 'border-emerald-600/25 bg-emerald-500/[0.05]'
            : 'border-rose-700/25 bg-rose-700/[0.05]'
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 max-w-[1600px]">
        {/* Loud, the mark is a warning triangle on a tinted chip. Quiet, it is
            a single dot — enough to keep the line identifiable at a glance
            without competing with the drawer's own header. */}
        {quiet ? (
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            resolved ? 'bg-emerald-600' : 'bg-rose-700'
          }`} />
        ) : (
          <span className={`relative flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 ${
            resolved ? 'bg-emerald-600/12' : 'bg-rose-700/12'
          }`}>
            <AlertTriangle className={`w-4 h-4 ${resolved ? 'text-emerald-700' : 'text-rose-700'}`} />
            {/* The pulse stops the moment she has acknowledged it. An alert that
                keeps flashing after it has been picked up is just noise. */}
            {status === 'new' && (
              <span className="absolute inset-0 rounded-lg bg-rose-700/25 animate-ping" />
            )}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className={`text-[13px] tracking-tight ${
            quiet
              ? 'font-semibold text-text-muted'
              : `font-bold ${resolved ? 'text-emerald-800' : 'text-rose-800'}`
          }`}>
            {alert.title}
          </p>
          {/* Dropped while the drawer is open: it is printed verbatim in the
              drawer's header, and saying it twice on one screen is the clutter,
              not the emphasis. */}
          {!quiet && (
            <p className="text-[11px] text-text-muted mt-0.5 truncate">
              Detected {alert.detectedLabel} · {alert.location.vesselName}, {alert.location.zoneName} ·
              permit <span className="font-mono">{alert.permit.id}</span>
            </p>
          )}
        </div>

        {/* Same reasoning: exactly one status pill on screen, and while the
            drawer is open the drawer owns it. */}
        {!quiet && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${
            STATUS_TONE[status] ?? STATUS_TONE.new
          }`}>
            {statusMeta.label}
          </span>
        )}

        {/* The drawer stays put across the trip, so this is only navigation —
            she comes back to the conversation with the incident still open
            exactly as she left it. */}
        {away && (
          <button
            type="button"
            onClick={() => navigate('/ask')}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white bg-brand hover:bg-brand/90 shadow-sm transition-colors cursor-pointer flex-shrink-0"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
            Back to conversation
          </button>
        )}

        {/* Exactly one blue action on screen at a time. With the drawer shut on
            the conversation, opening it is the only thing to do next, so this is
            the filled one. The moment it is open the next step lives inside the
            drawer — the camera — and this drops back to a quiet outline. Off
            `/ask` the primary is the way back, so it is quiet there too. Two
            blue buttons would mean two next actions, which is the same as none. */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0 ${
            !away && !open
              ? 'text-white bg-brand hover:bg-brand/90 shadow-sm'
              : 'border border-border bg-surface text-text-muted hover:text-text'
          }`}
        >
          <PanelRightOpen className="w-3.5 h-3.5" />
          {open ? 'Hide details' : 'View details'}
        </button>
      </div>
    </section>
  );
}
