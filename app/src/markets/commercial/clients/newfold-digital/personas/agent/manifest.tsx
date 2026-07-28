/**
 * Persona: Support Agent, Agent-Assist (Jordan Ellis) — Newfold Digital.
 *
 * The agent end of the site-down thread. Agent-Assist reads across five systems
 * in real time, hands Jordan the correct explanation and a compliant resolution,
 * and keeps a record of what the AI did versus what Jordan decided — so quality
 * and compliance are protected while handle time drops.
 */
import { Clock, CheckCircle2, Star, Phone, Frown, CalendarCheck } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/newfold-digital/agent/signals.json';
import dataSources from '@/data/newfold-digital/_shared/dataSources.json';
import capabilityCallouts from '@/data/newfold-digital/agent/capabilityCallouts.json';

import LiveContactPanel from '@/components/newfold/agent/LiveContactPanel';
import RootCauseCard from '@/components/newfold/agent/RootCauseCard';
import ScriptCard from '@/components/newfold/agent/ScriptCard';
import PciGateCard from '@/components/newfold/agent/PciGateCard';
import AgentFixVsDefer from '@/components/newfold/agent/AgentFixVsDefer';
import AiVsHumanLog from '@/components/newfold/agent/AiVsHumanLog';
import AfterContactSummary from '@/components/newfold/agent/AfterContactSummary';

const flows = (getPersonaFlowConfigs('newfold_digital') as unknown as Record<string, PersonaManifest['flows']>).newfold_agent;

const manifest: PersonaManifest = {
  id: 'newfold_agent',
  clientId: 'newfold_digital',
  marketId: 'commercial',

  identity: { name: 'Jordan Ellis', initials: 'JE', role: 'Support Agent, Agent-Assist', greeting: 'Jordan' },
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

  ui: {
    greetingFlowKey: 'newfold_agent_greeting',
    initialChips: [
      "Why is this customer's site down?",
      'Correlate the issue across her accounts',
      'How do I explain this in plain language?',
      'What is the compliant resolution?',
      'Prompt the identity and payment verification step',
      'Restore the account after the fix',
      'Log AI versus human actions for this contact',
      'Draft my after-contact summary',
    ],
    goldenPathChip: {
      newfold_agent_greeting: 'Give me the full breakdown',
      newfold_agent_breakdown: 'How do I explain this simply?',
      newfold_agent_script: 'Verify her identity first',
      newfold_agent_verify: 'Identity confirmed',
      newfold_agent_forecast: 'Do the full fix now',
      newfold_agent_fix: 'Wrap up the contact',
      newfold_agent_wrap: 'Save and close',
    },
    flowKeyToCapabilityTrigger: {
      newfold_agent_greeting: 'home_load',
      newfold_agent_breakdown: 'ask_turn_1',
      newfold_agent_account_summary: 'ask_turn_1',
      newfold_agent_tell_first: 'ask_turn_1',
      newfold_agent_walk_fix: 'ask_turn_1',
      newfold_agent_script: 'ask_turn_2',
      newfold_agent_say_that: 'ask_turn_2',
      newfold_agent_verify: 'ask_turn_3',
      newfold_agent_why_required: 'ask_turn_3',
      newfold_agent_continue_fix: 'ask_turn_3',
      newfold_agent_forecast: 'ask_turn_4',
      newfold_agent_churn_risk: 'ask_turn_4',
      newfold_agent_fee_risk: 'ask_turn_4',
      newfold_agent_loyalty: 'ask_turn_4',
      newfold_agent_fix: 'ask_turn_5',
      newfold_agent_confirm_customer: 'ask_turn_5',
      newfold_agent_add_note: 'ask_turn_5',
      newfold_agent_save_close: 'ask_turn_5',
      newfold_agent_next: 'ask_turn_5',
      newfold_agent_wrap: 'ask_turn_2',
      newfold_agent_edit_note: 'ask_turn_2',
    },
    stats: [
      { id: 'aht', label: 'Average Handle Time', value: '8:10', trend: 'Today', positive: true, icon: Clock, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'Draft my after-contact summary' },
      { id: 'fcr', label: 'First Contact Resolution', value: '73%', trend: 'Service Cloud + Customer 360', positive: true, icon: CheckCircle2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'What is the compliant resolution?' },
      { id: 'quality', label: 'Quality Score (30d)', value: '91/100', trend: 'Quality Management', positive: true, icon: Star, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Log AI versus human actions for this contact' },
      { id: 'handled', label: 'Contacts Handled (Today)', value: '21', trend: 'Service Cloud', positive: true, icon: Phone, iconColor: 'text-text-muted', iconBg: 'bg-surface-2', chipText: null },
      { id: 'sentiment', label: 'Live Sentiment (Current)', value: 'Negative', trend: 'Rising', positive: false, icon: Frown, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: "Why is this customer's site down?" },
      { id: 'adherence', label: 'Schedule Adherence', value: '93%', trend: 'Workforce Management', positive: true, icon: CalendarCheck, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: null },
    ],
    signalToChip: {
      'SIG-NEWFOLD-AGT-001': 'Give me the full breakdown',
      'SIG-NEWFOLD-AGT-002': 'What do I tell her first?',
      'SIG-NEWFOLD-AGT-003': 'Verify her identity first',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    // Greeting opens the Agent-Assist live-contact panel (the "who's on the line"
    // context, per spec Table 62). The priority-signal detail is not dumped
    // upfront — it appears when the agent taps a signal tile.
    if (k === 'newfold_agent_greeting') {
      out.push(<LiveContactPanel key="live" />);
    }
    if (k === 'newfold_agent_breakdown' || k === 'newfold_agent_account_summary') out.push(<RootCauseCard key="rootcause" />);
    if (k === 'newfold_agent_script' || k === 'newfold_agent_say_that') out.push(<ScriptCard key="script" />);
    if (k === 'newfold_agent_verify' || k === 'newfold_agent_why_required' || k === 'newfold_agent_continue_fix') out.push(<PciGateCard key="pci" />);
    if (k === 'newfold_agent_forecast' || k === 'newfold_agent_churn_risk' || k === 'newfold_agent_fee_risk') out.push(<AgentFixVsDefer key="fixvsdefer" />);
    if (k === 'newfold_agent_fix' || k === 'newfold_agent_confirm_customer' || k === 'newfold_agent_add_note') out.push(<AiVsHumanLog key="log" />);
    if (k === 'newfold_agent_wrap' || k === 'newfold_agent_edit_note') out.push(<AfterContactSummary key="summary" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
