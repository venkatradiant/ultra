/**
 * Persona: Survey Author (Sarah Chen) — Maryland DoIT.
 *
 * Designs and publishes standards-compliant surveys with AI assistance, reviews
 * results after a data-quality sweep, and drafts a report for leadership.
 *
 * Two things about this manifest are worth knowing before editing it.
 *
 * FLOWS live in a colocated chatFlows.json imported DIRECTLY, not through
 * src/data/personaFlowConfigs.js. That barrel is pinned to its own chunk which
 * every tenant downloads (~795 kB built), so DoIT dialogue there would bill nine
 * other clients for it. The three maps stay here in TypeScript, where a
 * duplicate chip key is TS1117 at typecheck rather than a silent mis-route.
 *
 * CARDS are wired through `inlineComponents`, not through the flow JSON's
 * `ui_components_to_render`. That field is stored on the message and read by
 * nothing — PersonaWorkspace destructures neither `uiComponents` nor
 * `contextPanelData`, so roughly ninety component specs across the existing
 * chatFlows files render no UI at all. `inlineComponents` is the slot that
 * actually reaches ChatMessage.
 */

import { ClipboardList, MessageSquareText, CheckCircle2, FileEdit } from 'lucide-react';
import type { ChatFlowConfig, DataSource, PersonaManifest, Signal } from '@core/types';
import chatFlows from '@/data/doit/author/chatFlows.json';
import signalsJson from '@/data/doit/author/signals.json';
import dataSourcesJson from '@/data/doit/_shared/dataSources.json';

import DataCleaningCard from '@/components/doit/author/DataCleaningCard';
import CleaningResultCard from '@/components/doit/author/CleaningResultCard';
import InsightSummaryCard from '@/components/doit/author/InsightSummaryCard';
import WaitTimesInsightCard from '@/components/doit/author/WaitTimesInsightCard';
import ResidentQuoteCard from '@/components/doit/author/ResidentQuoteCard';
import ReportEditorCard from '@/components/doit/author/ReportEditorCard';
import DraftSurveyPanel from '@/components/doit/author/DraftSurveyPanel';
import SuggestedOptionsCard from '@/components/doit/author/SuggestedOptionsCard';
import DeliverySelector from '@/components/doit/author/DeliverySelector';
import PublishConfirmationCard from '@/components/doit/author/PublishConfirmationCard';
import SurveyStatusCard from '@/components/doit/author/SurveyStatusCard';
import {
  PublishConfirmModal,
  SendConfirmModal,
  SurveyPreviewModal,
} from '@/components/doit/author/AuthorModals';

const flows: ChatFlowConfig = {
  chatFlows: chatFlows as unknown as ChatFlowConfig['chatFlows'],
  /**
   * ONE FLAT NAMESPACE. `resolveFlowKey` never sees the current step, so a label
   * reused with a DIFFERENT destination is unrepresentable and mis-routes
   * silently. A label reused with the SAME destination is fine — that is one
   * entry serving several turns, and several below do exactly that.
   *
   * Note what is deliberately NOT here: a bare "Publish", "Send" or "Approve".
   * The substring rung matches with no word boundary and no length floor, so a
   * four-character chip would swallow any free text containing it.
   */
  chipToFlowKey: {
    // Entry points
    'Review Maryland results': 'author_cleaning',
    'Finish the draft survey': 'author_draft_status',
    'Ask me anything': '__default__',
    'Back to my briefing': 'author_greeting',

    // Cleaning
    'Apply cleaning': 'author_results',
    'Got it, apply cleaning': 'author_results',
    'Tell me more about the speeders': 'author_speeders',
    'Keep everything': 'author_results_all',

    // Findings
    'Show me what residents wrote': 'author_quotes',
    'Show more comments': 'author_more_quotes',
    'Drill into wait times': 'author_drill',
    'Export results': 'author_export',

    // Report — the chip that OPENS the gate and the one that CONFIRMS it must
    // differ, because both dispatch through this same map.
    'Draft manager report': 'author_report',
    'Draft the report': 'author_report',
    'Draft manager report instead': 'author_report',
    'Send to manager': 'author_send_confirm',
    'Yes, send it to my manager': 'author_report_sent',
    'Go back': 'author_report',
    'Save to my reports': 'author_saved',
    'Yes, finish the draft': 'author_draft_status',
    'Not yet': 'author_later',

    // Draft survey
    'Q7 looks good': 'author_q7_set',
    'Suggest Q7 options': 'author_suggest',
    'Use these options': 'author_q7_set',
    "I'll write them myself": 'author_manual',
    'Done, set distribution': 'author_distribution',

    // Distribution
    'Use last list': 'author_distribution',
    'Choose a different list': 'author_choose_list',
    'Permit Renewers 2025': 'author_distribution',
    'All Residents': 'author_distribution',
    'Service Center Visitors Q1': 'author_distribution',

    // Delivery and publish
    'Set up delivery': 'author_delivery',
    'Preview as a resident': 'author_preview',
    'Looks good — publish': 'author_publish_confirm',
    'Keep editing': 'author_delivery',
    'Publish this survey': 'author_publish_confirm',
    'I approve — publish now': 'author_published',

    // Post-publish
    'View survey status': 'author_survey_status',
    'Start a new survey': 'author_new_survey',
    'Go to my surveys': 'author_my_surveys',
  },
  askTurnSequence: [
    'author_cleaning',
    'author_results',
    'author_drill',
    'author_report',
    'author_report_sent',
    'author_draft_status',
    'author_delivery',
    'author_published',
  ],
  signalSequence: ['author_cleaning', 'author_draft_status'],
};

