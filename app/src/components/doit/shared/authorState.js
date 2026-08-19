import { useSyncExternalStore } from 'react';
import { DEFAULT_CLEANING, SURVEY_2_QUESTIONS } from '../../../data/doit/_shared/constants';

/**
 * A tiny module-scoped store for the Author's cross-turn choices.
 *
 * Why this exists: cards render through `manifest.inlineComponents`, which is
 * called per message. A choice made on turn 2 (which data-quality fixes to
 * apply) has to be visible to turn 3's receipt card and to turn 6's report
 * methodology line — three separate component instances in three separate
 * messages. Lifting the state to a store is the only way they can agree, and
 * "they agree" is the whole point of the cleaning story.
 *
 * Deliberately not React context: PersonaWorkspace owns the tree and no DoIT
 * provider can be inserted without a shared-code edit. A module store keeps the
 * tenant self-contained.
 */

const initial = () => ({
  /**
   * Dialogs already dismissed, by id.
   *
   * A component-local `useState(true)` is not enough: `inlineComponents` is
   * re-invoked on every thread render, and when React remounts the element the
   * dialog springs back open over whatever the user moved on to. ESFCU's
   * LaunchPresentation hits the same hazard and guards it with a ref, which
   * survives re-render but not remount. This survives both.
   */
  dismissedModals: [],
  cleaning: { ...DEFAULT_CLEANING },
  /** Delivery formats chosen on the publish path. */
  formats: ['conversational'],
  /** Which distribution list the survey goes to. */
  distributionList: 'Permit Renewers 2025',
  /**
   * The Permit Renewal Feedback draft, as the author has it right now.
   *
   * This used to be component-local state inside DraftSurveyPanel, which meant
   * every edit was thrown away the moment the conversation moved past that turn
   * — and the resident preview, having nothing to read, quoted one hardcoded
   * question instead of the survey. It lives here so the preview and the
   * publish receipt describe the survey the author actually built.
   */
  draftQuestions: SURVEY_2_QUESTIONS.map((q) => ({
    ...q,
    options: Array.isArray(q.options) ? [...q.options] : q.options,
  })),
  /** Report fields, editable in place. */
  reportSubject: 'Maryland Resident Experience Survey — Results Summary',
  reportHeadline: 'Satisfaction dipped to 72% this wave; wait times are the leading concern.',
  /**
   * Which of the day's two action items are finished.
   *
   * The briefing is regenerated from this, so "Back to briefing" describes the
   * day the author is actually having rather than replaying the 6 a.m. version
   * of it. Written from the manifest's `onFlowEnter` — deliberately not from a
   * card's click handler, because every modal's confirm label is also offered
   * as a chip, and clicking the chip would otherwise skip the write.
   */
  done: { results: false, draft: false },
});

let state = initial();
const listeners = new Set();

const emit = () => {
  listeners.forEach((l) => l());
};

export function setAuthorState(patch) {
  state = { ...state, ...patch };
  emit();
}

export function resetAuthorState() {
  state = initial();
  emit();
}

export function getAuthorState() {
  return state;
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useAuthorState() {
  return useSyncExternalStore(subscribe, getAuthorState, getAuthorState);
}

/** Replace the draft's question list. */
export function setDraftQuestions(draftQuestions) {
  setAuthorState({ draftQuestions });
}

/**
 * Record that one of the day's action items is finished.
 *
 * Idempotent: the flows that land here can be reached more than once in a
 * session (a chip and a modal both route to them), and marking twice must not
 * churn the store and re-render every subscriber.
 */
export function markDone(track) {
  if (state.done[track]) return;
  setAuthorState({ done: { ...state.done, [track]: true } });
}

/** Mark a dialog as dismissed so a remount cannot re-open it. */
export function dismissModal(id) {
  if (state.dismissedModals.includes(id)) return;
  setAuthorState({ dismissedModals: [...state.dismissedModals, id] });
}

/**
 * Open-once dialog state. Returns `open` and a `close` that both hides the
 * dialog and records the dismissal, so the answer survives a remount.
 */
export function useOpenOnce(id) {
  const { dismissedModals } = useAuthorState();
  return { open: !dismissedModals.includes(id), close: () => dismissModal(id) };
}
