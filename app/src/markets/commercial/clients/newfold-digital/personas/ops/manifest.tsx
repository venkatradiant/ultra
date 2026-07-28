/**
 * Persona: Contact Center Operations Manager (Sofia Reyes) — Newfold Digital.
 *
 * Second persona. Owns daily care for Billing & Renewals plus Hosting Support.
 * The renewal-spike thread at the operating level: the 210% spike, the cross-
 * cycle comparison, the wait-time forecast, the agent reroute with the Bluehost
 * trade-off, the hosting-outage correlation, and the save-desk at-risk queue.
 */
import { Users, Gauge, Clock, PhoneOff, Activity, Star, MessagesSquare, Database } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/newfold-digital/ops/signals.json';
import dataSources from '@/data/newfold-digital/_shared/dataSources.json';
import capabilityCallouts from '@/data/newfold-digital/ops/capabilityCallouts.json';

import NewfoldBrandSignals from '@/components/newfold/NewfoldBrandSignals';
import RenewalSpikeChart from '@/components/newfold/ops/RenewalSpikeChart';
import RenewalComparisonChart from '@/components/newfold/ops/RenewalComparisonChart';
import WaitTimeForecast from '@/components/newfold/ops/WaitTimeForecast';
import AgentAllocationPanel from '@/components/newfold/ops/AgentAllocationPanel';
import SiteDownCorrelation from '@/components/newfold/ops/SiteDownCorrelation';
import SaveDeskPanel from '@/components/newfold/ops/SaveDeskPanel';

const flows = (getPersonaFlowConfigs('newfold_digital') as unknown as Record<string, PersonaManifest['flows']>).newfold_ops;

const manifest: PersonaManifest = {
  id: 'newfold_ops',
  clientId: 'newfold_digital',
  marketId: 'commercial',

  identity: { name: 'Sofia Reyes', initials: 'SR', role: 'Contact Center Operations Manager', greeting: 'Sofia' },
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

  layout: 'inline',

  // Priority signals filter to the brand-context selection (cross-brand default).
  signalsComponent: NewfoldBrandSignals as unknown as PersonaManifest['signalsComponent'],

  ui: {
    greetingFlowKey: 'newfold_ops_greeting',
    initialChips: [
      'What is my service level right now?',
      'Show me queue performance by channel',
      'What is driving the renewals spike?',
      'Compare today\'s volume to the last renewal cycle',
      'Which agents are idle?',
      'Show me save-desk load and at-risk accounts',
      'Forecast this afternoon\'s staffing needs',
      'Generate my daily ops report',
    ],
    goldenPathChip: {
      newfold_ops_greeting: 'Yes, walk me through them',
      newfold_ops_walkthrough: 'How does this compare to the last renewal cycle?',
      newfold_ops_compare_cycle: 'What should we do?',
      newfold_ops_recommendations: 'Activate the cross-trained agents',
      newfold_ops_act_agents: 'Show me the second signal',
      newfold_ops_signal_2_outage: 'Show me the save-desk signal',
      newfold_ops_signal_3_savedesk: 'Generate my daily ops report',
    },
    flowKeyToCapabilityTrigger: {
      newfold_ops_greeting: 'home_load',
      newfold_ops_walkthrough: 'ask_turn_1',
      newfold_ops_spike_cause: 'ask_turn_1',
      newfold_ops_customers: 'ask_turn_1',
      newfold_ops_service_level: 'ask_turn_1',
      newfold_ops_queue_channel: 'ask_turn_1',
      newfold_ops_idle_agents: 'ask_turn_1',
      newfold_ops_compare_cycle: 'ask_turn_2',
      newfold_ops_savedesk_status: 'ask_turn_2',
      newfold_ops_recommendations: 'ask_turn_3',
      newfold_ops_deflect: 'ask_turn_3',
      newfold_ops_forecast_staffing: 'ask_turn_3',
      newfold_ops_highest_value: 'ask_turn_3',
      newfold_ops_fix_eta: 'ask_turn_3',
      newfold_ops_signal_3_savedesk: 'ask_turn_3',
      newfold_ops_act_agents: 'ask_turn_4',
      newfold_ops_act_explainer: 'ask_turn_4',
      newfold_ops_act_notification: 'ask_turn_4',
      newfold_ops_monitor: 'ask_turn_4',
      newfold_ops_act_macro: 'ask_turn_4',
      newfold_ops_act_offers: 'ask_turn_4',
      newfold_ops_add_agents: 'ask_turn_4',
      newfold_ops_daily_report: 'ask_turn_4',
      newfold_ops_signal_2_outage: 'ask_turn_5',
      newfold_ops_affected: 'ask_turn_5',
    },
    stats: [
      { id: 'in_queue', label: 'Active Contacts in Queue', value: '63', trend: 'Renewals driving it', positive: false, icon: Users, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'What is my service level right now?' },
      { id: 'sl', label: 'Service Level (80/20)', value: '68.4%', trend: 'Below target', positive: false, icon: Gauge, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'What is my service level right now?' },
      { id: 'aht', label: 'Average Handle Time', value: '9:52', trend: 'Price-increase premium', positive: false, icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'What is driving the renewals spike?' },
      { id: 'abandon', label: 'Abandonment Rate', value: '16.1%', trend: 'Blended queues', positive: false, icon: PhoneOff, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'What is driving the renewals spike?' },
      { id: 'occupancy', label: 'Agent Occupancy', value: '92%', trend: 'Near ceiling', positive: false, icon: Activity, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Forecast this afternoon\'s staffing needs' },
      { id: 'csat', label: 'CSAT (trailing 7 days)', value: '3.6 / 5.0', trend: 'Softened on billing', positive: false, icon: Star, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me save-desk load and at-risk accounts' },
      { id: 'channels', label: 'Channels Active', value: '4', trend: 'Voice, chat, email, social', positive: true, icon: MessagesSquare, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Show me queue performance by channel' },
      { id: 'sources', label: 'Data Sources Connected', value: '7', trend: 'Radiant Intelligence Layer', positive: true, icon: Database, iconColor: 'text-text-muted', iconBg: 'bg-surface-2', chipText: null },
    ],
    signalToChip: {
      'SIG-NEWFOLD-OPS-001': 'Yes, walk me through them',
      'SIG-NEWFOLD-OPS-002': 'Show me the second signal',
      'SIG-NEWFOLD-OPS-003': 'Show me the save-desk signal',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    // Greeting shows the message + the compact PRIORITY SIGNALS strip only; the
    // full signal detail appears when a priority tile is clicked.
    if (k === 'newfold_ops_walkthrough' || k === 'newfold_ops_spike_cause') out.push(<RenewalSpikeChart key="spike" />);
    if (k === 'newfold_ops_compare_cycle') out.push(<RenewalComparisonChart key="compare" />);
    if (k === 'newfold_ops_recommendations' || k === 'newfold_ops_forecast_staffing') out.push(<WaitTimeForecast key="forecast" />);
    if (k === 'newfold_ops_act_agents' || k === 'newfold_ops_act_explainer') out.push(<AgentAllocationPanel key="alloc" />);
    if (k === 'newfold_ops_signal_2_outage' || k === 'newfold_ops_affected' || k === 'newfold_ops_fix_eta' || k === 'newfold_ops_act_macro') out.push(<SiteDownCorrelation key="outage" />);
    if (k === 'newfold_ops_signal_3_savedesk' || k === 'newfold_ops_savedesk_status' || k === 'newfold_ops_highest_value' || k === 'newfold_ops_act_offers' || k === 'newfold_ops_add_agents') out.push(<SaveDeskPanel key="savedesk" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
