import { useSyncExternalStore } from 'react';

/**
 * Saved reports for the Maryland DoIT tenant, keyed by persona.
 *
 * Why this exists: both the Author and the Administrator were offered a "save
 * to my reports" chip whose only effect was a sentence claiming it had happened.
 * There was no reports surface anywhere in the app — no route, no screen, no
 * state — so the claim was the whole feature. This store is what the claim is
 * now backed by, and `screens/MyReports.jsx` is where it is read.
 *
 * Keyed by persona id rather than merged, because the two personas save
 * different artefacts (a manager findings report vs a leadership brief) and
 * neither should see the other's drafts.
 *
 * Same module-store shape as authorState/adminState, and for the same reason:
 * the cards that write to it are mounted through `manifest.inlineComponents`,
 * which is re-invoked per message, so nothing component-local survives.
 */

let nextId = 0;
const initial = () => ({ byPersona: {} });

let state = initial();
const listeners = new Set();

const emit = () => {
  listeners.forEach((l) => l());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function getReportsState() {
  return state;
}

export function useReportsState() {
  return useSyncExternalStore(subscribe, getReportsState, getReportsState);
}

export function resetReportsState() {
  state = initial();
  nextId = 0;
  emit();
}

/** Every report this persona has saved, newest first. */
export function reportsFor(personaId) {
  return state.byPersona[personaId] ?? [];
}

/** Reports for a persona, as a hook. */
export function useReportsFor(personaId) {
  const { byPersona } = useReportsState();
  return byPersona[personaId] ?? [];
}

/**
 * Save a report, or update the one already saved under the same `key`.
 *
 * The `key` is what makes "Save to my reports" idempotent: the chip can be
 * clicked more than once in a session, and the second click should refresh the
 * draft rather than stack a second copy of the same report in the list.
 *
 * `savedAt` is passed in rather than stamped here — the demo's clock is fixed
 * (see the governance rows elsewhere in this tenant), and a real `Date.now()`
 * would make the list contradict every other timestamp on screen.
 */
export function saveReport(personaId, report) {
  const existing = state.byPersona[personaId] ?? [];
  const idx = report.key ? existing.findIndex((r) => r.key === report.key) : -1;
  const record = {
    id: idx >= 0 ? existing[idx].id : `rpt-${++nextId}`,
    status: 'draft',
    ...report,
  };
  const next = idx >= 0
    ? existing.map((r, i) => (i === idx ? { ...r, ...record } : r))
    : [record, ...existing];
  state = { ...state, byPersona: { ...state.byPersona, [personaId]: next } };
  emit();
  return record.id;
}

/** Edit a saved report in place. */
export function updateReport(personaId, id, patch) {
  const existing = state.byPersona[personaId] ?? [];
  state = {
    ...state,
    byPersona: {
      ...state.byPersona,
      [personaId]: existing.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    },
  };
  emit();
}

export function deleteReport(personaId, id) {
  const existing = state.byPersona[personaId] ?? [];
  state = {
    ...state,
    byPersona: { ...state.byPersona, [personaId]: existing.filter((r) => r.id !== id) },
  };
  emit();
}
