/**
 * Persona: Survey Administrator (Marcus Johnson) — Maryland DoIT.
 *
 * Queries a portfolio of surveys across VOCE, Qualtrics, Microsoft Forms and
 * Google Forms and gets cited, governed answers; clears an approval queue.
 *
 * The cross-survey query is this persona's headline: one question answered over
 * six surveys and four platforms, with the response count assembled from the
 * actual selection rather than asserted.
 *
 * Same two conventions as the Author — flows imported directly rather than
 * through the shared personaFlowConfigs barrel, and cards wired through
 * `inlineComponents` because `ui_components_to_render` is read by nothing.
 */

import { ClipboardCheck, Layers, MessageSquareText, Star } from 'lucide-react';
import type { ChatFlowConfig, DataSource, PersonaManifest, Signal } from '@core/types';
import chatFlows from '@/data/doit/admin/chatFlows.json';
import signalsJson from '@/data/doit/admin/signals.json';
import dataSourcesJson from '@/data/doit/_shared/dataSources.json';

import SurveyPickerCard from '@/components/doit/admin/SurveyPickerCard';
import CrossSurveyInsightCard from '@/components/doit/admin/CrossSurveyInsightCard';
import RegionalBreakdownCard from '@/components/doit/admin/RegionalBreakdownCard';
import SurveyBreakdownCard from '@/components/doit/admin/SurveyBreakdownCard';
import LeadershipBriefCard from '@/components/doit/admin/LeadershipBriefCard';
import DataQualityFlagCard from '@/components/doit/admin/DataQualityFlagCard';
import ApprovalQueueCard, { ApprovalCard } from '@/components/doit/admin/ApprovalQueueCard';
import ResidentQuoteCard from '@/components/doit/author/ResidentQuoteCard';
import {
  ApproveBothModal,
  ApprovePermitModal,
  ApproveServiceCenterModal,
  SendBriefModal,
} from '@/components/doit/admin/AdminModals';
import { APPROVAL_QUEUE, CROSS_SURVEY_TOTAL } from '@/data/doit/_shared/constants';

const flows: ChatFlowConfig = {
  chatFlows: chatFlows as unknown as ChatFlowConfig['chatFlows'],
  /**
   * The renames that make the approval queue representable at all. The prototype
   * used a bare "Approve" on both surveys and a bare "Send back to author" on
   * both — each of those is one label with two destinations, which this map
   * cannot express and the resolver would mis-route without warning. A bare
   * "Send" was worse still: four characters that the substring rung matches
   * against any user_query containing them.
   */
  chipToFlowKey: {
    // Entry points
    'Ask across surveys': 'admin_picker',
    'Ask another question': 'admin_picker',
    'Review approvals (2)': 'admin_queue',
    'Show me the data-quality flag': 'admin_flag',
    'Back to my briefing': 'admin_greeting',
    "That's all for now": 'admin_done',

    // Cross-survey query
    'What are the top complaints about wait times?': 'admin_results',
    'How has satisfaction changed over time?': 'admin_trend',
    "I'll type my own question": 'admin_custom',
    'Break down by region': 'admin_regional',
    'Break down by region instead': 'admin_regional',
    'Break down by survey': 'admin_by_survey',
    'Show verbatims from the Western region': 'admin_verbatims',

    // Data-quality flag
    'Keep and flag in results': 'admin_flag_kept',
    'Exclude these responses': 'admin_flag_excluded',

    // Leadership brief
    'Draft brief for leadership': 'admin_brief',
    'Send the brief': 'admin_send_confirm',
    'Yes, send it to leadership': 'admin_brief_sent',
    'Go back to the brief': 'admin_brief',
    'Save to reports': 'admin_saved',

    // Approval queue — every confirm label distinct, per survey.
    'Review each': 'admin_survey_1',
    'Approve both': 'admin_approve_both_confirm',
    'Yes, approve both surveys': 'admin_both_approved',
    'Approve Permit Renewal Feedback': 'admin_approve_1_confirm',
    'Yes, approve Permit Renewal': 'admin_survey_2',
    'Send Permit Renewal back to Sarah': 'admin_sent_back_1',
    'Continue to Survey 2': 'admin_survey_2',
    'Approve Service Center Exit Survey': 'admin_approve_2_confirm',
    'Yes, approve Service Center': 'admin_both_approved',
    'Send Service Center back to James': 'admin_sent_back_2',
    'Back to the queue': 'admin_queue',
  },
  askTurnSequence: [
    'admin_picker',
    'admin_results',
    'admin_regional',
    'admin_brief',
    'admin_brief_sent',
    'admin_queue',
    'admin_both_approved',
  ],
  signalSequence: ['admin_queue', 'admin_results', 'admin_regional', 'admin_flag'],
};

