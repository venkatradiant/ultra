/**
 * Persona: Quality & Member Experience Analyst (Janelle Moreau) — NFCU.
 * Split layout with per-turn context panel (compliance chart, quality table).
 */

import { Award, ShieldAlert, CheckCircle, TrendingDown, AlertTriangle } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/nfcu/workforce/signals.json';
import dataSources from '@/data/nfcu/workforce/dataSources.json';
import capabilityCallouts from '@/data/nfcu/workforce/capabilityCallouts.json';

import NFCUComplianceChart from '@/components/nfcu/NFCUComplianceChart';
import NFCUQualityScoreTable from '@/components/nfcu/NFCUQualityScoreTable';
import SignalCard from '@/components/cards/SignalCard';

const flows = (getPersonaFlowConfigs('nfcu') as unknown as Record<string, PersonaManifest['flows']>).nfcu_workforce;

const manifest: PersonaManifest = {
  id: 'nfcu_workforce',
  clientId: 'nfcu',
  marketId: 'financial-services',

  identity: { name: 'Janelle Moreau', initials: 'JM', role: 'Quality & Member Experience Analyst', greeting: 'Janelle' },
  capabilities: ['Proactive Intelligence', 'Converged Conversation', 'Anomaly Detection', 'Automated Action'],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'split',

  ui: {
    greetingFlowKey: 'nfcu_wf_greeting',
    initialChips: [
      'Walk me through the compliance issue',
      'Show me the repeat contact data',
      'Which agents are at risk?',
      'Show me quality scores by team this week',
      'Generate a quality scorecard',
    ],
    goldenPathChip: {
      nfcu_wf_greeting: 'Walk me through the compliance issue',
      nfcu_wf_turn_1_compliance_detail: 'Recommend a fix',
      nfcu_wf_turn_2_remediation: 'Next signal',
      nfcu_wf_signal_2_repeat_contact: 'Show me the repeat contact data',
      nfcu_wf_turn_3_repeat_contacts: 'What should we tell agents?',
    },
    flowKeyToCapabilityTrigger: {
      nfcu_wf_greeting: 'home_load',
      nfcu_wf_signal_1_compliance: 'home_load',
      nfcu_wf_signal_2_repeat_contact: 'home_load',
      nfcu_wf_signal_3_burnout: 'home_load',
      nfcu_wf_turn_1_compliance_detail: 'ask_turn_1',
      nfcu_wf_quality_scores: 'ask_turn_1',
      nfcu_wf_turn_2_remediation: 'ask_turn_2',
      nfcu_wf_turn_3_repeat_contacts: 'ask_turn_2',
      nfcu_wf_agent_coaching: 'ask_turn_3',
      nfcu_wf_quality_scorecard: 'ask_turn_3',
      nfcu_wf_cost_impact: 'ask_turn_3',
    },
    stats: [
      { id: 'quality', label: 'Quality Score (30-day)', value: '82/100', trend: 'Target: 85', positive: false, icon: Award, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Show me quality scores by team this week' },
      { id: 'adherence', label: 'Process Adherence', value: '77%', trend: 'BSA/AML gap active', positive: false, icon: ShieldAlert, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Walk me through the compliance issue' },
      { id: 'fcr', label: 'First Contact Resolution', value: '68%', trend: 'Bill pay: 54%', positive: false, icon: CheckCircle, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me the repeat contact data' },
      { id: 'sentiment', label: 'Negative Sentiment', value: '18%', trend: 'Target: <15%', positive: false, icon: TrendingDown, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'Show me sentiment trends by queue' },
      { id: 'repeat', label: 'Repeat Contact (48hr)', value: '22%', trend: 'Target: <12%', positive: false, icon: AlertTriangle, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me the repeat contact data' },
    ],
    signalToChip: {
      'SIG-NFCU-WF-001': 'Walk me through the compliance issue',
      'SIG-NFCU-WF-002': 'Show me the repeat contact data',
      'SIG-NFCU-WF-003': 'Which agents are at risk?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  contextPanel: {
    1: NFCUComplianceChart,
    2: NFCUQualityScoreTable,
    3: 'actions',
  },

  inlineComponents: (msg, sigs) => {
    const out = [];
    const k = msg.flowKey;
    const pushSignal = (id: string, key: string) => {
      const s = sigs.find((x) => x.id === id);
      if (s) out.push(<SignalCard key={key} signal={s} />);
    };
    if (k === 'nfcu_wf_signal_1_compliance') { pushSignal('SIG-NFCU-WF-001', 'wfsig1'); out.push(<NFCUComplianceChart key="compliancechartsig" />); }
    if (k === 'nfcu_wf_signal_2_repeat_contact') pushSignal('SIG-NFCU-WF-002', 'wfsig2');
    if (k === 'nfcu_wf_signal_3_burnout') pushSignal('SIG-NFCU-WF-003', 'wfsig3');
    if (k === 'nfcu_wf_turn_1_compliance_detail') out.push(<NFCUComplianceChart key="compliancechart" />);
    if (k === 'nfcu_wf_quality_scores') out.push(<NFCUQualityScoreTable key="qualityscoretable" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
