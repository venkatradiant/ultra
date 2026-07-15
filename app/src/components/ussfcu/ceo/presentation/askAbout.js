// Open the Presentation Mode chat seeded with a question about a clicked
// element. Decoupled from deck state via a window event, mirroring the existing
// `ussfcu-ceo-deck:open-lineage` pattern so slides never import deck internals.
export function askAbout(seedId) {
  window.dispatchEvent(new CustomEvent('ussfcu-ceo-deck:open-chat', { detail: { seed: seedId } }));
}

// Open the step-detail modal for a recommended Leadership Next Step, on the
// given step index (0-2).
export function openStep(step) {
  window.dispatchEvent(new CustomEvent('ussfcu-ceo-deck:open-closing', { detail: { step } }));
}

// Props for a next-step card that opens its detail modal (final slide).
export function closeProps(className = '', step = 0) {
  return {
    className: `${className} pm-ask`.trim(),
    role: 'button',
    tabIndex: 0,
    onClick: () => openStep(step),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStep(step); } },
  };
}

// Convenience props for a clickable "ask about this" element — resting visuals
// stay the approved design; only a hover affordance (.pm-ask) is added. Pass the
// element's existing className so it is preserved (not clobbered).
export function askProps(seedId, className = '') {
  return {
    className: `${className} pm-ask`.trim(),
    role: 'button',
    tabIndex: 0,
    onClick: () => askAbout(seedId),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); askAbout(seedId); } },
  };
}
