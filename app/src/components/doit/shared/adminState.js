import { useSyncExternalStore } from 'react';
import { PORTFOLIO_SURVEYS } from '../../../data/doit/_shared/constants';

/**
 * Cross-turn state for the Administrator, mirroring authorState.
 *
 * Same reason it exists: cards render through `manifest.inlineComponents`, which
 * is re-invoked per message, so a choice made on one turn (which surveys are in
 * scope, which approvals are cleared) has to live outside the component tree for
 * a later turn's card to see it.
 *
 * `dismissedModals` is the remount-proof once-guard for the confirm dialogs — a
 * component-local `useState(true)` springs back open when React remounts the
 * element, which it does whenever the thread re-renders.
 */

const initial = () => ({
  dismissedModals: [],
  /** Surveys in scope for the cross-survey query. All six, pre-selected. */
  selectedSurveys: PORTFOLIO_SURVEYS.map((s) => s.id),
  /** Approvals cleared so far, by id. */
  approved: [],
  /** Approvals sent back to their author, by id. */
  sentBack: [],
  /** What happened to the flagged responses: null | 'kept' | 'excluded'. */
  flagDisposition: null,
  briefTopic: 'Wait-time experience across resident surveys, Q2',
  briefFinding:
    'Wait times are the leading dissatisfaction driver across 4 of 6 resident surveys, concentrated in the Western region (58%).',
});

let state = initial();
const listeners = new Set();

const emit = () => {
  listeners.forEach((l) => l());
};

export function setAdminState(patch) {
  state = { ...state, ...patch };
  emit();
}

export function resetAdminState() {
  state = initial();
  emit();
}

export function getAdminState() {
  return state;
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useAdminState() {
  return useSyncExternalStore(subscribe, getAdminState, getAdminState);
}

export function dismissAdminModal(id) {
  if (state.dismissedModals.includes(id)) return;
  setAdminState({ dismissedModals: [...state.dismissedModals, id] });
}

/** Open-once dialog state — survives the remount a plain useState would not. */
export function useAdminOpenOnce(id) {
  const { dismissedModals } = useAdminState();
  return { open: !dismissedModals.includes(id), close: () => dismissAdminModal(id) };
}
