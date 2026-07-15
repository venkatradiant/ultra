/**
 * Persona: Risk & Fraud (James R.) — generic financial-services persona.
 * Split layout, shared across clients.
 */

import { ShieldAlert, FileWarning, Gauge, Search } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/risk/signals.json';
import dataSources from '@/data/risk/dataSources.json';
import capabilityCallouts from '@/data/risk/capabilityCallouts.json';

import TransactionAnomalyDetailTable from '@/components/tables/TransactionAnomalyDetailTable';
import RegulatoryGaugePanel from '@/components/charts/RegulatoryGaugePanel';
import SignalCard from '@/components/cards/SignalCard';

/** Factory: generic risk persona, shared across clients. */
export default function createRiskManifest(clientId: string): PersonaManifest {
  const flows = getPersonaFlowConfigs(clientId).risk;

  return {
  id: 'risk',
  clientId,
  domainId: 'financial-services',

  identity: { name: 'James R.', initials: 'JR', role: 'Risk & Fraud', greeting: 'James' },
  capabilities: ['Proactive Intelligence', 'Converged Conversation', 'Anomaly Detection', 'Automated Action'],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'split',

  ui: {
    greetingFlowKey: 'risk_greeting',
    initialChips: [
      'What anomalies were detected overnight?',
      'Show me our regulatory exposure',
      'Flag accounts needing escalation',
      'Generate an audit trail for compliance',
      'Summarize BSA/AML posture',
    ],
    goldenPathChip: {
      risk_greeting: 'What anomalies were detected?',
      risk_turn_1_anomalies: 'Show me the regulatory exposure',
      risk_turn_2_regulatory: 'What needs escalation?',
    },
    flowKeyToCapabilityTrigger: {
      risk_greeting: 'home_load',
      risk_signal_1_structuring: 'home_load',
      risk_signal_2_wire_anomaly: 'home_load',
      risk_signal_3_ncua_decline: 'home_load',
      risk_turn_1_anomalies: 'ask_turn_1',
      risk_structuring_details: 'ask_turn_1',
      risk_wire_timeline: 'ask_turn_1',
      risk_complaint_drivers: 'ask_turn_1',
      risk_bsa_posture: 'ask_turn_1',
      risk_escalation_status: 'ask_turn_1',
      risk_turn_2_regulatory: 'ask_turn_2',
      risk_turn_3_escalation: 'ask_turn_3',
      risk_audit_trail: 'ask_turn_3',
      risk_board_summary: 'ask_turn_3',
    },
    stats: [
      { id: 'anomalies', label: 'Active Anomalies', value: '14', trend: '+5 this week', positive: false, icon: ShieldAlert, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me active anomalies' },
      { id: 'sars', label: 'SARs Filed', value: '3', trend: '2 pending', positive: false, icon: FileWarning, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me SAR filing status' },
      { id: 'ncua', label: 'NCUA Score', value: '78/100', trend: '-6 pts QoQ', positive: false, icon: Gauge, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'Show me the NCUA score' },
      { id: 'investigations', label: 'Open Investigations', value: '5', trend: '2 escalated', positive: false, icon: Search, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: 'Show me open investigations' },
    ],
    signalToChip: {
      'SIG-RISK-001': 'Show me the structuring pattern details',
      'SIG-RISK-002': 'Show me the wire transfer timeline',
      'SIG-RISK-003': 'Show me our regulatory exposure',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  contextPanel: {
    1: TransactionAnomalyDetailTable,
    2: RegulatoryGaugePanel,
    3: 'actions',
  },

  inlineComponents: (msg, sigs) => {
    const out = [];
    const byFlow: Record<string, string> = {
      risk_signal_1_structuring: 'SIG-RISK-001',
      risk_signal_2_wire_anomaly: 'SIG-RISK-002',
      risk_signal_3_ncua_decline: 'SIG-RISK-003',
    };
    const sigId = msg.flowKey ? byFlow[msg.flowKey] : undefined;
    if (sigId) {
      const signal = sigs.find((s) => s.id === sigId);
      if (signal) out.push(<SignalCard key={sigId} signal={signal} />);
    }
    return out.length ? out : undefined;
  },
  };
}
