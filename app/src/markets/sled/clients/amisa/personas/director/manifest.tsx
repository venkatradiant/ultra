/**
 * Persona: Executive Director (Dr. Dereck Rhoads) — AMISA.
 *
 * The association side of the demo. He reads a brief rather than a dashboard,
 * chases the schools that have not submitted, approves a survey a member school
 * asked to send, reviews the AI's data-quality sweep and decides it, asks the
 * benchmarking question in his own words, and publishes a summary to the
 * schools that took part — all before October 1.
 *
 * THREE CONVENTIONS, inherited from the DoIT tenant next door because they were
 * learned the hard way there:
 *
 * FLOWS live in a colocated chatFlows.json imported DIRECTLY, not through
 * src/data/personaFlowConfigs.js. That barrel is pinned to its own chunk which
 * every tenant downloads, so AMISA dialogue there would bill ten other clients
 * for it.
 *
 * CARDS are wired through `inlineComponents`, not through the flow JSON's
 * `ui_components_to_render`. That field is stored on the message and read by
 * nothing — `inlineComponents` is the slot that actually reaches ChatMessage.
 *
 * NO NEW ROUTES. `navSlots` is Ask · My Reports · Data Sources, and every
 * artefact renders inline in the conversation. The RFP asks AMISA to avoid the
 * complexity and long-term maintenance of a persistent dashboard, so a standing
 * dashboard would argue against the pitch on the screen while the presenter
 * argues for it out loud.
 */

import { Building2, ClipboardCheck, FileCheck2, AlertTriangle } from 'lucide-react';
import type { ChatFlowConfig, DataSource, PersonaManifest, Signal } from '@core/types';
import chatFlows from '@/data/amisa/director/chatFlows.json';
import signalsJson from '@/data/amisa/director/signals.json';
import dataSourcesJson from '@/data/amisa/_shared/dataSources.json';
import { HR_PUBLISHED_VALID, HR_SURVEY, MEMBER_SCHOOLS } from '@/data/amisa/_shared/constants';
import { businessOfficeMissing, participatingSchools } from '@/data/amisa/_shared/schools';
import {
  getDirectorState,
  markDone,
  applySweep,
  keepEverything,
} from '@/components/amisa/shared/directorState';
import { DirectorSignalsBar, DirectorStatsBar } from '@/components/amisa/shared/AmisaBriefingBars';
import { saveReport } from '@/components/doit/shared/reportsState';

import BoundaryCard from '@/components/amisa/director/BoundaryCard';
import ParticipationCard from '@/components/amisa/director/ParticipationCard';
import MissingSchoolsCard from '@/components/amisa/director/MissingSchoolsCard';
import ApprovalRequestCard from '@/components/amisa/director/ApprovalRequestCard';
import DataQualitySweepCard from '@/components/amisa/director/DataQualitySweepCard';
import SweepResultCard from '@/components/amisa/director/SweepResultCard';
import BenchmarkAnswerCard from '@/components/amisa/director/BenchmarkAnswerCard';
import PeerComparisonCard from '@/components/amisa/director/PeerComparisonCard';
import SchoolSummaryCard from '@/components/amisa/director/SchoolSummaryCard';
import SavedReportReceiptCard from '@/components/doit/shared/SavedReportReceiptCard';

