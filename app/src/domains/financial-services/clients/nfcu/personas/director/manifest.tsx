/**
 * Persona: Director, Contact Center Operations (Marcus Tillman) — NFCU. Executive
 * altitude of the supervisor story: briefing panel + intraday dashboard + team
 * rollups, migration timeline, and scenario tables composed inline.
 */

import { Gauge, DollarSign, Star, TrendingDown, AlertTriangle, Briefcase } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/nfcu/director/signals.json';
import dataSources from '@/data/nfcu/director/dataSources.json';
import capabilityCallouts from '@/data/nfcu/director/capabilityCallouts.json';
import intradayBaseline from '@/data/nfcu/director/intraday.json';

import SignalCard from '@/components/cards/SignalCard';
import BriefingPanel from '@/components/briefing/BriefingPanel';
import RootCauseTree from '@/components/intraday/RootCauseTree';
import NFCUTeamRollupTable from '@/components/nfcu/NFCUTeamRollupTable';
import NFCUMigrationTimeline from '@/components/nfcu/NFCUMigrationTimeline';
import NFCUOvertimeBudgetBar from '@/components/nfcu/NFCUOvertimeBudgetBar';
import NFCUDirectorScenariosTable from '@/components/nfcu/NFCUDirectorScenariosTable';

const flows = (getPersonaFlowConfigs('nfcu') as unknown as Record<string, PersonaManifest['flows']>).nfcu_director;

