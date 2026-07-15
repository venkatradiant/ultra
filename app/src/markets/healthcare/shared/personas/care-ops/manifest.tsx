/**
 * Persona: Care Operations (Dana W.) — the generic healthcare "care-ops" persona.
 *
 * This is a deliberately SELF-CONTAINED reference persona: its flows, signals,
 * and stats are declared inline (no external data files, no bespoke components),
 * so it demonstrates the minimum needed to stand up an entirely new MARKET. Use
 * it as the template when adding a real healthcare persona.
 */

import { HeartPulse, BedDouble, Timer, Users } from 'lucide-react';
import type { ChatFlowConfig, PersonaManifest } from '@core/types';

const flows: ChatFlowConfig = {
  chatFlows: {
    greeting: {
      ai_message:
        'Good morning, Dana. 2 signals need your attention across the care network this morning. ED boarding is climbing and the discharge pipeline is backing up. Want me to walk you through them?',
      data_sources_used: ['EHR (Epic)', 'Bed Management', 'Staffing Grid'],
      suggested_chips: ['Walk me through the ED boarding signal', 'Show me discharge bottlenecks'],
      confidence: 93,
      capability: 'Proactive Intelligence',
    },
    ed_boarding: {
      user_query: 'Walk me through the ED boarding signal',
      ai_message:
        'ED boarding hit 18 patients (up from a baseline of 6). The driver is inpatient bed availability — 22 discharge orders are written but not executed, so beds are not turning over. This correlates with a delayed AM discharge-rounds start on 4 West.',
      data_sources_used: ['EHR (Epic)', 'Bed Management'],
      suggested_chips: ['What would clear the backlog fastest?', 'Show me discharge bottlenecks'],
      confidence: 91,
      capability: 'Anomaly Detection',
    },
    discharge_bottlenecks: {
      user_query: 'Show me discharge bottlenecks',
      ai_message:
        'The top bottleneck is pharmacy turnaround on discharge meds (avg 2h14m vs. 45m target), followed by transport availability. Clearing pharmacy alone frees an estimated 9 beds by noon.',
      data_sources_used: ['Pharmacy System', 'Transport Dispatch'],
      suggested_chips: ['What would clear the backlog fastest?'],
      confidence: 89,
      capability: 'Predictive Intelligence',
    },
    recommendation: {
      user_query: 'What would clear the backlog fastest?',
      ai_message:
        'Recommended: prioritize the 9 discharge-ready patients with pending pharmacy orders and page the pharmacy lead to expedite. Projected impact: ED boarding down to 7 by 13:00, wait time −38%.',
      data_sources_used: ['Pharmacy System', 'Bed Management'],
      suggested_chips: ['Page the pharmacy lead', 'Show me the discharge list'],
      confidence: 90,
      capability: 'Automated Action',
    },
  },
  chipToFlowKey: {
    'Walk me through the ED boarding signal': 'ed_boarding',
    'Show me discharge bottlenecks': 'discharge_bottlenecks',
    'What would clear the backlog fastest?': 'recommendation',
  },
  askTurnSequence: ['ed_boarding', 'discharge_bottlenecks', 'recommendation'],
  signalSequence: ['ed_boarding', 'discharge_bottlenecks'],
};

export default function createCareOpsManifest(clientId: string): PersonaManifest {
  return {
    id: 'care_ops',
    clientId,
    marketId: 'healthcare',

    identity: { name: 'Dana W.', initials: 'DW', role: 'Care Operations', greeting: 'Dana' },
    capabilities: ['Proactive Intelligence', 'Converged Conversation', 'Predictive Intelligence', 'Anomaly Detection', 'Automated Action'],

    flows,
    signals: [
      { id: 'SIG-ED-001', title: 'ED Boarding Surge — 18 Patients', severity: 'critical', impact: 'high', description: 'ED boarding 3× baseline; inpatient beds not turning over.' },
      { id: 'SIG-DC-001', title: 'Discharge Pipeline Backing Up', severity: 'warning', impact: 'medium', description: '22 discharge orders written but not executed.' },
    ],
    dataSources: [
      { id: 'ehr', name: 'EHR (Epic)', status: 'connected' },
      { id: 'beds', name: 'Bed Management', status: 'connected' },
    ],

    layout: 'inline',

    ui: {
      greetingFlowKey: 'greeting',
      initialChips: ['Walk me through the ED boarding signal', 'Show me discharge bottlenecks', 'What would clear the backlog fastest?'],
      goldenPathChip: {
        greeting: 'Walk me through the ED boarding signal',
        ed_boarding: 'Show me discharge bottlenecks',
        discharge_bottlenecks: 'What would clear the backlog fastest?',
      },
      flowKeyToCapabilityTrigger: {},
      stats: [
        { id: 'boarding', label: 'ED Boarding', value: '18', trend: '3× baseline', positive: false, icon: HeartPulse, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Walk me through the ED boarding signal' },
        { id: 'beds', label: 'Available Beds', value: '4', trend: '22 pending discharge', positive: false, icon: BedDouble, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me discharge bottlenecks' },
        { id: 'los', label: 'Avg Length of Stay', value: '5.1d', trend: '+0.4d MoM', positive: false, icon: Timer, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: null },
        { id: 'census', label: 'Inpatient Census', value: '312', trend: '94% capacity', positive: false, icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: null },
      ],
      signalToChip: {
        'SIG-ED-001': 'Walk me through the ED boarding signal',
        'SIG-DC-001': 'Show me discharge bottlenecks',
      },
      capabilityCallouts: [],
    },
  };
}
