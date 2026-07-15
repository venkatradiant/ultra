/**
 * Persona: CX Transformation (Priya K.) — generic financial-services persona.
 * Split layout, shared across clients. Single source of truth for the persona.
 * (flows sourced from legacy personaFlowConfigs until Phase 5 — see ops manifest.)
 */

import { BarChart3, ArrowLeftRight, Star, Briefcase } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/cx/signals.json';
import dataSources from '@/data/cx/dataSources.json';
import capabilityCallouts from '@/data/cx/capabilityCallouts.json';

import ChannelSwitchBar from '@/components/charts/ChannelSwitchBar';
import JourneyFrictionTable from '@/components/tables/JourneyFrictionTable';
import SignalCard from '@/components/cards/SignalCard';

/** Factory: generic cx persona, shared across clients (PenFed overrides flows). */
export default function createCxManifest(clientId: string): PersonaManifest {
  const flows = getPersonaFlowConfigs(clientId).cx;

  return {
  id: 'cx',
  clientId,
  marketId: 'financial-services',

  identity: { name: 'Priya K.', initials: 'PK', role: 'CX Transformation', greeting: 'Priya' },
  capabilities: ['Proactive Intelligence', 'Converged Conversation', 'Friction Observability', 'Automated Action'],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'split',

  ui: {
    greetingFlowKey: 'cx_greeting',
    initialChips: [
      'Where are members hitting friction?',
      'Which journeys underperform this week?',
      'Show me channel switching patterns',
      "What's driving the IVR escalation spike?",
      'Summarize service recovery gaps',
    ],
    goldenPathChip: {
      cx_greeting: 'Where are members hitting friction?',
      cx_turn_1_channel_friction: 'Show me which journeys underperform',
      cx_turn_2_journey_friction: 'What intervention is needed?',
    },
    flowKeyToCapabilityTrigger: {
      cx_greeting: 'home_load',
      cx_signal_1_channel_switch: 'home_load',
      cx_signal_2_journey_abandon: 'home_load',
      cx_signal_3_ivr_escalation: 'home_load',
      cx_turn_1_channel_friction: 'ask_turn_1',
      cx_ivr_escalation_detail: 'ask_turn_1',
      cx_who_are_members: 'ask_turn_1',
      cx_turn_2_journey_friction: 'ask_turn_2',
      cx_channel_patterns: 'ask_turn_2',
      cx_csat_trend: 'ask_turn_2',
      cx_service_recovery_gaps: 'ask_turn_2',
      cx_mortgage_friction_detail: 'ask_turn_2',
      cx_turn_3_intervention: 'ask_turn_3',
      cx_outreach_draft: 'ask_turn_3',
      cx_send_to_callback: 'ask_turn_3',
      cx_service_recovery_report: 'ask_turn_3',
    },
    stats: [
      { id: 'journeys', label: 'Active Journeys', value: '1,847', trend: '-8% completion', positive: false, icon: BarChart3, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Show me active journey performance' },
      { id: 'switches', label: 'Channel Switches', value: '312', trend: '+47%', positive: false, icon: ArrowLeftRight, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me channel switching patterns' },
      { id: 'csat', label: 'CSAT Score', value: '3.6/5', trend: '-0.4 pts', positive: false, icon: Star, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: null },
      { id: 'cases', label: 'Open Cases', value: '89', trend: '12 escalated', positive: false, icon: Briefcase, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: 'Show me open cases' },
    ],
    signalToChip: {
      'SIG-CX-001': 'Show me channel switching patterns',
      'SIG-CX-002': 'Drill into mortgage journey friction',
      'SIG-CX-003': "What's driving the IVR escalation spike?",
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  contextPanel: {
    1: ChannelSwitchBar,
    2: JourneyFrictionTable,
    3: 'actions',
  },

  inlineComponents: (msg, sigs) => {
    const out = [];
    const byFlow: Record<string, string> = {
      cx_signal_1_channel_switch: 'SIG-CX-001',
      cx_signal_2_journey_abandon: 'SIG-CX-002',
      cx_signal_3_ivr_escalation: 'SIG-CX-003',
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
