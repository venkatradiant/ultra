import { useSyncExternalStore } from 'react';
import { DEFAULT_SWEEP } from '../../../data/amisa/_shared/constants';

/**
 * A module-scoped store for Dr. Rhoads' cross-turn choices.
 *
 * Same shape and same reason as the DoIT tenant's `authorState`: cards render
 * through `manifest.inlineComponents`, which is re-invoked per message, so a
 * decision made on the sweep card has to reach the benchmark's methodology line
 * and the published summary — three component instances in three messages.
 * Nothing component-local survives that, and "the numbers agree" is this
 * tenant's entire argument.
 *
 * Deliberately not React context: PersonaWorkspace owns the tree and no AMISA
 * provider can be inserted without a shared-code edit.
 */

const initial = () => ({
  /**
   * Which sweep findings are selected. Starts at DEFAULT_SWEEP — everything
   * except the judgement call — so the card computes 298 on screen.
   */
  sweep: { ...DEFAULT_SWEEP },
  /** True once he has actually applied (or declined) the sweep. */
  sweepApplied: false,
  /** Dialogs already dismissed, by id — survives the remount a re-render causes. */
  dismissedModals: [],
  /**
   * Which of the day's three items are finished. The briefing is regenerated
   * from this, so coming back to it describes the day he is actually having
   * rather than replaying the 6 a.m. version.
   *
   * Written from the manifest's `onFlowEnter`, not from a card's click handler:
   * every dialog's confirm label is also offered as a chip on the same turn, so
   * a click on the chip would otherwise skip the write.
   */
  done: { quality: false, approval: false, published: false },
  /** The summary's editable fields. */
  summaryTitle: 'Human Resources Salary and Benefits — 2026 Association Summary',
  summaryHeadline:
    'Teacher salaries at a master’s degree with three years of experience average $34,800 across 24 contributing schools.',
});

let state = initial();
const listeners = new Set();

const emit = () => {
  listeners.forEach((l) => l());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function getDirectorState() {
  return state;
}

export function setDirectorState(patch) {
  state = { ...state, ...patch };
  emit();
}

export function resetDirectorState() {
  state = initial();
  emit();
}

export function useDirectorState() {
  return useSyncExternalStore(subscribe, getDirectorState, getDirectorState);
}

/** Toggle one sweep finding. No-op once the sweep has been applied. */
export function toggleSweep(key) {
  if (state.sweepApplied) return;
  setDirectorState({ sweep: { ...state.sweep, [key]: !state.sweep[key] } });
}

/** Freeze the sweep selection. What the benchmark and the summary then quote. */
export function applySweep() {
  if (state.sweepApplied) return;
  setDirectorState({ sweepApplied: true });
}

/**
 * Decline every finding, then freeze.
 *
 * `applySweep` alone is not enough on the "Keep everything" path: it freezes
 * whatever is currently selected, and the selection defaults to five of the six
 * findings. So the AI said "Nothing excluded. All 312 records stay in the
 * analysis set" while the receipt directly beneath it computed 298 and listed
 * five fixes as applied — the exact kind of two-numbers-for-one-dataset
 * contradiction this tenant exists to argue against.
 *
 * Clearing the selection first makes the receipt, the benchmark's methodology
 * line and the published summary all agree with what he was just told.
 */
export function keepEverything() {
  if (state.sweepApplied) return;
  const cleared = Object.fromEntries(Object.keys(state.sweep).map((k) => [k, false]));
  setDirectorState({ sweep: cleared, sweepApplied: true });
}

/**
 * Record that one of the day's items is finished. Idempotent — the flows that
 * land here can be reached more than once in a session.
 */
export function markDone(track) {
  if (state.done[track]) return;
  setDirectorState({ done: { ...state.done, [track]: true } });
}

export function dismissModal(id) {
  if (state.dismissedModals.includes(id)) return;
  setDirectorState({ dismissedModals: [...state.dismissedModals, id] });
}

/** Open-once dialog state, so a remount cannot re-open a dismissed dialog. */
export function useOpenOnce(id) {
  const { dismissedModals } = useDirectorState();
  return { open: !dismissedModals.includes(id), close: () => dismissModal(id) };
}
