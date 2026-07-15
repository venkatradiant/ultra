/**
 * Persona: Contact Center Operations Manager (Priya Kapoor) — NFCU. The most
 * feature-rich persona: an always-on briefing panel + live intraday dashboard
 * (snapshot syncing, root-cause correlation tree) + inline queue/agent tables and
 * the governance recovery cards. Exercises the manifest `briefing` machinery.
 */

import { Headphones, Gauge, Cpu, Star, TrendingDown } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/nfcu/supervisor/signals.json';
import dataSources from '@/data/nfcu/supervisor/dataSources.json';
import capabilityCallouts from '@/data/nfcu/supervisor/capabilityCallouts.json';
import intradayBaseline from '@/data/nfcu/supervisor/intraday.json';

import SignalCard from '@/components/cards/SignalCard';
import BriefingPanel from '@/components/briefing/BriefingPanel';
import RootCauseTree from '@/components/intraday/RootCauseTree';
import NFCUQueueHealthTable from '@/components/nfcu/NFCUQueueHealthTable';
import NFCUAgentOvertimeTable from '@/components/nfcu/NFCUAgentOvertimeTable';
import NFCUQualityScoreTable from '@/components/nfcu/NFCUQualityScoreTable';
import ModelAdjustCard from '@/components/nfcu/governance/ModelAdjustCard';
import GovernanceNavButton from '@/components/nfcu/governance/GovernanceNavButton';

const flows = (getPersonaFlowConfigs('nfcu') as unknown as Record<string, PersonaManifest['flows']>).nfcu_supervisor;

