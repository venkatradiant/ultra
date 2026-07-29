/**
 * Persona: Workforce Planning Analyst (Tomas Herrera) — Newfold Digital.
 *
 * Forecasts contact volume, staffing, and force-to-load across every care queue
 * and brand. A 4-step flow: the Q4 renewal-and-holiday surge (multi-year overlay),
 * a conversational what-if on staffing scenarios, and the new-hire cohort ramp.
 */
import { Gauge, CalendarCheck, Target, Clock, TrendingDown, Timer } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/newfold-digital/workforce/signals.json';
import dataSources from '@/data/newfold-digital/_shared/dataSources.json';
import capabilityCallouts from '@/data/newfold-digital/workforce/capabilityCallouts.json';

import MultiYearSurgeChart from '@/components/newfold/workforce/MultiYearSurgeChart';
import StaffingScenarioTable from '@/components/newfold/workforce/StaffingScenarioTable';
import CohortRampCurve from '@/components/newfold/workforce/CohortRampCurve';

const flows = (getPersonaFlowConfigs('newfold_digital') as unknown as Record<string, PersonaManifest['flows']>).newfold_workforce;

const manifest: PersonaManifest = {
  id: 'newfold_workforce',
  clientId: 'newfold_digital',
  marketId: 'commercial',

  identity: { name: 'Tomas Herrera', initials: 'TH', role: 'Workforce Planning Analyst', greeting: 'Tomas' },
  capabilities: ['Proactive Intelligence', 'Converged Conversation', 'Friction Observability', 'Predictive Intelligence'],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',

  ui: {
    greetingFlowKey: 'newfold_wf_greeting',
    initialChips: [
      "Forecast next week's volume by 30-minute interval",
      'Show me force-to-load ratio by queue and brand',
      'Compare actual versus forecast accuracy this month',
      'Which shifts are understaffed for the Q4 peak?',
      'What is my agent attrition trend?',
      'Model staffing for a 38% volume increase',
      'Show me BPO overflow readiness',
      'Generate the weekly workforce report',
    ],
    goldenPathChip: {
      newfold_wf_greeting: 'Walk me through the surge risk',
      newfold_wf_surge: 'Run a what-if with 16 overtime shifts',
      newfold_wf_whatif: 'What about the new-hire cohort?',
      newfold_wf_cohort: 'Schedule targeted coaching',
    },
    flowKeyToCapabilityTrigger: {
      newfold_wf_greeting: 'home_load',
      newfold_wf_surge: 'ask_turn_1',
      newfold_wf_queues_impacted: 'ask_turn_1',
      newfold_wf_last_year: 'ask_turn_1',
      newfold_wf_ftl: 'ask_turn_1',
      newfold_wf_whatif: 'ask_turn_2',
      newfold_wf_options: 'ask_turn_2',
      newfold_wf_hybrid: 'ask_turn_2',
      newfold_wf_bpo: 'ask_turn_2',
      newfold_wf_fourth_scenario: 'ask_turn_2',
      newfold_wf_ot_trajectory: 'ask_turn_2',
      newfold_wf_ot_budget_impact: 'ask_turn_2',
      newfold_wf_report: 'ask_turn_2',
      newfold_wf_forecast_interval: 'ask_turn_2',
      newfold_wf_understaffed: 'ask_turn_2',
      newfold_wf_model_38: 'ask_turn_2',
      newfold_wf_cohort: 'ask_turn_3',
      newfold_wf_furthest_behind: 'ask_turn_3',
      newfold_wf_coaching: 'ask_turn_3',
      newfold_wf_can_handle: 'ask_turn_3',
      newfold_wf_forecast_accuracy: 'ask_turn_3',
      newfold_wf_attrition: 'ask_turn_3',
    },
    stats: [
      { id: 'ftl', label: 'Force-to-Load Ratio', value: '0.93', trend: 'Target: 1.0', positive: false, icon: Gauge, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me force-to-load ratio by queue and brand' },
      { id: 'adherence', label: 'Schedule Adherence', value: '86.1%', trend: 'Workforce Management', positive: true, icon: CalendarCheck, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Which shifts are understaffed for the Q4 peak?' },
      { id: 'accuracy', label: 'Forecast Accuracy (30d)', value: '81%', trend: 'Below 90% target', positive: false, icon: Target, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Compare actual versus forecast accuracy this month' },
      { id: 'ot', label: 'Overtime Hours (MTD)', value: '1,180 hrs', trend: 'HR + WFM', positive: false, icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'What is my overtime trajectory?' },
      { id: 'attrition', label: 'Agent Attrition (90d)', value: '22%', trend: 'Schedule inflexibility', positive: false, icon: TrendingDown, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'What is my agent attrition trend?' },
      { id: 'asa', label: 'Average Speed of Answer', value: '3:38', trend: 'Genesys Cloud', positive: false, icon: Timer, iconColor: 'text-text-muted', iconBg: 'bg-surface-2', chipText: "Forecast next week's volume by 30-minute interval" },
    ],
    signalToChip: {
      'SIG-NEWFOLD-WF-001': 'Walk me through the surge risk',
      'SIG-NEWFOLD-WF-002': 'What about the new-hire cohort?',
      'SIG-NEWFOLD-WF-003': 'What is my overtime trajectory?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    // Greeting shows the message + the compact PRIORITY SIGNALS strip only; the
    // full signal detail appears when a priority tile is clicked.
    if (k === 'newfold_wf_surge' || k === 'newfold_wf_queues_impacted' || k === 'newfold_wf_forecast_interval') out.push(<MultiYearSurgeChart key="surge" />);
    if (k === 'newfold_wf_whatif' || k === 'newfold_wf_options' || k === 'newfold_wf_fourth_scenario' || k === 'newfold_wf_model_38' || k === 'newfold_wf_understaffed') out.push(<StaffingScenarioTable key="scenarios" />);
    if (k === 'newfold_wf_cohort' || k === 'newfold_wf_furthest_behind' || k === 'newfold_wf_can_handle') out.push(<CohortRampCurve key="cohort" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