const manifest: PersonaManifest = {
  id: 'doit_admin',
  clientId: 'doit',
  marketId: 'sled',

  identity: { name: 'Marcus Johnson', initials: 'MJ', role: 'Survey Administrator', greeting: 'Marcus' },
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
    greetingFlowKey: 'admin_greeting',
    initialChips: [
      'Ask across surveys',
      'Review approvals (2)',
      'Show me the data-quality flag',
      'What are the top complaints about wait times?',
      'Break down by region',
      'Draft brief for leadership',
    ],
    goldenPathChip: {
      admin_greeting: 'Ask across surveys',
      admin_picker: 'What are the top complaints about wait times?',
      admin_results: 'Break down by region',
      admin_by_survey: 'Break down by region instead',
      admin_regional: 'Draft brief for leadership',
      admin_verbatims: 'Draft brief for leadership',
      admin_trend: 'Draft brief for leadership',
      admin_brief: 'Send the brief',
      admin_send_confirm: 'Yes, send it to leadership',
      admin_brief_sent: 'Ask another question',
      admin_queue: 'Review each',
      admin_survey_1: 'Approve Permit Renewal Feedback',
      admin_approve_1_confirm: 'Yes, approve Permit Renewal',
      admin_survey_2: 'Approve Service Center Exit Survey',
      admin_approve_2_confirm: 'Yes, approve Service Center',
      admin_approve_both_confirm: 'Yes, approve both surveys',
      admin_flag: 'Keep and flag in results',
    },
    flowKeyToCapabilityTrigger: {},
    stats: [
      { id: 'active', label: 'Active Surveys', value: '18', trend: 'across 4 platforms', positive: true, icon: Layers, iconColor: 'text-blue-700', iconBg: 'bg-blue-500/10', chipText: 'Ask across surveys' },
      // Deliberately NOT "this week" — this total spans 2024 to 2025.
      { id: 'responses', label: 'Responses (selected)', value: CROSS_SURVEY_TOTAL.toLocaleString(), trend: 'across the 6 selected surveys', positive: true, icon: MessageSquareText, iconColor: 'text-teal-700', iconBg: 'bg-teal-500/10', chipText: 'What are the top complaints about wait times?' },
      { id: 'satisfaction', label: 'Avg Satisfaction', value: '3.6/5', trend: 'down from 4.0', positive: false, icon: Star, iconColor: 'text-amber-700', iconBg: 'bg-amber-500/10', chipText: null },
      { id: 'approvals', label: 'Awaiting Approval', value: String(APPROVAL_QUEUE.length), trend: 'earliest ships tomorrow', positive: false, icon: ClipboardCheck, iconColor: 'text-rose-700', iconBg: 'bg-rose-500/10', chipText: 'Review approvals (2)' },
    ],
    signalToChip: {
      'SIG-DOIT-ADM-001': 'Review approvals (2)',
      'SIG-DOIT-ADM-002': 'What are the top complaints about wait times?',
      'SIG-DOIT-ADM-003': 'Break down by region',
      'SIG-DOIT-ADM-004': 'Show me the data-quality flag',
    },
    capabilityCallouts: [],
    contentMaxWidth: 'max-w-4xl',
    inputPlaceholder: 'Ask across your surveys, or about an approval…',
  },

  inlineComponents: (msg) => {
    const key = (msg as { flowKey?: string }).flowKey;
    switch (key) {
      case 'admin_picker':
        return [<SurveyPickerCard key="picker" />];
      case 'admin_results':
        return [<CrossSurveyInsightCard key="cross-survey" />];
      case 'admin_by_survey':
        return [<SurveyBreakdownCard key="by-survey" />];
      case 'admin_regional':
        return [<RegionalBreakdownCard key="regional" />];
      case 'admin_verbatims':
        return [<ResidentQuoteCard key="verbatims" variant="waitTimes" />];
      case 'admin_flag':
        return [<DataQualityFlagCard key="flag" />];
      case 'admin_brief':
        return [<LeadershipBriefCard key="brief" />];
      case 'admin_send_confirm':
        return [<SendBriefModal key="send-brief" />];
      case 'admin_queue':
        return [<ApprovalQueueCard key="queue" />];
      case 'admin_survey_1':
        return [<ApprovalCard key="approval-1" item={APPROVAL_QUEUE[0]} />];
      case 'admin_approve_1_confirm':
        return [<ApprovePermitModal key="approve-1" />];
      case 'admin_survey_2':
        return [<ApprovalCard key="approval-2" item={APPROVAL_QUEUE[1]} />];
      case 'admin_approve_2_confirm':
        return [<ApproveServiceCenterModal key="approve-2" />];
      case 'admin_approve_both_confirm':
        return [<ApproveBothModal key="approve-both" />];
      case 'admin_both_approved':
        return [<ApprovalQueueCard key="queue-cleared" />];
      default:
        return undefined;
    }
  },
};

export default manifest;
