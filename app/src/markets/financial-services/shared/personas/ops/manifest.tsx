/**
 * Persona: Operations & Analytics (Maya J.) — the generic financial-services
 * "ops" persona, shared across clients that don't override it.
 *
 * This module is the single source of truth for the persona: identity, flows,
 * signals, data sources, UI config, and the context-panel / inline-component
 * switchboard that used to live as `contextPanelRegistries.ops` /
 * `inlineComponentRegistries.ops` inside the 1,276-line AskTheAI god-screen.
 *
 * NOTE (Phase 5): `flows` is still sourced from the legacy `personaFlowConfigs`
 * accessor while that file is being dissolved; the ops slice moves fully into
 * this folder in Phase 5.
 */

import { Users, AlertTriangle, Cpu, Database } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/signals.json';
import dataSources from '@/data/dataSources.json';
import capabilityCallouts from '@/data/capabilityCallouts.json';

// Context-panel components (generic, shared across personas).
import MortgageFunnelBar from '@/components/charts/MortgageFunnelBar';
import SegmentBreakdownTable from '@/components/tables/SegmentBreakdownTable';
import ChurnRiskTable from '@/components/tables/ChurnRiskTable';
import AnomalyResultsTable from '@/components/tables/AnomalyResultsTable';

// Inline components.
import Step4DailyChart from '@/components/charts/Step4DailyChart';
import AutoLoanTrendLine from '@/components/charts/AutoLoanTrendLine';
import SignalCard from '@/components/cards/SignalCard';

/**
 * Factory: the generic ops persona is shared across clients. `clientId` selects
 * the client-specific flow overrides (PenFed ships its own ops chatFlows); all
 * other clients get the base flows. Signals/UI/components are client-agnostic.
 */
export default function createOpsManifest(clientId: string): PersonaManifest {
  const flows = getPersonaFlowConfigs(clientId).ops;

  return {
  id: 'ops',
  clientId,
  marketId: 'financial-services',

  identity: { name: 'Maya J.', initials: 'MJ', role: 'Operations & Analytics', greeting: 'Maya' },
  capabilities: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Friction Observability',
    'Predictive Intelligence',
    'Anomaly Detection',
    'Automated Action',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'split',

  ui: {
    greetingFlowKey: 'greeting',
    initialChips: [
      'Yes, walk me through them',
      "What's driving the mortgage drop-off?",
      'Which members are most at risk of leaving?',
      'Tell me about the CD complaint cluster',
      'Scan for anomalies across systems',
    ],
    goldenPathChip: {
      greeting: "What's driving the mortgage drop-off?",
      turn_1_mortgage_dropoff: "Yes, show me who's affected",
      turn_2_segmentation: 'Not yet — show me more',
      turn_3_predictive: 'Scan for anomalies across systems',
      turn_5_anomaly_detection: 'Help me act on this',
    },
    flowKeyToCapabilityTrigger: {
      greeting: 'home_load',
      signal_1_mortgage: 'home_load',
      turn_1_mortgage_dropoff: 'ask_turn_1',
      turn_2_segmentation: 'ask_turn_2',
      turn_3_predictive: 'ask_turn_3',
      turn_5_anomaly_detection: 'ask_turn_4',
      turn_4_actions: 'ask_turn_5',
    },
    stats: [
      { id: 'members', label: 'Active Members', value: '2,304', trend: '+12%', positive: true, icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Show me active member breakdown' },
      { id: 'alerts', label: 'Alerts', value: '3', trend: '2 critical', positive: false, icon: AlertTriangle, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Summarize active alerts' },
      { id: 'processes', label: 'Processes', value: '456K', trend: '99.2%', positive: true, icon: Cpu, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'Show process health' },
      { id: 'sources', label: 'Data Sources', value: '8', trend: '7 active', positive: true, icon: Database, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: null },
    ],
    signalToChip: {
      'SIG-001': "What's driving the mortgage drop-off?",
      'SIG-002': 'Tell me about the auto loan trend',
      'SIG-003': 'Tell me about the CD complaint cluster',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  // ─── the relocated switchboard ──────────────────────────────
  contextPanel: {
    1: MortgageFunnelBar,
    2: SegmentBreakdownTable,
    3: ChurnRiskTable,
    4: AnomalyResultsTable,
    5: 'actions',
  },

  inlineComponents: (msg, sigs) => {
    const out = [];
    if (msg.flowKey === 'signal_1_mortgage') out.push(<Step4DailyChart key="step4chart" />);
    if (msg.flowKey === 'signal_2_auto_loan') out.push(<AutoLoanTrendLine key="autoloan" />);
    if (msg.flowKey === 'signal_3_cd_complaint') {
      const signal = sigs.find((s) => s.id === 'SIG-003');
      if (signal) out.push(<SignalCard key="cdcard" signal={signal} />);
    }
    return out.length ? out : undefined;
  },
  };
}
