import { useSyncExternalStore } from 'react';
import { QUESTIONS, SEEDED_ANSWERED, SHARE_CHOICES } from '../../../data/amisa/hr/assignment';

/**
 * Ana Lucía's assignment state.
 *
 * Same module-store shape as `directorState`, and for the same reason: the
 * questionnaire is mounted through `overlayComponent` and the cards through
 * `inlineComponents`, so a component-local answer would not survive the
 * conversation moving on — and the "My school" card has to chart the figures
 * she just entered.
 *
 * SHE CAN STOP HALFWAY. The store seeds the first questions as already answered
 * so the demo opens on a partly-finished assignment rather than a blank one,
 * which is the honest picture: half-finished forms are the single biggest
 * reason a benchmark comes back thin.
 */

const seededAnswers = () => {
  const answers = {};
  QUESTIONS.forEach((q) => {
    if (q.seeded != null) answers[q.id] = q.seeded;
  });
  return answers;
};

const seededShares = () => {
  const shares = {};
  SHARE_CHOICES.forEach((c) => {
    shares[c.key] = c.defaultShared;
  });
  return shares;
};

const initial = () => ({
  answers: seededAnswers(),
  /** Which question the overlay is on. */
  step: 0,
  /** Set once she submits. Everything downstream keys off this. */
  submitted: false,
  /** Whether she took the spreadsheet path for the salary grid. */
  uploaded: false,
  /** What leaves the school, decided by the school. */
  shares: seededShares(),
  /** The request her head of school wants to send to the membership. */
  requestSent: false,
  dismissedModals: [],
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

export function getHrState() {
  return state;
}

export function setHrState(patch) {
  state = { ...state, ...patch };
  emit();
}

export function resetHrState() {
  state = initial();
  emit();
}

export function useHrState() {
  return useSyncExternalStore(subscribe, getHrState, getHrState);
}

export function setAnswer(id, value) {
  setHrState({ answers: { ...state.answers, [id]: value } });
}

export function toggleShare(key) {
  setHrState({ shares: { ...state.shares, [key]: !state.shares[key] } });
}

export function markSubmitted() {
  if (state.submitted) return;
  setHrState({ submitted: true });
}

export function markUploaded() {
  if (state.uploaded) return;
  setHrState({ uploaded: true });
}

export function markRequestSent() {
  if (state.requestSent) return;
  setHrState({ requestSent: true });
}

/**
 * How far through she is.
 *
 * Counted against `QUESTIONS_TOTAL` rather than the rendered question list: the
 * assignment is 14 questions and the prototype renders 6 of them, so a progress
 * bar reading "6 of 6" above a card claiming 14 would be the first thing a
 * committee noticed.
 */
export function answeredCount() {
  const rendered = QUESTIONS.filter((q) => {
    const v = state.answers[q.id];
    return v != null && String(v).trim() !== '';
  }).length;
  const unrendered = Math.max(0, SEEDED_ANSWERED - QUESTIONS.filter((q) => q.seeded != null).length);
  return rendered + unrendered;
}
