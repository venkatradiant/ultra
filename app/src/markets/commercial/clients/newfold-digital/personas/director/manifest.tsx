/**
 * Persona: Director, Global Customer Care (Marisol Castellano) — Newfold Digital.
 *
 * The default persona and flagship guided demo. Executive altitude across every
 * consumer brand: cross-brand roll-up, stabilization scenarios, the Network
 * Solutions consolidation cutover, an SI escalation, the weekly CCO report, and
 * month-over-month. The renewal-spike thread's revenue-and-churn spine.
 */
import { Gauge, DollarSign, ShieldCheck, TrendingDown, Layers, Briefcase, PhoneCall, Star } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/newfold-digital/director/signals.json';
import dataSources from '@/data/newfold-digital/_shared/dataSources.json';
import capabilityCallouts from '@/data/newfold-digital/director/capabilityCallouts.json';

import NewfoldBrandSignals from '@/components/newfold/NewfoldBrandSignals';
import BrandRollupTable from '@/components/newfold/director/BrandRollupTable';
import ServiceLevelByBrandChart from '@/components/newfold/director/ServiceLevelByBrandChart';
import ScenarioTable from '@/components/newfold/director/ScenarioTable';
import MigrationTimeline from '@/components/newfold/director/MigrationTimeline';
import FlowParityTable from '@/components/newfold/director/FlowParityTable';
import WeeklyReportCard from '@/components/newfold/director/WeeklyReportCard';
import MonthComparisonTable from '@/components/newfold/director/MonthComparisonTable';
import CascadeDiagram from '@/components/newfold/director/CascadeDiagram';
import MemoPreview from '@/components/newfold/director/MemoPreview';

const flows = (getPersonaFlowConfigs('newfold_digital') as unknown as Record<string, PersonaManifest['flows']>).newfold_director;

