/**
 * CriticalAlertBand — the alert's home in the app chrome.
 *
 * Three constraints shaped this, and they pull against each other:
 *
 *  • **It has to be impossible to miss.** So it sits directly under the header,
 *    in the one place on every page that is above the content.
 *  • **It must not block anything.** So it is a band in the layout that pushes
 *    the page down, not an overlay, not a modal, and never a dialog that has to
 *    be dismissed before Gina can carry on reading her morning.
 *  • **It must survive navigation.** Its own actions send her to the camera wall
 *    and the muster page. A banner that vanished when she followed its link
 *    would be a banner that punished her for using it. State lives in the
 *    provider above the router; this is only the view.
 *
 * Collapsed it is one line: what happened, where, and where it has got to.
 * Expanded it is the full panel. It arrives collapsed, so the answer it
 * interrupted stays whole behind it, and opening it is the first deliberate step
 * of the incident rather than something that happened to her.
 */
import { AlertTriangle, ChevronDown, ChevronUp, CornerUpLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCriticalAlert } from '../../context/CriticalAlertContext';
import CriticalAlertPanel from './CriticalAlertPanel';

/** Where the alert has got to, in the app's own status colours. */
const STATUS_TONE = {
  new: 'bg-rose-700 text-white',
  acknowledged: 'bg-amber-500 text-white',
  dispatched: 'bg-brand text-white',
  resolved: 'bg-emerald-600 text-white',
};

export default function CriticalAlertBand() {
  const { active, alert, status, statusMeta, expanded, setExpanded } = useCriticalAlert();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // The way back. Every action in the panel is outward — the camera wall, the
  // permit, the muster — and the band is the only chrome that follows her to all
  // of them, so it is the only honest place to put the return. Without it the
  // alert is a one-way door: expand, open the camera, and the only controls left
  // are the ones that opened the camera again.
  const away = pathname !== '/ask';
  // On the conversation, with the alert still collapsed, opening it is the
  // golden path's next step and gets the one blue button.
  const primaryIsDetails = !away && !expanded;

  if (!active) return null;

  const resolved = status === 'resolved';

  return (
    <section
      aria-label="Critical safety alert"
      className={`flex-shrink-0 border-b ${
        resolved ? 'border-emerald-600/25 bg-emerald-500/[0.05]' : 'border-rose-700/25 bg-rose-700/[0.05]'
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 max-w-[1600px]">
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

        <div className="min-w-0 flex-1">
          <p className={`text-[13px] font-bold tracking-tight ${resolved ? 'text-emerald-800' : 'text-rose-800'}`}>
            {alert.title}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5 truncate">
            Detected {alert.detectedLabel} · {alert.location.vesselName}, {alert.location.zoneName} ·
            permit <span className="font-mono">{alert.permit.id}</span>
          </p>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${
          STATUS_TONE[status] ?? STATUS_TONE.new
        }`}>
          {statusMeta.label}
        </span>

        {/* Collapses on the way, so she lands on the conversation and not on a
            panel covering it. The alert itself stays live in the band — a
            man-down does not stop being a man-down because she looked away. */}
        {away && (
          <button
            type="button"
            onClick={() => { setExpanded(false); navigate('/ask'); }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white bg-brand hover:bg-brand/90 shadow-sm transition-colors cursor-pointer flex-shrink-0"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
            Back to conversation
          </button>
        )}

        {/* Exactly one blue action per stage, and this is where it starts. On the
            conversation, with the alert still shut, opening it is the only thing
            to do next — so View details is the filled one. The moment the panel
            is open the primary moves inside it, to the camera, and this drops
            back to a quiet outline. Off `/ask` the primary is the way back, so
            it is quiet there too. Two blue buttons on screen at once would mean
            two next actions, which is the same as none. */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0 ${
            primaryIsDetails
              ? 'text-white bg-brand hover:bg-brand/90 shadow-sm'
              : 'border border-border bg-surface text-text-muted hover:text-text'
          }`}
        >
          {expanded ? 'Hide details' : 'View details'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Rendered, not animated in and out. The panel carries a live roll-call
          and a running timeline; collapsing it should hide it instantly rather
          than play a height transition over a moving progress bar.

          Height-capped with its own scroll: at full height the panel is taller
          than the viewport, so an alert arriving on `/ask` pushed the answer it
          interrupted entirely off screen. It still arrives open and still lands
          with force — it just no longer buries the conversation behind it. */}
      {expanded && (
        <div className="max-h-[min(60vh,560px)] overflow-y-auto scrollbar-sleek">
          <CriticalAlertPanel />
        </div>
      )}
    </section>
  );
}