const flows: ChatFlowConfig = {
  chatFlows: chatFlows as unknown as ChatFlowConfig['chatFlows'],

  /**
   * ONE FLAT NAMESPACE. `resolveFlowKey` never sees the current step, so a label
   * reused with a DIFFERENT destination mis-routes silently. A label reused with
   * the SAME destination is fine — several below do exactly that.
   *
   * Note what is deliberately absent: a bare "Approve", "Publish" or "Apply".
   * The substring rung matches with no word boundary and no length floor, so a
   * short chip label would swallow any free text containing it.
   */
  chipToFlowKey: {
    // Entry points
    'What can the association actually see?': 'director_boundary',
    'Show me who is missing': 'director_participation',
    'How many schools have finished the Human Resources section?': 'director_completion',
    'Review data quality': 'director_quality',
    'Approvals (1 pending)': 'director_approvals',
    'Back to my briefing': 'director_greeting',

    // Approvals — the confirm label differs from the label that opens it.
    'Approve and schedule': 'director_approved',
    'Send it back with a comment': 'director_sent_back',

    // The sweep
    'Why was the salary field flagged?': 'director_narrative_detail',
    'Apply cleaning': 'director_quality_applied',
    'Keep everything': 'director_quality_kept',

    // The benchmark. The full question is the chip, because it is the question
    // Dr. Rhoads actually asked and hearing his own words read back matters
    // more than a tidy label.
    "What is the average teacher salary for a master's degree with 3 years of experience?":
      'director_benchmark',
    'Compare to peers': 'director_peers',
    'Show a school with too few peers': 'director_suppressed',

    // Publishing
    'Draft the school summary': 'director_summary',
    'Publish to participating schools': 'director_publish_confirm',
    'Yes, publish it': 'director_published',
    'Go back': 'director_summary',
    'Save to my reports': 'director_saved',
  },

  askTurnSequence: [
    'director_participation',
    'director_approvals',
    'director_quality',
    'director_quality_applied',
    'director_benchmark',
    'director_peers',
    'director_summary',
    'director_published',
  ],

  signalSequence: ['director_participation', 'director_quality', 'director_approvals'],

  /**
   * Free text that matches nothing should say so. Without this the engine's
   * substring and keyword rungs find a home for almost any input — usually the
   * node he is already on, which reads as the assistant repeating itself rather
   * than admitting it did not understand.
   */
  strictMatch: true,

  /**
   * The briefing describes the day he is actually having.
   *
   * He can take the three items in any order, so every flow that names "what is
   * left" has variants and this picks between them from the progress store.
   * Without it, finishing everything and clicking "Back to my briefing" replays
   * the 6 a.m. message asking him to do it all again.
   */
  resolveFlowKey: (flowKey) => {
    const { done } = getDirectorState();
    const allDone = done.quality && done.approval && done.published;
    if (flowKey === 'director_greeting') {
      if (allDone) return 'director_greeting_clear';
      if (done.quality) return 'director_greeting_quality_done';
      return 'director_greeting';
    }
    if (flowKey === '__default__') {
      return done.quality ? '__default_quality_done__' : '__default__';
    }
    return flowKey;
  },

  /**
   * Record progress when the turn lands, not when a dialog is confirmed.
   *
   * `applySweep` is called here rather than from the card's button for the same
   * reason: "Apply cleaning" is offered both as a chip on the sweep turn and as
   * a confirm inside the card, and a click on the chip would otherwise freeze
   * nothing while the receipt claims it did.
   *
   * Ordering trap this avoids: `resolveFlowKey` runs BEFORE the message is
   * built and `onFlowEnter` after, so marking `quality` done on the applied turn
   * cannot rewrite the very turn announcing it.
   */
  onFlowEnter: (flowKey) => {
    // Two different freezes. `applySweep` keeps his selection; `keepEverything`
    // clears it first, because the turn it belongs to says out loud that
    // nothing was excluded and the receipt below has to agree.
    if (flowKey === 'director_quality_applied') {
      applySweep();
      markDone('quality');
    }
    if (flowKey === 'director_quality_kept') {
      keepEverything();
      markDone('quality');
    }
    if (flowKey === 'director_approved' || flowKey === 'director_sent_back') markDone('approval');
    if (flowKey === 'director_published') markDone('published');
    if (flowKey === 'director_saved') {
      const { summaryTitle, summaryHeadline } = getDirectorState();
      saveReport('amisa_director', {
        key: 'amisa-hr-summary',
        subject: summaryTitle,
        headline: summaryHeadline,
        headlineLabel: 'Headline',
        methodology: `${HR_PUBLISHED_VALID} valid records of ${HR_SURVEY.totalResponses}. ${HR_SURVEY.name}.`,
        author: 'Dereck Rhoads',
        savedAt: 'September 30, 7:41 AM',
        sendLabel: 'Publish to participating schools',
      });
    }
  },
};

