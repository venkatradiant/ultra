/**
 * Persona: Contact Center Agent-Assist (David Torres) — NFCU. Live-call copilot;
 * inline layout, signature cards compose into the thread.
 */

import { Clock, CheckCircle, Award, Headphones, TrendingDown, Gauge } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/nfcu/agent/signals.json';
import dataSources from '@/data/nfcu/agent/dataSources.json';
import capabilityCallouts from '@/data/nfcu/agent/capabilityCallouts.json';

import AgentRootCauseCard from '@/components/nfcu/agent/AgentRootCauseCard';
import AgentComplianceGate from '@/components/nfcu/agent/AgentComplianceGate';
import AgentActionLog from '@/components/nfcu/agent/AgentActionLog';

const flows = (getPersonaFlowConfigs('nfcu') as unknown as Record<string, PersonaManifest['flows']>).nfcu_agent;

const manifest: PersonaManifest = {
  id: 'nfcu_agent',
  clientId: 'nfcu',
  marketId: 'financial-services',

  identity: { name: 'David Torres', initials: 'DT', role: 'Contact Center Agent (Agent-Assist)', greeting: 'David' },
  capabilities: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Friction Observability',
    'Anomaly Detection',
    'Predictive Intelligence',
    'Automated Action',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',
  features: { focusedNav: true },

  ui: {
    greetingFlowKey: 'nfcu_agent_greeting',
    initialChips: [
      "Why was this member's payment declined?",
      'Correlate the decline across her accounts',
      'How do I explain this in plain language?',
      "What's the compliant resolution?",
      'Prompt the identity verification step',
    ],
    goldenPathChip: {
      nfcu_agent_greeting: 'Give me the full breakdown',
      nfcu_agent_step2_breakdown: 'How do I explain this simply?',
      nfcu_agent_step3_explain: 'Verify her identity first',
      nfcu_agent_step4_verify: 'Identity confirmed',
      nfcu_agent_step5_identity: 'Do the routing fix and retry',
      nfcu_agent_step6_execute: 'Wrap up the call',
      nfcu_agent_step7_wrapup: 'Save and close',
    },
    flowKeyToCapabilityTrigger: {
      nfcu_agent_greeting: 'home_load',
      nfcu_agent_step2_breakdown: 'ask_turn_1',
      nfcu_agent_step3_explain: 'ask_turn_2',
      nfcu_agent_step4_verify: 'ask_turn_3',
      nfcu_agent_step5_identity: 'ask_turn_4',
      nfcu_agent_step6_execute: 'ask_turn_5',
      nfcu_agent_step7_wrapup: 'ask_turn_6',
    },
    stats: [
      { id: 'aht', label: 'Avg Handle Time (Today)', value: '7:48', trend: 'Dynamics 365', positive: true, icon: Clock, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: null },
      { id: 'fcr', label: 'First Contact Resolution', value: '74%', trend: 'Dynamics 365 + CRM', positive: true, icon: CheckCircle, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: null },
      { id: 'quality', label: 'Quality Score (30d)', value: '91/100', trend: 'Quality Management', positive: true, icon: Award, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: null },
      { id: 'calls', label: 'Calls Handled (Today)', value: '23', trend: 'Dynamics 365', positive: true, icon: Headphones, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: null },
      { id: 'sentiment', label: 'Live Sentiment (Current Call)', value: 'Negative', trend: 'Rising — 90s window', positive: false, icon: TrendingDown, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'How do I explain this in plain language?' },
      { id: 'adherence', label: 'Schedule Adherence', value: '93%', trend: 'Dynamics 365 WFM', positive: true, icon: Gauge, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: null },
    ],
    signalToChip: {
      'SIG-NFCU-AGT-001': 'Give me the full breakdown',
      'SIG-NFCU-AGT-002': 'How do I explain this in plain language?',
      'SIG-NFCU-AGT-003': 'Prompt the identity verification step',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    if (k === 'nfcu_agent_step2_breakdown') out.push(<AgentRootCauseCard key="agt-root-cause" />);
    if (k === 'nfcu_agent_step4_verify') out.push(<AgentComplianceGate key="agt-compliance-gate" />);
    if (k === 'nfcu_agent_step6_execute' || k === 'nfcu_agent_action_log') out.push(<AgentActionLog key={`agt-action-log-${k}`} />);
    return out.length ? out : undefined;
  },
};

export default manifest;
