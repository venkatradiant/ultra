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
 * Expanded it is the full panel. It arrives open — the provider sets that at the
 * moment the alert arms — and after that it obeys whatever Gina last chose.
 */
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
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

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-text-muted hover:text-text transition-colors cursor-pointer flex-shrink-0"
        >
          {expanded ? 'Hide details' : 'View details'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Rendered, not animated in and out. The panel carries a live roll-call
          and a running timeline; collapsing it should hide it instantly rather
          than play a height transition over a moving progress bar. */}
      {expanded && <CriticalAlertPanel />}
    </section>
  );
}