const manifest: PersonaManifest = {
  id: 'amisa_director',
  clientId: 'amisa',
  marketId: 'sled',

  identity: {
    name: 'Dr. Dereck Rhoads',
    initials: 'DR',
    role: 'Executive Director',
    greeting: 'Dereck',
  },
  capabilities: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Friction Observability',
    'Predictive Intelligence',
    'Anomaly Detection',
    'Automated Action',
  ],

  flows,
  signals: signalsJson as unknown as Signal[],
  dataSources: dataSourcesJson as unknown as DataSource[],

  layout: 'inline',

  features: {
    // No dashboard route. See the header note — this is a product decision the
    // RFP asked for, not an unfinished nav.
    navSlots: ['ask', 'myReports', 'dataSources'],
    wideInlineComponents: true,
    topAlignedInitial: true,
  },

  /**
   * The bell. Everything here is about what happened to the survey window while
   * he was not looking at it — which is the only thing that moves overnight in
   * a once-a-year collection cycle.
   */
  notifications: [
    {
      id: 'amisa-dir-n1',
      title: 'Human Resources survey closed',
      detail: `${HR_SURVEY.totalResponses} responses from ${HR_SURVEY.schoolsSubmitted} schools. Swept and ready for review.`,
      at: '6:00 AM',
      tone: 'info',
    },
    {
      id: 'amisa-dir-n2',
      title: `${businessOfficeMissing().length} schools never opened the Business Office section`,
      detail: 'The window closes tonight. They will not receive that benchmark on October 1.',
      at: '6:00 AM',
      tone: 'warning',
    },
    {
      id: 'amisa-dir-n3',
      title: 'Cordillera International School requested a survey',
      detail: 'Four questions on kindergarten demand and tuition planning. Waiting on your approval.',
      at: 'Yesterday, 3:20 PM',
      tone: 'info',
    },
  ],

  ui: {
    greetingFlowKey: 'director_greeting',
    // The ChatInput typeahead corpus. These are NOT rendered as buttons — the
    // chip row is gated on !isTyping, which is false from t=0, so the input's
    // suggestion list is their only surface.
    initialChips: [
      'Show me who is missing',
      'Review data quality',
      'Approvals (1 pending)',
      "What is the average teacher salary for a master's degree with 3 years of experience?",
      'How many schools have finished the Human Resources section?',
      'What can the association actually see?',
      'Draft the school summary',
    ],
    // Only ever RESTYLES a chip the turn already offers — it never injects one.
    goldenPathChip: {
      director_greeting: 'Show me who is missing',
      director_greeting_quality_done: 'Approvals (1 pending)',
      director_greeting_clear: "What is the average teacher salary for a master's degree with 3 years of experience?",
      director_boundary: "What is the average teacher salary for a master's degree with 3 years of experience?",
      director_participation: 'Approvals (1 pending)',
      director_completion: 'Show me who is missing',
      director_approvals: 'Approve and schedule',
      director_approved: 'Review data quality',
      director_sent_back: 'Review data quality',
      director_quality: 'Apply cleaning',
      director_narrative_detail: 'Apply cleaning',
      director_quality_applied: "What is the average teacher salary for a master's degree with 3 years of experience?",
      director_quality_kept: "What is the average teacher salary for a master's degree with 3 years of experience?",
      director_benchmark: 'Compare to peers',
      director_peers: 'Show a school with too few peers',
      director_suppressed: 'Draft the school summary',
      director_summary: 'Publish to participating schools',
      director_publish_confirm: 'Yes, publish it',
      director_published: 'Save to my reports',
      director_saved: 'Back to my briefing',
    },
    flowKeyToCapabilityTrigger: {},
    stats: [
      {
        id: 'schools-submitted',
        label: 'Schools Submitted',
        value: `${HR_SURVEY.schoolsSubmitted}`,
        trend: `of ${participatingSchools().length} participating · ${MEMBER_SCHOOLS} members`,
        positive: true,
        icon: Building2,
        iconColor: 'text-brand',
        iconBg: 'bg-brand/10',
        chipText: 'How many schools have finished the Human Resources section?',
      },
      {
        id: 'valid-records',
        label: 'Records to Review',
        value: `${HR_SURVEY.totalResponses}`,
        trend: 'swept overnight, awaiting your call',
        positive: false,
        icon: ClipboardCheck,
        iconColor: 'text-amber-700',
        iconBg: 'bg-amber-500/10',
        chipText: 'Review data quality',
      },
      {
        id: 'missing-office',
        label: 'Business Office Missing',
        value: `${businessOfficeMissing().length}`,
        trend: 'window closes tonight',
        positive: false,
        icon: AlertTriangle,
        iconColor: 'text-warning',
        iconBg: 'bg-warning/10',
        chipText: 'Show me who is missing',
      },
      {
        id: 'approvals',
        label: 'Approvals Pending',
        value: '1',
        trend: 'requested by a member school',
        positive: false,
        icon: FileCheck2,
        iconColor: 'text-teal-700',
        iconBg: 'bg-teal-500/10',
        chipText: 'Approvals (1 pending)',
      },
    ],
    signalToChip: {
      'SIG-AMISA-DIR-001': 'Show me who is missing',
      'SIG-AMISA-DIR-002': 'Review data quality',
      'SIG-AMISA-DIR-003': 'Approvals (1 pending)',
    },
    capabilityCallouts: [],
    contentMaxWidth: 'max-w-4xl',
    inputPlaceholder: 'Ask about participation, data quality, or a benchmark…',
    // The whole demo is pinned to the morning of September 30, and the scripted
    // brief opens "Good morning". Without this the header reads the presenter's
    // wall clock and can contradict the message directly beneath it.
    greetingLabel: 'Good morning',
  },

  // Both rows read the progress store, so they cannot show three open items
  // above a greeting that says the day is clear.
  signalsComponent: DirectorSignalsBar,
  statsComponent: DirectorStatsBar,

  /** The card switchboard, keyed on the message's flowKey. */
  inlineComponents: (msg) => {
    const key = (msg as { flowKey?: string }).flowKey;
    switch (key) {
      case 'director_greeting':
      case 'director_greeting_quality_done':
      case 'director_completion':
        return [<ParticipationCard key="participation" />];
      case 'director_boundary':
        return [<BoundaryCard key="boundary" />];
      case 'director_participation':
        return [<MissingSchoolsCard key="missing" />];
      case 'director_approvals':
        return [<ApprovalRequestCard key="approval" />];
      case 'director_approved':
        return [<ApprovalRequestCard key="approval-done" variant="approved" />];
      case 'director_quality':
      case 'director_narrative_detail':
        return [<DataQualitySweepCard key="sweep" />];
      case 'director_quality_applied':
      case 'director_quality_kept':
        return [<SweepResultCard key="sweep-result" />];
      case 'director_benchmark':
        return [<BenchmarkAnswerCard key="benchmark" />];
      case 'director_peers':
        return [<PeerComparisonCard key="peers" />];
      case 'director_suppressed':
        return [<PeerComparisonCard key="peers-suppressed" variant="suppressed" />];
      case 'director_summary':
      case 'director_publish_confirm':
        return [<SchoolSummaryCard key="summary" />];
      case 'director_published':
        return [<SchoolSummaryCard key="summary-published" variant="published" />];
      case 'director_saved':
        return [<SavedReportReceiptCard key="saved" personaId="amisa_director" />];
      default:
        return undefined;
    }
  },
};

export default manifest;
