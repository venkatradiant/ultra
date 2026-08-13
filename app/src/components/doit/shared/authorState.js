import { useSyncExternalStore } from 'react';
import { DEFAULT_CLEANING } from '../../../data/doit/_shared/constants';

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
  /** Q7's answer options, empty until the author sets them. */
  q7Options: [],
  /** Report fields, editable in place. */
  reportSubject: 'Maryland Resident Experience Survey — Results Summary',
  reportHeadline: 'Satisfaction dipped to 72% this wave; wait times are the leading concern.',
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
