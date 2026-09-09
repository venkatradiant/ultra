/**
 * CriticalAlertContext — the Unit 3 man-down alert, held above the routes.
 *
 * The alert has to outlive navigation. Every one of its actions sends Gina
 * somewhere else in the app — the camera wall, the muster page — and an alert
 * that reset when she followed its own link would be worse than useless. So the
 * lifecycle lives in a provider mounted in the shell, and the band and panel
 * are just views onto it.
 *
 * **Who gets this:** the HSE GM alone. The provider returns an inert value for
 * every other persona, so the other three Aramco personas and every other
 * tenant mount a context that never arms and renders nothing.
 *
 * **What is on a timer and what is not.** Only two things move on their own:
 * the alert arriving, a few seconds after the briefing lands so the greeting
 * reads first and the alert genuinely *arrives* while she is reading; and the
 * rescue team acknowledging a callout she has already made. Every status
 * transition is something Gina did. A demo that advances itself is a demo that
 * gets away from whoever is presenting it.
 */
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { usePersona } from './PersonaContext';
import useAsyncData from '../hooks/useAsyncData';
import { getCriticalAlert } from '../data/aramco/hse-gm';

const CriticalAlertContext = createContext(null);

/** The one persona this is authored for. */
const OWNER_PERSONA = 'aramco_hse_gm';

/** Inert shape, so consumers never branch on "is there a provider". */
const DORMANT = {
  active: false,
  alert: null,
  status: null,
  timeline: [],
  confirmed: new Set(),
  expanded: false,
  musterStartedAt: null,
  responderAcked: false,
  setExpanded: () => {},
  confirmAction: () => {},
  resolve: () => {},
  notifications: [],
};

/**
 * `Set` identity is what tells React a confirmation happened, so every mutation
 * makes a new one rather than mutating in place.
 */
function withAdded(set, id) {
  const next = new Set(set);
  next.add(id);
  return next;
}

