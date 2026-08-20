export const OPEN_ASSIGNMENT_EVENT = 'amisa-hr:open-assignment';

/**
 * Open the assignment overlay.
 *
 * WHY THIS IS A PLAIN FUNCTION CALLED FROM `onFlowEnter`, and not a component.
 *
 * The two obvious implementations both fail, and both fail quietly:
 *
 *   `initialExtras` — gated on `isInitialView`, and a child's mount effect runs
 *   BEFORE its parent's, so the dispatch lands before PersonaWorkspace has
 *   registered its listener. On a cold page load the assignment simply never
 *   opened; switching to this persona from another one worked every time,
 *   because the parent was already mounted. That is the worst shape a demo bug
 *   can take — it disappears exactly when you test it.
 *
 *   An inline component on the turn — mounts late enough, but React reuses the
 *   instance when the same key re-renders on a repeated turn, so the effect
 *   does not run again and a chip labelled "Open my assignment" advances the
 *   thread without opening anything.
 *
 * `onFlowEnter` has neither problem: the engine calls it after the message is
 * committed, once per turn landing, entirely outside React's reconciliation.
 * Wired in the persona manifest.
 *
 * Lives in its own module so the component file stays component-only, which is
 * what react-refresh needs to hot-reload it.
 */
export function openAssignment() {
  window.dispatchEvent(new CustomEvent(OPEN_ASSIGNMENT_EVENT));
}
