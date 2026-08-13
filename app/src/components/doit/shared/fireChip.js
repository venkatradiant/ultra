/**
 * Advance the conversation from inside an inline component.
 *
 * Why this is needed: the chat engine's `handleChipClick` lives inside
 * PersonaWorkspace and is handed only to the chip row, the stat tiles and the
 * input. Components mounted through `manifest.inlineComponents` never receive
 * it, and there is no manifest slot that would pass it down — the only bridge
 * that exists (IntradayContext's ask handler) is gated on `briefing`, which
 * this tenant does not declare.
 *
 * VOCE's approval modals have to advance the thread when you confirm, so they
 * click the turn's own suggested chip. This is the same mechanism the guided
 * demo runner uses (`src/demo/DemoRunner.js` waits for a chip and clicks it),
 * so it is an established in-app pattern rather than a new one — and it needs
 * no shared-code edit.
 *
 * The contract that keeps it safe: every label passed here MUST also appear in
 * that turn's `suggested_chips`. `src/data/doit/doitData.test.ts` asserts it,
 * so a renamed chip fails the suite rather than dead-ending a modal at runtime.
 */

/**
 * Click the visible suggested chip whose label matches exactly.
 * @returns {boolean} whether a chip was found and clicked.
 */
export function fireChip(label) {
  if (typeof document === 'undefined' || !label) return false;
  const target = String(label).trim();
  const buttons = document.querySelectorAll('button');
  for (const button of buttons) {
    if (button.textContent?.trim() === target) {
      button.click();
      return true;
    }
  }
  return false;
}

/**
 * Close a modal, then advance. Ordering matters: the chip row is behind the
 * backdrop, and clicking it while the dialog still owns focus fights the
 * focus-restore in DoitModal's cleanup.
 */
export function closeThenFireChip(onClose, label) {
  onClose?.();
  // Next frame, so the portal has unmounted and focus has settled.
  requestAnimationFrame(() => fireChip(label));
}