const manifest: PersonaManifest = {
  id: 'newfold_director',
  clientId: 'newfold_digital',
  marketId: 'commercial',

  identity: { name: 'Marisol Castellano', initials: 'MC', role: 'Director, Global Customer Care', greeting: 'Marisol' },
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

  // Priority signals filter to the brand-context selection (cross-brand default).
  signalsComponent: NewfoldBrandSignals as unknown as PersonaManifest['signalsComponent'],

  ui: {
    greetingFlowKey: 'newfold_dir_greeting',
    initialChips: [
      'Show me service levels across all brands',
      'Which brand needs attention right now?',
      'What is my consolidation status?',
      'Show me cost per contact trend',
      'What is my churn and save exposure this week?',
      'Compare brand performance this week versus last week',
      'What is my overtime budget exposure?',
      'Generate my weekly leadership report',
    ],
    goldenPathChip: {
      newfold_dir_greeting: 'Walk me through the service level issue',
      newfold_dir_signal_1_service: 'What are my options to stabilize both brands?',
      newfold_dir_turn_2_scenarios: 'Execute Scenario C',
      newfold_dir_act_scenario_c: 'What about the consolidation risk?',
      newfold_dir_consolidation_detail: 'Draft an escalation to the SI partner',
      newfold_dir_act_si_escalation: 'Generate my weekly leadership report',
      newfold_dir_weekly_report: "Compare to last month's report",
      newfold_dir_signal_2_consolidation: 'Draft an escalation to the SI partner',
      newfold_dir_signal_3_churn: 'What are my options to stabilize both brands?',
    },
    flowKeyToCapabilityTrigger: {
      newfold_dir_greeting: 'home_load',
      newfold_dir_signal_1_service: 'ask_turn_1',
      newfold_dir_cascade_impact: 'ask_turn_5',
      newfold_dir_brand_priority: 'ask_turn_2',
      newfold_dir_quarter_compare: 'ask_turn_5',
      newfold_dir_turn_2_scenarios: 'ask_turn_2',
      newfold_dir_fourth_scenario: 'ask_turn_2',
      newfold_dir_save_desk_impact: 'ask_turn_2',
      newfold_dir_act_scenario_c: 'ask_turn_4',
      newfold_dir_consolidation_detail: 'ask_turn_3',
      newfold_dir_signal_2_consolidation: 'ask_turn_3',
      newfold_dir_signal_3_churn: 'ask_turn_2',
      newfold_dir_accelerate: 'ask_turn_4',
      newfold_dir_failing_flows: 'ask_turn_3',
      newfold_dir_license_window: 'ask_turn_2',
      newfold_dir_act_si_escalation: 'ask_turn_4',
      newfold_dir_send_manual: 'ask_turn_4',
      newfold_dir_benchmarks: 'ask_turn_2',
      newfold_dir_weekly_report: 'ask_turn_5',
      newfold_dir_report_pdf: 'ask_turn_4',
      newfold_dir_report_recommendation: 'ask_turn_4',
      newfold_dir_month_compare: 'ask_turn_2',
      newfold_dir_churn_detail: 'ask_turn_3',
      newfold_dir_save_rate_driver: 'ask_turn_2',
      newfold_dir_prioritize_week: 'ask_turn_5',
      newfold_dir_export_comparison: 'ask_turn_4',
      newfold_dir_budget_exposure: 'ask_turn_2',
      newfold_dir_cost_trend: 'ask_turn_2',
    },
    stats: [
      { id: 'agg_sl', label: 'Aggregate Service Level', value: '66%', trend: 'Below 80% target', positive: false, icon: Gauge, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me service levels across all brands' },
      { id: 'cost', label: 'Cost per Contact', value: '$9.40', trend: '+5.6% MoM', positive: false, icon: DollarSign, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me cost per contact trend' },
      { id: 'save_rate', label: 'Save Rate (7-day)', value: '41%', trend: '-5 pts, desk over capacity', positive: false, icon: ShieldCheck, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me the save-rate driver' },
      { id: 'churn', label: 'Gross Churn (MTD)', value: '2.9%', trend: '+0.5 pts, renewal cohort', positive: false, icon: TrendingDown, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'What is my churn and save exposure this week?' },
      { id: 'consolidation', label: 'Consolidation (Network Sol.)', value: '61%', trend: '11 days behind', positive: false, icon: Layers, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'What is my consolidation status?' },
      { id: 'ot', label: 'Q4 Overtime Spend', value: '$2.1M / $3.0M', trend: 'Trajectory: 135%', positive: false, icon: Briefcase, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'What is my overtime budget exposure?' },
      { id: 'contacts', label: 'Total Contacts Handled (MTD)', value: '981,400', trend: 'Service Cloud + legacy brands', positive: true, icon: PhoneCall, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Compare brand performance this week versus last week' },
      { id: 'csat', label: 'CSAT (30-day)', value: '3.7 / 5.0', trend: 'Softened on Network Sol. billing', positive: false, icon: Star, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: "Compare to last month's report" },
    ],
    signalToChip: {
      'SIG-NEWFOLD-DIR-001': 'Walk me through the service level issue',
      'SIG-NEWFOLD-DIR-002': 'Show me the consolidation risk',
      'SIG-NEWFOLD-DIR-003': 'What is my churn exposure?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    // The greeting shows only the message + the compact PRIORITY SIGNALS strip
    // above; the full signal detail appears when a priority tile is clicked.
    // Step 2 — brand roll-up + service-level divergence + the cascade diagram.
    if (k === 'newfold_dir_signal_1_service') {
      out.push(<BrandRollupTable key="rollup" />);
      out.push(<ServiceLevelByBrandChart key="slchart" />);
      out.push(<CascadeDiagram key="cascade2" />);
    }
    if (k === 'newfold_dir_cascade_impact') out.push(<CascadeDiagram key="cascade" />);
    // Step 3 — stabilization scenarios (recommend C).
    if (k === 'newfold_dir_turn_2_scenarios' || k === 'newfold_dir_fourth_scenario') out.push(<ScenarioTable key="scenarios" />);
    // Step 4 — consolidation / migration timeline.
    if (k === 'newfold_dir_consolidation_detail' || k === 'newfold_dir_signal_2_consolidation') out.push(<MigrationTimeline key="migration" />);
    // Step 5 — SI escalation: draft memo preview + flow-parity side-by-side.
    if (k === 'newfold_dir_act_si_escalation') out.push(<MemoPreview key="memo" />);
    if (k === 'newfold_dir_failing_flows' || k === 'newfold_dir_act_si_escalation') out.push(<FlowParityTable key="parity" />);
    // Step 6 — weekly leadership report.
    if (k === 'newfold_dir_weekly_report') out.push(<WeeklyReportCard key="weekly" />);
    // Step 7 — month-over-month comparison.
    if (k === 'newfold_dir_month_compare' || k === 'newfold_dir_export_comparison') out.push(<MonthComparisonTable key="mom" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
