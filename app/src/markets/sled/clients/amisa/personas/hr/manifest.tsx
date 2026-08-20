/**
 * Persona: Human Resources Director (Ana Lucía Restrepo) — a member school.
 *
 * The school side of the boundary, and the reason the boundary is showable at
 * all. She is not an AMISA employee: she works at Cordillera International
 * School, and this persona exists to demonstrate what the association can and
 * cannot see of what she enters.
 *
 * FOUR THINGS THIS PERSONA PROVES, in order:
 *   1. She is assigned one office and can reach nothing else — not another
 *      office at her own school, and not any other school.
 *   2. The definition travels with the question, so comparability is won at the
 *      point of entry rather than in the analysis.
 *   3. Narrative text in a numeric field is refused before it can be submitted,
 *      which is the case Dr. Rhoads raised by name.
 *   4. The school decides what leaves the school. Salary bands contribute;
 *      individual staff records are not a setting that can be switched on.
 *
 * STRUCTURALLY like the DoIT Resident and unlike every other persona: the
 * experience is a questionnaire mounted through `overlayComponent`, and the
 * chat shell exists to introduce it, explain a definition, and offer a way back
 * in. See `AssignmentRuntime` for why a form cannot be expressed as chat flows.
 *
 * `signals` and `dataSources` are deliberately empty arrays. A school
 * coordinator is not shown the association's priority signals or its system
 * inventory — she is shown her assignment. Both are legal empty.
 */

import type { ChatFlowConfig, DataSource, PersonaManifest, Signal } from '@core/types';
import chatFlows from '@/data/amisa/hr/chatFlows.json';
import AssignmentRuntime from '@/components/amisa/hr/AssignmentRuntime';
import { OPEN_ASSIGNMENT_EVENT, openAssignment } from '@/components/amisa/hr/assignmentOverlay';
import ReopenAssignmentCard from '@/components/amisa/hr/ReopenAssignmentCard';
import { AssignmentCard, MySchoolCard, NewRequestCard } from '@/components/amisa/hr/HrCards';
import { markRequestSent } from '@/components/amisa/hr/hrState';

const flows: ChatFlowConfig = {
  chatFlows: chatFlows as unknown as ChatFlowConfig['chatFlows'],
  chipToFlowKey: {
    'Open my assignment': 'hr_reopen',
    'Back to my assignment': 'hr_reopen',
    'What counts as base salary?': 'hr_definition',
    "See my school's data": 'hr_submitted',
    'Ask the other schools a question': 'hr_request',
    'Send to AMISA for approval': 'hr_request_sent',
  },
  askTurnSequence: ['hr_reopen', 'hr_definition', 'hr_submitted', 'hr_request', 'hr_request_sent'],
  signalSequence: [],
  strictMatch: true,

  /**
   * Two jobs, both of which have to happen once per turn LANDING rather than
   * once per component mount.
   *
   * Opening the assignment: the engine calls this after the message is
   * committed, so the workspace's overlay listener is long since registered and
   * a repeated turn fires it again. Mounting a launcher component instead
   * failed both ways — see `assignmentOverlay.ts` for the full account.
   *
   * Recording the request: the card has its own Send button AND the turn offers
   * the same label as a chip, so either route must reach the same state or the
   * receipt claims something the store never heard about.
   */
  onFlowEnter: (flowKey) => {
    if (flowKey === 'hr_greeting' || flowKey === 'hr_reopen') openAssignment();
    if (flowKey === 'hr_request_sent') markRequestSent();
  },
};

const manifest: PersonaManifest = {
  id: 'amisa_hr',
  clientId: 'amisa',
  marketId: 'sled',

  identity: {
    name: 'Ana Lucía Restrepo',
    initials: 'AR',
    role: 'HR Director — member school',
    greeting: 'Ana Lucía',
  },
  capabilities: ['Converged Conversation', 'Friction Observability', 'Proactive Intelligence'],

  flows,
  signals: [] as Signal[],
  dataSources: [] as DataSource[],

  /**
   * `'full'` is currently inert — the only read of `manifest.layout` in src/ is
   * an `=== 'inline'` check. Declared anyway because it is the honest
   * description and it correctly skips the inline Recommended-Actions injection
   * this persona does not want.
   */
  layout: 'full',

  features: {
    // One slot. A school coordinator has no reports surface and no business
    // reading the association's data-source inventory.
    navSlots: ['ask'],
    topAlignedInitial: true,
    // Both this AND overlayComponent must be set. Declare one without the other
    // and no listener registers at all, silently.
    overlayOpenEvent: OPEN_ASSIGNMENT_EVENT,
  },

  // Read by Sidebar. TopHeader keeps its own hardcoded map — see the matching
  // entry added there for this persona.
  navLabels: { ask: 'My Assignment' },

  // Opened from `flows.onFlowEnter`, not from a mounted launcher — see the
  // note there and in `components/amisa/hr/assignmentOverlay.js`.
  overlayComponent: AssignmentRuntime as unknown as PersonaManifest['overlayComponent'],

  ui: {
    greetingFlowKey: 'hr_greeting',
    initialChips: [
      'Open my assignment',
      'What counts as base salary?',
      "See my school's data",
      'Ask the other schools a question',
    ],
    /**
     * `hr_reopen` advances to her own figures rather than to the definition.
     *
     * It used to highlight "What counts as base salary?", whose own golden chip
     * points back at "Open my assignment" — so a presenter following the
     * highlighted chip walked reopen → definition → reopen forever and never
     * reached the submission. The definition stays reachable as an ordinary
     * chip; it is a side branch, not the path.
     */
    goldenPathChip: {
      hr_greeting: 'Open my assignment',
      hr_reopen: "See my school's data",
      hr_definition: 'Open my assignment',
      hr_submitted: 'Ask the other schools a question',
      hr_request: 'Send to AMISA for approval',
      hr_request_sent: "See my school's data",
    },
    flowKeyToCapabilityTrigger: {},
    // No stat tiles. A school coordinator has no portfolio.
    stats: [],
    signalToChip: {},
    capabilityCallouts: [],
    contentMaxWidth: 'max-w-3xl',
    inputPlaceholder: 'Ask about a question, a definition, or your own figures…',
    // The whole demo is pinned to the morning of September 30, and the scripted
    // brief opens "Good morning". Without this the header reads the presenter's
    // wall clock and can contradict the message directly beneath it.
    greetingLabel: 'Good morning',
  },

  inlineComponents: (msg) => {
    const key = (msg as { flowKey?: string }).flowKey;
    switch (key) {
      case 'hr_greeting':
        return [<AssignmentCard key="assignment" />, <ReopenAssignmentCard key="reopen" />];
      case 'hr_reopen':
      case 'hr_definition':
        return [<ReopenAssignmentCard key="reopen" />];
      case 'hr_submitted':
        return [<MySchoolCard key="my-school" />];
      case 'hr_request':
        return [<NewRequestCard key="request" />];
      case 'hr_request_sent':
        return [<NewRequestCard key="request-sent" variant="sent" />];
      default:
        return undefined;
    }
  },
};

export default manifest;