const manifest: PersonaManifest = {
  id: 'nfcu_director',
  clientId: 'nfcu',
  domainId: 'financial-services',

  identity: { name: 'Marcus Tillman', initials: 'MT', role: 'Director, Contact Center Operations', greeting: 'Marcus' },
  capabilities: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Predictive Intelligence',
    'Anomaly Detection',
    'Automated Action',
    'Friction Observability',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',

  briefing: {
    baseline: intradayBaseline as NonNullable<PersonaManifest['briefing']>['baseline'],
    tiers: ['executive', 'supervisor', 'agent'],
    panelComponent: BriefingPanel as unknown as NonNullable<PersonaManifest['briefing']>['panelComponent'],
    rootCauseFlowKeys: ['nfcu_dir_root_cause_correlation'],
    rootCauseComponent: RootCauseTree as unknown as NonNullable<PersonaManifest['briefing']>['rootCauseComponent'],
  },

  ui: {
    greetingFlowKey: 'nfcu_dir_greeting',
    initialChips: [
      'Walk me through the service level issue',
      'Show me the migration risk',
      'What is my budget exposure?',
      'Show root cause correlation',
      'Generate my weekly leadership report',
    ],
    goldenPathChip: {
      nfcu_dir_greeting: 'Walk me through the service level issue',
      nfcu_dir_signal_1_service: 'What are my options to stabilize both teams?',
      nfcu_dir_turn_2_scenarios: 'Execute Scenario C',
      nfcu_dir_act_scenario_c: 'Draft an escalation to the SI partner',
      nfcu_dir_act_si_escalation: 'Generate my weekly leadership report',
      intraday_dir_t1_greeting: 'Walk me through the SIP impact',
      intraday_dir_t2_walkthrough: 'What about the rate promotion impact?',
      intraday_dir_t3_correlate: 'What are my options?',
      intraday_dir_t4_options: 'Execute Plan C',
      intraday_dir_t5_execute: 'What should I tell the COO right now?',
      intraday_dir_t6_brief: 'Show me historical incidents like this',
    },
    flowKeyToCapabilityTrigger: {
      nfcu_dir_greeting: 'home_load',
      nfcu_dir_signal_1_service: 'home_load',
      nfcu_dir_signal_2_migration: 'home_load',
      nfcu_dir_signal_3_budget: 'home_load',
      nfcu_dir_root_cause_correlation: 'ask_turn_2',
      nfcu_dir_turn_1_team_rollup: 'ask_turn_1',
      nfcu_dir_cascade_impact: 'ask_turn_5',
      nfcu_dir_turn_2_scenarios: 'ask_turn_2',
      nfcu_dir_migration_detail: 'ask_turn_3',
      nfcu_dir_deadline_impact: 'ask_turn_3',
      nfcu_dir_budget_exposure: 'ask_turn_5',
      nfcu_dir_turn_3_actions: 'ask_turn_4',
      nfcu_dir_act_scenario_c: 'ask_turn_4',
      nfcu_dir_act_si_escalation: 'ask_turn_4',
      nfcu_dir_weekly_report: 'ask_turn_4',
      intraday_dir_t1_greeting: 'home_load',
      intraday_dir_t2_walkthrough: 'ask_turn_1',
      intraday_dir_t3_correlate: 'ask_turn_2',
      intraday_dir_t4_options: 'ask_turn_3',
    },
    stats: [
      { id: 'agg_sl', label: 'Aggregate Service Level', value: '68%', trend: 'Below 80% target', positive: false, icon: Gauge, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me service levels across all teams' },
      { id: 'cost', label: 'Cost per Contact', value: '$7.42', trend: '+7.7% MoM', positive: false, icon: DollarSign, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me cost per contact trend' },
      { id: 'csat', label: 'CSAT (30-day)', value: '3.9/5.0', trend: 'Stable despite SL dip', positive: true, icon: Star, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: "Compare to last month's report" },
      { id: 'attrition', label: 'Agent Attrition (90d)', value: '16.4%', trend: '+2.3pts QoQ', positive: false, icon: TrendingDown, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'Drill into the attrition data' },
      { id: 'migration', label: 'Migration Phase 2', value: '64%', trend: '12 days behind', positive: false, icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'What is my migration status?' },
      { id: 'ot', label: 'Q2 Overtime Spend', value: '$287K / $412K', trend: 'Trajectory: 138%', positive: false, icon: Briefcase, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'What is my overtime budget exposure?' },
    ],
    signalToChip: {
      'SIG-NFCU-DIR-001': 'Walk me through the service level issue',
      'SIG-NFCU-DIR-002': 'Show me the migration risk',
      'SIG-NFCU-DIR-003': 'What is my budget exposure?',
      'SIG-INTRA-DIR-001': 'Walk me through the SIP degradation',
      'SIG-INTRA-DIR-002': 'Show the rate promo volume surge',
      'SIG-INTRA-DIR-003': 'Show the cross-team cascade risk',
      'TREND-DIR-001': 'Show the member sentiment trend',
      'TREND-DIR-002': 'Show the mortgage repeat-contact pattern',
      'TREND-DIR-003': 'Show the staffing availability outlook',
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
    // Briefing-tile responses
    if (k === 'nfcu_dir_brief_sip_degradation') out.push(<NFCUTeamRollupTable key="briefsiprollup" />);
    if (k === 'nfcu_dir_brief_promo_surge') out.push(<NFCUMigrationTimeline key="briefpromomigration" />);
    if (k === 'nfcu_dir_brief_cascade_risk') out.push(<NFCUTeamRollupTable key="briefcascaderollup" />);
    if (k === 'nfcu_dir_brief_sentiment_trend') out.push(<NFCUTeamRollupTable key="briefsentimentrollup" />);
    if (k === 'nfcu_dir_brief_mortgage_repeat') out.push(<NFCUMigrationTimeline key="briefmortgagemigration" />);
    if (k === 'nfcu_dir_brief_staffing_outlook') out.push(<NFCUOvertimeBudgetBar key="briefstaffingbudget" />);
    // Signal cards
    if (k === 'nfcu_dir_signal_1_service') { pushSignal('SIG-NFCU-DIR-001', 'nfcudirsig1'); out.push(<NFCUTeamRollupTable key="dirteamrollupsig" />); }
    if (k === 'nfcu_dir_signal_2_migration') { pushSignal('SIG-NFCU-DIR-002', 'nfcudirsig2'); out.push(<NFCUMigrationTimeline key="dirmigsig" />); }
    if (k === 'nfcu_dir_signal_3_budget') { pushSignal('SIG-NFCU-DIR-003', 'nfcudirsig3'); out.push(<NFCUOvertimeBudgetBar key="dirbudgetsig" />); }
    // Conversation turns
    if (k === 'nfcu_dir_turn_1_team_rollup') out.push(<NFCUTeamRollupTable key="dirteamrollupturn" />);
    if (k === 'nfcu_dir_turn_2_scenarios') out.push(<NFCUDirectorScenariosTable key="dirscenariosturn" />);
    if (k === 'nfcu_dir_migration_detail' || k === 'nfcu_dir_phase_2_options' || k === 'nfcu_dir_deadline_impact') out.push(<NFCUMigrationTimeline key="dirmigturn" />);
    if (k === 'nfcu_dir_cascade_impact') out.push(<NFCUTeamRollupTable key="dircascade" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
