/**
 * Persona: Member Retention (Derek T.) — generic financial-services persona.
 * Split layout, shared across clients.
 */

import { TrendingDown, HeartPulse, DollarSign, Target } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/retention/signals.json';
import dataSources from '@/data/retention/dataSources.json';
import capabilityCallouts from '@/data/retention/capabilityCallouts.json';

import ChurnTrendLine from '@/components/charts/ChurnTrendLine';
import RetentionRiskTable from '@/components/tables/RetentionRiskTable';
import SignalCard from '@/components/cards/SignalCard';

/** Factory: generic retention persona, shared across clients (PenFed overrides flows). */
export default function createRetentionManifest(clientId: string): PersonaManifest {
  const flows = getPersonaFlowConfigs(clientId).retention;

  return {
  id: 'retention',
  clientId,
  domainId: 'financial-services',

  identity: { name: 'Derek T.', initials: 'DT', role: 'Member Retention', greeting: 'Derek' },
  capabilities: ['Proactive Intelligence', 'Converged Conversation', 'Predictive Intelligence', 'Automated Action'],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'split',

  ui: {
    greetingFlowKey: 'ret_greeting',
    initialChips: [
      'Show me the churn signals',
      'Which members are most at risk of leaving?',
      "What's driving disengagement this month?",
      'Model the retention impact of outreach',
      'Generate a retention brief for leadership',
    ],
    goldenPathChip: {
      ret_greeting: 'Show me the churn signals',
      ret_turn_1_churn_signals: 'Which segments are most at risk?',
      ret_turn_2_risk_segments: 'Model the retention impact',
    },
    flowKeyToCapabilityTrigger: {
      ret_greeting: 'home_load',
      ret_signal_1_churn_surge: 'home_load',
      ret_signal_2_engagement_decay: 'home_load',
      ret_signal_3_retiree_disengage: 'home_load',
      ret_turn_1_churn_signals: 'ask_turn_1',
      ret_churn_drivers: 'ask_turn_1',
      ret_engagement_trend: 'ask_turn_1',
      ret_campaign_performance: 'ask_turn_1',
      ret_retiree_sentiment: 'ask_turn_1',
      ret_which_segments_driving: 'ask_turn_1',
      ret_turn_2_risk_segments: 'ask_turn_2',
      ret_impact_model: 'ask_turn_2',
      ret_turn_3_retention_action: 'ask_turn_3',
      ret_retention_brief: 'ask_turn_3',
    },
    stats: [
      { id: 'at_risk', label: 'At-Risk Members', value: '1,769', trend: '+214 this week', positive: false, icon: TrendingDown, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me at-risk members' },
      { id: 'churn', label: 'Churn Rate', value: '4.2%', trend: '+0.8% MoM', positive: false, icon: HeartPulse, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me the churn rate' },
      { id: 'ltv', label: 'Avg. LTV at Risk', value: '$47K', trend: '$83M total', positive: false, icon: DollarSign, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: null },
      { id: 'campaigns', label: 'Retention Campaigns', value: '3', trend: '1 underperforming', positive: false, icon: Target, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: 'Show me campaign performance' },
    ],
    signalToChip: {
      'SIG-RET-001': 'Show me the churn signals',
      'SIG-RET-002': "What's driving disengagement this month?",
      'SIG-RET-003': 'Show me the retiree sentiment details',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  contextPanel: {
    1: ChurnTrendLine,
    2: RetentionRiskTable,
    3: 'actions',
  },

  inlineComponents: (msg, sigs) => {
    const out = [];
    const byFlow: Record<string, string> = {
      ret_signal_1_churn_surge: 'SIG-RET-001',
      ret_signal_2_engagement_decay: 'SIG-RET-002',
      ret_signal_3_retiree_disengage: 'SIG-RET-003',
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
