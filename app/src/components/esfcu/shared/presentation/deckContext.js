import { createContext, useContext } from 'react';

/**
 * Deck-scoped interaction helpers, namespaced per deck.
 *
 * Slides need to open the deck's chat sheet and its step-detail modal, but they
 * must not import deck internals — that was already true when ESFCU had one
 * deck, and `askAbout.js` solved it by dispatching window events. Window events
 * are global, though, and there are two ESFCU decks now: the CEO's board
 * briefing and the CRO's risk briefing. Both would hear each other.
 *
 * Only one deck is ever mounted at a time (a deck belongs to the active
 * persona, and there is only one), so today they could not actually collide.
 * That is a property of the current routing rather than of these components,
 * and it is not the kind of thing that survives a change nobody connects to it
 * — so the namespace is explicit.
 *
 * Slides call `useDeck()`; the deck supplies the namespace once. No component
 * lives here on purpose — a file exporting both a component and a helper breaks
 * Fast Refresh for every slide that imports it.
 */

export const DeckContext = createContext(null);

function makeHelpers(ns) {
  const askAbout = (seedId) =>
    window.dispatchEvent(new CustomEvent(`${ns}:open-chat`, { detail: { seed: seedId } }));

  /** Open the step-detail modal for a recommended next step, by index. */
  const openStep = (step) =>
    window.dispatchEvent(new CustomEvent(`${ns}:open-closing`, { detail: { step } }));

  const openLineage = () => window.dispatchEvent(new CustomEvent(`${ns}:open-lineage`));

  /**
   * Props for a clickable "ask about this" element. Resting visuals stay the
   * approved design; only a hover affordance (.pm-ask) is added. Pass the
   * element's existing className so it is preserved rather than clobbered.
   */
  const askProps = (seedId, className = '') => ({
    className: `${className} pm-ask`.trim(),
    role: 'button',
    tabIndex: 0,
    onClick: () => askAbout(seedId),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); askAbout(seedId); } },
  });

  /** Props for a next-step card that opens its detail modal (final slide). */
  const closeProps = (className = '', step = 0) => ({
    className: `${className} pm-ask`.trim(),
    role: 'button',
    tabIndex: 0,
    onClick: () => openStep(step),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStep(step); } },
  });

  return { ns, askAbout, openStep, openLineage, askProps, closeProps };
}

export function useDeck() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('useDeck must be used inside a deck');
  return ctx;
}

export { makeHelpers };
