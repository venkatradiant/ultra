/**
 * Persona: Resident (anonymous) — Maryland DoIT.
 *
 * An anonymous member of the public answering a survey. Structurally unlike the
 * other two DoIT personas and unlike anything else in Ultra: the experience is a
 * questionnaire mounted through `overlayComponent`, and the chat shell exists
 * only to open it and to offer a way back in.
 *
 * WHY AN OVERLAY. A questionnaire collects answers, branches on them, summarises
 * them for review and submits. Ultra has no form primitive, no
 * review-before-submit and no progress indicator, so those are new build either
 * way. Expressing it as chat flows would additionally force every answer option
 * to become a globally-unique chip label — `chipToFlowKey` is one flat namespace
 * per persona, so "Yes" and "No" on q5 could not be reused — and multi-select
 * does not fit a one-click-one-transition chip model at all.
 *
 * The overlay costs ZERO shared edits. The one shared change this persona does
 * need is a `personaNavLabels` entry in TopHeader, which does not read
 * `manifest.navLabels`.
 */

import type { ChatFlowConfig, DataSource, PersonaManifest, Signal } from '@core/types';
import chatFlows from '@/data/doit/resident/chatFlows.json';
import SurveyRuntime from '@/components/doit/resident/SurveyRuntime';
import SurveyAutoLaunch, { OPEN_SURVEY_EVENT } from '@/components/doit/resident/SurveyAutoLaunch';
import ReopenSurveyCard from '@/components/doit/resident/ReopenSurveyCard';

const flows: ChatFlowConfig = {
  chatFlows: chatFlows as unknown as ChatFlowConfig['chatFlows'],
  chipToFlowKey: { 'Reopen the survey': 'resident_reopen' },
  askTurnSequence: ['resident_reopen'],
  signalSequence: [],
};

const manifest: PersonaManifest = {
  id: 'doit_resident',
  clientId: 'doit',
  marketId: 'sled',

  identity: {
    name: 'Maryland Resident',
    initials: 'MR',
    role: 'Resident — anonymous',
    greeting: 'there',
  },
  capabilities: ['Converged Conversation', 'Friction Observability', 'Proactive Intelligence'],

  flows,
  // Both legal as empty arrays, and both correct: a resident is not shown the
  // department's signals or its systems.
  signals: [] as Signal[],
  dataSources: [] as DataSource[],

  /**
   * `'full'` is currently inert — the only read of `manifest.layout` anywhere in
   * src/ is a `=== 'inline'` check. Declared anyway because it is the honest
   * description, it is legal, and it correctly skips the inline
   * Recommended-Actions injection this persona does not want.
   */
  layout: 'full',

  features: {
    navSlots: ['ask'],
    topAlignedInitial: true,
    // Both this AND overlayComponent must be set. Declare one without the other
    // and no listener registers at all, silently.
    overlayOpenEvent: OPEN_SURVEY_EVENT,
  },

  // Read by Sidebar. TopHeader has its own hardcoded map and needs the matching
  // entry there — see src/components/layout/TopHeader.jsx.
  navLabels: { ask: 'Survey' },

  initialExtras: SurveyAutoLaunch as unknown as PersonaManifest['initialExtras'],
  overlayComponent: SurveyRuntime as unknown as PersonaManifest['overlayComponent'],

  ui: {
    greetingFlowKey: 'resident_greeting',
    initialChips: ['Reopen the survey'],
    goldenPathChip: {
      resident_greeting: 'Reopen the survey',
      resident_reopen: 'Reopen the survey',
    },
    flowKeyToCapabilityTrigger: {},
    // No stat tiles. A resident has no portfolio.
    stats: [],
    signalToChip: {},
    capabilityCallouts: [],
    inputPlaceholder: 'The survey is open in front of you.',
  },

  inlineComponents: (msg) => {
    const key = (msg as { flowKey?: string }).flowKey;
    if (key === 'resident_greeting' || key === 'resident_reopen') {
      return [<ReopenSurveyCard key="reopen" />];
    }
    return undefined;
  },
};

export default manifest;
