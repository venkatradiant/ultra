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
 * A dialog that has to advance the thread when you confirm clicks the turn's
 * own suggested chip — VOCE's approval modals do it, and so does AMISA's
 * assignment overlay when a school coordinator finishes submitting. This is the same mechanism the guided
 * demo runner uses (`src/demo/DemoRunner.js` waits for a chip and clicks it),
 * so it is an established in-app pattern rather than a new one — and it needs
 * no shared-code edit.
 *
 * The contract that keeps it safe: every label passed here MUST also appear in
 * that turn's `suggested_chips`. `src/data/doit/doitData.test.ts` and
 * `src/data/amisa/amisaFlows.test.ts` assert it for their own tenants, so a
 * renamed chip fails the suite rather than dead-ending a dialog at runtime.
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
 *
 * The wait is rAF with a timeout BEHIND it, not rAF alone. A hidden document
 * suspends animation frames, so a user who confirms a dialog and switches tab
 * before the next paint comes back to a thread that never advanced — the state
 * written, the conversation dead-ended behind it. The timeout is the floor that
 * cannot be suspended; whichever wins, `fired` makes sure the chip is only
 * clicked once.
 */
export function closeThenFireChip(onClose, label) {
  onClose?.();
  let fired = false;
  const advance = () => {
    if (fired) return;
    fired = true;
    fireChip(label);
  };
  // Next frame, so the portal has unmounted and focus has settled.
  requestAnimationFrame(advance);
  setTimeout(advance, 60);
}
