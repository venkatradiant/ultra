/**
 * The delivery channels one survey definition can reach residents through.
 *
 * Lives here rather than beside DeliverySelector because three components read
 * it — the selector, the publish confirm modal and the publish receipt — and a
 * component file that also exports constants breaks fast refresh.
 */

export const NATIVE_FORMATS = [
  {
    id: 'conversational',
    name: 'Conversational survey',
    desc: 'Residents answer one question at a time in a text conversation, with read-aloud and voice input. Recommended for accessibility and reach.',
    recommended: true,
  },
  {
    id: 'webform',
    name: 'Web form',
    desc: 'A standard accessible web form with all questions on one page, for residents who would rather scan than converse.',
    recommended: false,
  },
  {
    id: 'pdf',
    name: 'PDF',
    desc: 'A tagged, screen-reader-navigable PDF for offline or print distribution.',
    recommended: false,
  },
];

/**
 * The disabled Google Forms row is not an oversight — it is the honest half of
 * the story. "Some channels are wired and some are not yet" is more credible
 * than three green ticks, and it is what a real integration surface looks like.
 */
export const PLATFORM_TARGETS = [
  {
    id: 'qualtrics',
    name: 'Qualtrics',
    desc: 'VOCE reformats the survey into Qualtrics structure and publishes it to your connected account. Responses sync back for cross-platform analysis.',
    connected: true,
  },
  {
    id: 'msforms',
    name: 'Microsoft Forms',
    desc: 'VOCE creates the survey in Microsoft Forms through your Microsoft 365 connection. Responses sync back automatically.',
    connected: true,
  },
  {
    id: 'gforms',
    name: 'Google Forms',
    desc: 'Not connected. Publishing here needs an agency data-sharing agreement first.',
    connected: false,
  },
];

export const NATIVE_IDS = new Set(NATIVE_FORMATS.map((f) => f.id));

export const FORMAT_BY_ID = Object.fromEntries(
  [...NATIVE_FORMATS, ...PLATFORM_TARGETS].map((f) => [f.id, f]),
);