export function CriticalAlertProvider({ children }) {
  const persona = usePersona();
  const owns = persona?.id === OWNER_PERSONA;

  // The getter is only handed over for the owning persona, so no other tenant
  // pays for the fixture — `useAsyncData` resolves to null and stays there.
  const feed = useAsyncData(owns ? getCriticalAlert : NO_ALERT);
  const alert = owns ? feed?.alert ?? null : null;

  const [armed, setArmed] = useState(false);
  const [status, setStatus] = useState('new');
  const [confirmed, setConfirmed] = useState(() => new Set());
  const [expanded, setExpanded] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [musterStartedAt, setMusterStartedAt] = useState(null);
  const [responderAcked, setResponderAcked] = useState(false);

  // Switching persona puts the alert back in its box, so coming back to Gina
  // replays the arrival rather than resuming a half-worked incident — which is
  // what a presenter running the demo twice actually wants.
  //
  // Done as a render-phase adjustment rather than an effect. React handles a
  // setState during the render of the *same* component by re-running it before
  // committing, so the children never see the stale incident for a frame, and
  // there is no cascading second render to pay for.
  const [lastPersonaId, setLastPersonaId] = useState(persona?.id ?? null);
  if ((persona?.id ?? null) !== lastPersonaId) {
    setLastPersonaId(persona?.id ?? null);
    setArmed(false);
    setStatus('new');
    setConfirmed(new Set());
    setExpanded(false);
    setTimeline([]);
    setMusterStartedAt(null);
    setResponderAcked(false);
  }

  // Collapse — never expand — when she navigates. The band arrives open on the
  // briefing because that is where she is reading, but its own actions send her
  // to pages she has gone to *look at*, and an expanded incident panel would
  // push the camera she just asked for below the fold. The one-line summary
  // still follows her everywhere, and re-opening is one click.
  const location = useLocation();
  const [lastPath, setLastPath] = useState(location.pathname);
  if (location.pathname !== lastPath) {
    setLastPath(location.pathname);
    if (expanded) setExpanded(false);
  }

  // Arrival. Deliberately not on mount: the greeting is the first thing she
  // reads, and the alert lands on top of it a moment later.
  useEffect(() => {
    if (!owns || !alert || armed) return undefined;
    const delay = (alert.armAfterSeconds ?? 8) * 1000;
    const t = setTimeout(() => {
      setArmed(true);
      // Arriving open. An alert that needs a click before it says anything is a
      // notification pretending to be an alert. She can collapse it, and the
      // band then stays however she left it.
      setExpanded(true);
      setTimeline([{ id: 'detected', label: 'Detected', at: alert.detectedLabel, detail: alert.summary }]);
    }, delay);
    return () => clearTimeout(t);
  }, [owns, alert, armed]);

  // The rescue team answering a callout Gina has made. The only event in the
  // alert that is neither her doing nor its arrival.
  const ackTimer = useRef(null);
  useEffect(() => {
    if (status !== 'dispatched' || responderAcked || !alert?.responderAck) return undefined;
    ackTimer.current = setTimeout(() => {
      setResponderAcked(true);
      setTimeline((t) => [...t, {
        id: 'responder-ack',
        label: alert.responderAck.label,
        at: 'just now',
        detail: alert.responderAck.detail,
      }]);
    }, (alert.responderAck.afterSeconds ?? 12) * 1000);
    return () => clearTimeout(ackTimer.current);
  }, [status, responderAcked, alert]);

  const confirmAction = useCallback((actionId) => {
    if (!alert) return;
    const action = alert.actions.find((a) => a.id === actionId);
    if (!action) return;

    setConfirmed((prev) => withAdded(prev, actionId));
    setTimeline((t) => [...t, {
      id: actionId,
      label: action.label,
      at: 'just now',
      detail: action.confirmedNote ?? action.description,
    }]);

    if (action.kind === 'muster') setMusterStartedAt(Date.now());

    // Status only ever moves forward. Dispatching before notifying should not
    // walk the alert back to "Acknowledged".
    if (action.advancesTo) {
      setStatus((current) => {
        const order = alert.statusFlow.map((s) => s.id);
        return order.indexOf(action.advancesTo) > order.indexOf(current) ? action.advancesTo : current;
      });
    }
  }, [alert]);

  const resolve = useCallback(() => {
    if (!alert) return;
    setStatus('resolved');
    setTimeline((t) => [...t, {
      id: 'resolved',
      label: 'Resolved',
      at: 'just now',
      detail: alert.resolve?.confirmedNote ?? 'Alert closed.',
    }]);
  }, [alert]);

  const value = useMemo(() => {
    if (!owns || !alert || !armed) return DORMANT;
    const statusMeta = alert.statusFlow.find((s) => s.id === status) ?? alert.statusFlow[0];
    return {
      active: true,
      alert,
      status,
      statusMeta,
      timeline,
      confirmed,
      expanded,
      musterStartedAt,
      responderAcked,
      setExpanded,
      confirmAction,
      resolve,
      // Feeds the header bell, so the alert has a second home that is not the
      // band — and still no pop-up anywhere.
      notifications: [{
        id: alert.id,
        title: alert.title,
        detail: `${statusMeta.label} — ${alert.location.vesselName}, ${alert.location.zoneName}.`,
        at: alert.detectedLabel,
        unread: status === 'new',
        tone: 'warning',
      }],
    };
  }, [owns, alert, armed, status, timeline, confirmed, expanded, musterStartedAt,
    responderAcked, confirmAction, resolve]);

  return (
    <CriticalAlertContext.Provider value={value}>{children}</CriticalAlertContext.Provider>
  );
}

/** Stable no-op getter, so `useAsyncData`'s effect does not refire every render. */
async function NO_ALERT() { return null; }

/** Always returns a usable shape — `active: false` outside the owning persona. */
export function useCriticalAlert() {
  return useContext(CriticalAlertContext) ?? DORMANT;
}

export default CriticalAlertContext;
