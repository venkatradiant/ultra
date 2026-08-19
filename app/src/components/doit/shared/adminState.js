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
  /** Approvals returned to their author: `{ id, comment }`. */
  sentBack: [],
  /** What happened to the flagged responses: null | 'kept' | 'excluded'. */
  flagDisposition: null,
  /**
   * Which of the morning's three items are finished.
   *
   * Written from the manifest's `onFlowEnter` rather than from the confirm
   * dialogs. Every modal's confirm label is ALSO a chip on the same turn, so
   * recording it in the dialog let a user who clicked the chip advance the
   * conversation without the store ever hearing about it — and the briefing
   * then re-asked for work that was already done.
   */
  done: { approvals: false, flag: false, brief: false },
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

/** Clear an approval. Idempotent — a chip and a dialog both route here. */
export function approve(id) {
  if (state.approved.includes(id)) return;
  setAdminState({ approved: [...state.approved, id] });
}

/** Return an approval to its author with the reviewer's note attached. */
export function sendBack(id, comment) {
  if (state.sentBack.some((s) => s.id === id)) return;
  setAdminState({ sentBack: [...state.sentBack, { id, comment: (comment || '').trim() }] });
}

/** Record that one of the morning's three items is finished. */
export function markAdminDone(track) {
  if (state.done[track]) return;
  setAdminState({ done: { ...state.done, [track]: true } });
}

/** How many approvals are still waiting, out of `total`. */
export function approvalsOutstanding(total) {
  const settled = new Set([...state.approved, ...state.sentBack.map((s) => s.id)]);
  return Math.max(0, total - settled.size);
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