const manifest: PersonaManifest = {
  id: 'doit_author',
  clientId: 'doit',
  marketId: 'sled',

  identity: { name: 'Sarah Chen', initials: 'SC', role: 'Survey Author', greeting: 'Sarah' },
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
    navSlots: ['ask', 'dataSources'],
    wideInlineComponents: true,
    topAlignedInitial: true,
  },

  ui: {
    greetingFlowKey: 'author_greeting',
    // The ChatInput typeahead corpus. Note these are NOT rendered as buttons —
    // the chip row is gated on !isTyping, which is false from t=0, so their only
    // surface is the input's suggestion list.
    initialChips: [
      'Review Maryland results',
      'Finish the draft survey',
      'Show me what residents wrote',
      'Draft manager report',
      'Export results',
      'Set up delivery',
    ],
    // Only ever RESTYLES a chip the turn already offers — it never injects one.
    // manifests.test.ts asserts every value appears verbatim in that turn's
    // suggested_chips, and the drift allowlist is closed.
    goldenPathChip: {
      author_greeting: 'Review Maryland results',
      author_cleaning: 'Apply cleaning',
      author_results: 'Draft manager report',
      author_results_all: 'Draft manager report',
      author_drill: 'Draft manager report',
      author_quotes: 'Draft the report',
      author_report: 'Send to manager',
      author_send_confirm: 'Yes, send it to my manager',
      author_report_sent: 'Yes, finish the draft',
      author_draft_status: 'Q7 looks good',
      author_suggest: 'Use these options',
      author_q7_set: 'Use last list',
      author_distribution: 'Set up delivery',
      author_delivery: 'Publish this survey',
      author_publish_confirm: 'I approve — publish now',
      author_published: 'View survey status',
    },
    flowKeyToCapabilityTrigger: {},
    stats: [
      { id: 'open-surveys', label: 'Open Surveys', value: '18', trend: 'across 6 agencies', positive: true, icon: ClipboardList, iconColor: 'text-blue-700', iconBg: 'bg-blue-500/10', chipText: null },
      { id: 'responses-week', label: 'Responses This Week', value: '212', trend: 'Maryland Resident Experience', positive: true, icon: MessageSquareText, iconColor: 'text-teal-700', iconBg: 'bg-teal-500/10', chipText: 'Review Maryland results' },
      { id: 'completion', label: 'Avg Completion', value: '88%', trend: '+3 pts vs last wave', positive: true, icon: CheckCircle2, iconColor: 'text-emerald-700', iconBg: 'bg-emerald-500/10', chipText: null },
      { id: 'drafts', label: 'Drafts Pending', value: '1', trend: 'ships tomorrow', positive: false, icon: FileEdit, iconColor: 'text-amber-700', iconBg: 'bg-amber-500/10', chipText: 'Finish the draft survey' },
    ],
    signalToChip: {
      'SIG-DOIT-AUTH-001': 'Review Maryland results',
      'SIG-DOIT-AUTH-002': 'Finish the draft survey',
    },
    capabilityCallouts: [],
    contentMaxWidth: 'max-w-4xl',
    inputPlaceholder: 'Ask about your surveys, responses, or drafts…',
  },

  /**
   * The card switchboard. Keyed on the message's flowKey — this is the slot that
   * actually reaches ChatMessage, unlike the flow JSON's ui_components_to_render.
   */
  inlineComponents: (msg) => {
    const key = (msg as { flowKey?: string }).flowKey;
    switch (key) {
      case 'author_cleaning':
        return [<DataCleaningCard key="cleaning" />];
      case 'author_results':
        return [<CleaningResultCard key="cleaning-result" />, <InsightSummaryCard key="insights" />];
      case 'author_results_all':
        return [<InsightSummaryCard key="insights" />];
      case 'author_drill':
        return [<WaitTimesInsightCard key="wait-times" />];
      case 'author_quotes':
        return [<ResidentQuoteCard key="quotes-wait" variant="waitTimes" />];
      case 'author_more_quotes':
        return [<ResidentQuoteCard key="quotes-portal" variant="portal" />];
      case 'author_report':
        return [<ReportEditorCard key="report" />];
      case 'author_send_confirm':
        return [<SendConfirmModal key="send-confirm" />];
      case 'author_draft_status':
        return [<DraftSurveyPanel key="draft" />];
      case 'author_suggest':
        return [<SuggestedOptionsCard key="q7-options" />];
      case 'author_delivery':
        return [<DeliverySelector key="delivery" />];
      case 'author_preview':
        return [<SurveyPreviewModal key="preview" />];
      case 'author_publish_confirm':
        return [<PublishConfirmModal key="publish-confirm" />];
      case 'author_published':
        return [<PublishConfirmationCard key="published" />];
      case 'author_survey_status':
        return [<SurveyStatusCard key="status" />];
      default:
        return undefined;
    }
  },
};

export default manifest;
