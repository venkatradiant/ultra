import { useEffect, useRef } from 'react';

export const OPEN_SURVEY_EVENT = 'doit-resident:open-survey';

/**
 * Opens the survey at t=0, then renders nothing.
 *
 * A resident arriving at a survey link should see the survey, not an internal
 * briefing screen with their name missing from it. This fires before the
 * greeting's typing delay lands, so the overlay is up by the time anything else
 * would have painted.
 *
 * The once-guard is not optional. It follows the precedent set by
 * `esfcu/ceo/LaunchPresentation.jsx`, whose own comment explains why: the chat
 * thread re-renders on every subsequent turn, and without the guard closing the
 * overlay immediately re-opens it.
 *
 * Mounted through `initialExtras`, which is gated on `isInitialView` — so it
 * unmounts as soon as the thread advances. For a fire-once launcher that is the
 * right lifecycle, but note that no other persona uses the slot this way. If it
 * ever proves unreliable, the fallback is to register this as an
 * `inlineComponent` on `resident_greeting` instead, matching ESFCU exactly.
 */
export default function SurveyAutoLaunch() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    window.dispatchEvent(new CustomEvent(OPEN_SURVEY_EVENT));
  }, []);

  return null;
}