const manifest: PersonaManifest = {
  id: 'nfcu_supervisor',
  clientId: 'nfcu',
  domainId: 'financial-services',

  identity: { name: 'Priya Kapoor', initials: 'PK', role: 'Contact Center Operations Manager', greeting: 'Priya' },
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

  briefing: {
    baseline: intradayBaseline as NonNullable<PersonaManifest['briefing']>['baseline'],
    tiers: ['supervisor', 'executive', 'agent'],
    panelComponent: BriefingPanel as unknown as NonNullable<PersonaManifest['briefing']>['panelComponent'],
    rootCauseFlowKeys: ['nfcu_sup_root_cause_correlation'],
    rootCauseComponent: RootCauseTree as unknown as NonNullable<PersonaManifest['briefing']>['rootCauseComponent'],
  },

  ui: {
    greetingFlowKey: 'nfcu_sup_greeting',
    initialChips: [
      'Yes, walk me through them',
      'What caused the auto loan spike?',
      'Show me staffing for Friday',
      'Show root cause correlation',
      'What is my service level right now?',
    ],
    goldenPathChip: {
      nfcu_sup_greeting: 'Yes, walk me through them',
      nfcu_sup_signal_1_queue_spike: 'How does this compare to last rate promo?',
      nfcu_sup_rate_promo_comparison: 'What should we do?',
      nfcu_sup_turn_2_recommendations: 'Activate the cross-trained agents',
      intraday_t1_greeting: 'Walk me through the SIP impact',
      intraday_t2_walkthrough: 'What about the rate promotion impact?',
      intraday_t3_correlate: 'What are my options?',
      intraday_t4_options: 'Execute Plan C',
      intraday_t5_execute: 'What should I tell leadership right now?',
      intraday_t6_brief: 'Show me historical incidents like this',
    },
    flowKeyToCapabilityTrigger: {
      nfcu_sup_greeting: 'home_load',
      nfcu_sup_signal_1_queue_spike: 'home_load',
      nfcu_sup_signal_2_staffing: 'home_load',
      nfcu_sup_signal_3_sentiment: 'home_load',
      nfcu_sup_root_cause_correlation: 'ask_turn_2',
      nfcu_sup_turn_1_queue_health: 'ask_turn_1',
      nfcu_sup_service_level_now: 'ask_turn_1',
      nfcu_sup_rate_promo_comparison: 'ask_turn_2',
      nfcu_sup_migration_status: 'ask_turn_2',
      nfcu_sup_turn_2_recommendations: 'ask_turn_3',
      nfcu_sup_overtime_agents: 'ask_turn_3',
      intraday_t1_greeting: 'home_load',
      intraday_t2_walkthrough: 'ask_turn_1',
      intraday_t3_correlate: 'ask_turn_2',
      intraday_t4_options: 'ask_turn_3',
    },
    stats: [
      { id: 'queue', label: 'Active Calls in Queue', value: '47', trend: '↑ spike active', positive: false, icon: Headphones, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'What is my service level right now?' },
      { id: 'sla', label: 'Service Level (80/20)', value: '71.3%', trend: 'Below 80% target', positive: false, icon: Gauge, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: "Show me today's queue health" },
      { id: 'aht', label: 'Avg Handle Time', value: '8:42', trend: 'Promo: 11:20 avg', positive: false, icon: Cpu, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'What is driving the longest handle times?' },
      { id: 'csat', label: 'CSAT (7-day)', value: '3.8/5.0', trend: '↓ Sentiment alert', positive: false, icon: Star, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Show me the sentiment signal' },
      { id: 'abandon', label: 'Abandonment Rate', value: '14.2%', trend: 'D365 + Genesys blended', positive: false, icon: TrendingDown, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me queue performance by channel' },
    ],
    signalToChip: {
      'SIG-NFCU-SUP-001': 'What caused the auto loan spike?',
      'SIG-NFCU-SUP-002': 'Show me staffing for Friday',
      'SIG-NFCU-SUP-003': 'Show me the sentiment signal',
      'SIG-INTRA-SUP-001': 'Walk me through the dual incident',
      'SIG-INTRA-SUP-002': 'Show me the PinDrop auth failures',
      'SIG-INTRA-SUP-003': 'Why is IVR containment dropping?',
      'TREND-SUP-001': 'Show the auto loans sentiment trend',
      'TREND-SUP-002': 'Show the repeat-contact pattern',
      'TREND-SUP-003': 'Show the agent fatigue watch list',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg, sigs) => {
    const out = [];
    const k = msg.flowKey;
    const pushSignal = (id: string, key: string) => {
      const s = sigs.find((x) => x.id === id);
      if (s) out.push(<SignalCard key={key} signal={s} />);
    };
    // Briefing-tile click responses
    if (k === 'nfcu_sup_brief_dual_incident') out.push(<NFCUQueueHealthTable key="briefdualqueue" />);
    if (k === 'nfcu_sup_brief_pindrop_failures') out.push(<NFCUAgentOvertimeTable key="briefpindropagents" />);
    if (k === 'nfcu_sup_brief_ivr_containment') out.push(<NFCUQueueHealthTable key="briefivrqueue" />);
    if (k === 'nfcu_sup_brief_sentiment_trend') out.push(<NFCUQualityScoreTable key="briefsentimentquality" />);
    if (k === 'nfcu_sup_brief_repeat_contact') out.push(<NFCUQualityScoreTable key="briefrepeatquality" />);
    if (k === 'nfcu_sup_brief_agent_fatigue') out.push(<NFCUAgentOvertimeTable key="brieffatigueagents" />);
    // Signal cards
    if (k === 'nfcu_sup_signal_1_queue_spike') { pushSignal('SIG-NFCU-SUP-001', 'nfcususig1'); out.push(<NFCUQueueHealthTable key="queuehealth" />); }
    if (k === 'nfcu_sup_signal_2_staffing') pushSignal('SIG-NFCU-SUP-002', 'nfcususig2');
    if (k === 'nfcu_sup_signal_3_sentiment') pushSignal('SIG-NFCU-SUP-003', 'nfcususig3');
    // Conversation turns
    if (k === 'nfcu_sup_turn_1_queue_health') out.push(<NFCUQueueHealthTable key="queuehealthturn" />);
    if (k === 'nfcu_sup_overtime_agents') out.push(<NFCUAgentOvertimeTable key="agentovertimeturn" />);
    // Failure & recovery scripted path — model-adjust + governance link cards
    const uiComps = (msg.uiComponents || []) as Array<{ type?: string; title?: string; description?: string; trigger?: string; model_version?: string; weights?: unknown; label?: string }>;
    if (k === 'nfcu_sup_recovery_t4_human_override') {
      const adjust = uiComps.find((c) => c.type === 'model_adjust');
      if (adjust) out.push(<ModelAdjustCard key="modeladjust" title={adjust.title} description={adjust.description} trigger={adjust.trigger} modelVersion={adjust.model_version} weights={adjust.weights as never} />);
    }
    if (k === 'nfcu_sup_recovery_t6_audit_link') {
      const navBtn = uiComps.find((c) => c.type === 'governance_nav_button');
      if (navBtn) out.push(<GovernanceNavButton key="govnav" label={navBtn.label} description={navBtn.description} />);
    }
    return out.length ? out : undefined;
  },
};

export default manifest;
