import { useSyncExternalStore } from 'react';

/**
 * The resident's survey progress, held outside the component tree.
 *
 * PersonaWorkspace renders the overlay as `{OverlayComponent && overlayOpen ? …
 * : null}`, so closing it UNMOUNTS SurveyRuntime and everything in useState goes
 * with it. Both the reopen card and the reopen turn's copy promise that answers
 * stay put; this is what makes that true rather than a nice sentence.
 *
 * It also matters for the switch between the conversational runtime and the web
 * form: answering three questions and then deciding you would rather have a form
 * should not cost you the three answers.
 */

const initial = () => ({
  started: false,
  webForm: false,
  audioOn: false,
  voiceOn: false,
  stepId: 'q1',
  answers: {},
  entries: [],
});

let state = initial();
const listeners = new Set();

const emit = () => {
  listeners.forEach((l) => l());
};

export function setResidentState(patch) {
  state = { ...state, ...patch };
  emit();
}

/** Start over — used when a completed survey is reopened. */
export function resetResidentState() {
  state = initial();
  emit();
}

export function getResidentState() {
  return state;
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useResidentState() {
  return useSyncExternalStore(subscribe, getResidentState, getResidentState);
}
