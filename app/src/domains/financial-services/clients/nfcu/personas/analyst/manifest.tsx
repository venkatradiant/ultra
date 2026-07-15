/**
 * Persona: Workforce Planning Analyst (Derek Whitfield) — NFCU. Split layout
 * with per-turn context panel (tax-season chart, scenario table).
 */

import { Gauge, CheckCircle, AlertTriangle, TrendingDown, Target } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/nfcu/analyst/signals.json';
import dataSources from '@/data/nfcu/analyst/dataSources.json';
import capabilityCallouts from '@/data/nfcu/analyst/capabilityCallouts.json';

import NFCUTaxSeasonChart from '@/components/nfcu/NFCUTaxSeasonChart';
import NFCUScenarioTable from '@/components/nfcu/NFCUScenarioTable';
import NFCUCohortChart from '@/components/nfcu/NFCUCohortChart';
import NFCUOvertimeBudgetBar from '@/components/nfcu/NFCUOvertimeBudgetBar';
import SignalCard from '@/components/cards/SignalCard';

const flows = (getPersonaFlowConfigs('nfcu') as unknown as Record<string, PersonaManifest['flows']>).nfcu_analyst;

const manifest: PersonaManifest = {
  id: 'nfcu_analyst',
  clientId: 'nfcu',
  domainId: 'financial-services',

  identity: { name: 'Derek Whitfield', initials: 'DW', role: 'Workforce Planning Analyst', greeting: 'Derek' },
  capabilities: ['Proactive Intelligence', 'Converged Conversation', 'Friction Observability', 'Predictive Intelligence'],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'split',

  ui: {
    greetingFlowKey: 'nfcu_ana_greeting',
    initialChips: [
      'Walk me through the tax season risk',
      'Show me the training cohort data',
      'What is my overtime trajectory?',
      "Forecast next week's volume by 15-minute interval",
      'Show me schedule adherence by team',
    ],
    goldenPathChip: {
      nfcu_ana_greeting: 'Walk me through the tax season risk',
      nfcu_ana_turn_1_tax_season: 'Run a what-if with 15 overtime shifts',
      nfcu_ana_turn_2_what_if: 'What about the new hire cohort?',
    },
    flowKeyToCapabilityTrigger: {
      nfcu_ana_greeting: 'home_load',
      nfcu_ana_signal_1_tax_season: 'home_load',
      nfcu_ana_signal_2_training: 'home_load',
      nfcu_ana_signal_3_ot_budget: 'home_load',
      nfcu_ana_turn_1_tax_season: 'ask_turn_1',
      nfcu_ana_turn_2_what_if: 'ask_turn_2',
      nfcu_ana_turn_3_cohort: 'ask_turn_3',
    },
    stats: [
      { id: 'ftl', label: 'Force-to-Load Ratio', value: '0.94', trend: 'Target: 1.0', positive: false, icon: Gauge, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me force-to-load ratio by queue' },
      { id: 'adherence', label: 'Schedule Adherence', value: '87.3%', trend: 'Target: 90%', positive: false, icon: CheckCircle, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Show me schedule adherence by team' },
      { id: 'ot', label: 'Overtime Hours MTD', value: '342 hrs', trend: '78% of Q2 budget', positive: false, icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'What is my overtime trajectory?' },
      { id: 'attrition', label: 'Attrition (90-day)', value: '18%', trend: 'Above benchmark', positive: false, icon: TrendingDown, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'What is my agent attrition trend?' },
      { id: 'forecast', label: 'Forecast Accuracy (30d)', value: '82%', trend: 'Target: 85%', positive: false, icon: Target, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Compare actual vs. forecast accuracy this month' },
    ],
    signalToChip: {
      'SIG-NFCU-ANA-001': 'Walk me through the tax season risk',
      'SIG-NFCU-ANA-002': 'Show me the training cohort data',
      'SIG-NFCU-ANA-003': 'What is my overtime trajectory?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  contextPanel: {
    1: NFCUTaxSeasonChart,
    2: NFCUScenarioTable,
    3: 'actions',
  },

  inlineComponents: (msg, sigs) => {
    const out = [];
    const k = msg.flowKey;
    const pushSignal = (id: string, key: string) => {
      const s = sigs.find((x) => x.id === id);
      if (s) out.push(<SignalCard key={key} signal={s} />);
    };
    if (k === 'nfcu_ana_signal_1_tax_season') { pushSignal('SIG-NFCU-ANA-001', 'anasig1'); out.push(<NFCUTaxSeasonChart key="taxseasonsig" />); }
    if (k === 'nfcu_ana_signal_2_training') { pushSignal('SIG-NFCU-ANA-002', 'anasig2'); out.push(<NFCUCohortChart key="cohortchartsig" />); }
    if (k === 'nfcu_ana_signal_3_ot_budget') { pushSignal('SIG-NFCU-ANA-003', 'anasig3'); out.push(<NFCUOvertimeBudgetBar key="otbudgetsig" />); }
    if (k === 'nfcu_ana_turn_1_tax_season') out.push(<NFCUTaxSeasonChart key="taxseasonturnchart" />);
    if (k === 'nfcu_ana_turn_2_what_if') out.push(<NFCUScenarioTable key="scenariotable" />);
    if (k === 'nfcu_ana_turn_3_cohort') out.push(<NFCUCohortChart key="cohortchart" />);
    if (k === 'nfcu_ana_ot_trajectory') out.push(<NFCUOvertimeBudgetBar key="otbudgetbar" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
