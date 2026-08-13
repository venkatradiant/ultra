/**
 * Persona: Survey Author (Sarah Chen) — Maryland DoIT.
 *
 * Designs and publishes standards-compliant surveys with AI assistance, reviews
 * results after a data-quality sweep, and drafts a report for leadership.
 *
 * Flows note: this persona imports its `chatFlows.json` DIRECTLY rather than
 * routing through `src/data/personaFlowConfigs.js`. That barrel is pinned to its
 * own chunk (vite.config.js) which every tenant downloads — ~795 kB built — so
 * adding DoIT dialogue there would bill nine other clients for it. The three
 * maps stay here in TypeScript, where a duplicate chip key is TS1117 at
 * typecheck rather than a silent mis-route at runtime.
 */

import { ClipboardList, MessageSquareText, CheckCircle2, FileEdit } from 'lucide-react';
import type { ChatFlowConfig, DataSource, PersonaManifest, Signal } from '@core/types';
import chatFlows from '@/data/doit/author/chatFlows.json';
import signalsJson from '@/data/doit/author/signals.json';
import dataSourcesJson from '@/data/doit/_shared/dataSources.json';

const flows: ChatFlowConfig = {
  chatFlows: chatFlows as unknown as ChatFlowConfig['chatFlows'],
  // One flat namespace per persona — `resolveFlowKey` never sees the current
  // step, so a label reused with a DIFFERENT destination is unrepresentable.
  chipToFlowKey: {
    'Review Maryland results': 'author_cleaning',
    'Finish the draft survey': 'author_draft_status',
    'Ask me anything': '__default__',
  },
  askTurnSequence: ['author_cleaning', 'author_draft_status'],
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
    // The ChatInput typeahead corpus — unioned with the current turn's chips.
    initialChips: [
      'Review Maryland results',
      'Finish the draft survey',
      'Ask me anything',
    ],
    // Every value here must appear verbatim in that turn's suggested_chips;
    // goldenPathChip only restyles a chip that is already offered, it never
    // injects one. manifests.test.ts asserts it.
    goldenPathChip: {
      author_greeting: 'Review Maryland results',
      author_cleaning: 'Finish the draft survey',
      author_draft_status: 'Review Maryland results',
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
};

export default manifest;
