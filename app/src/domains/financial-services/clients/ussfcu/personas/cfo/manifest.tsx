/**
 * Persona: Chief Financial Officer (Sylvia Reyes) — USSFCU-only. Enterprise
 * data-governance / audit story. Inline layout (visuals compose into the chat
 * thread, actions inline at the action turn), 8 KPIs via the paginated carousel.
 */

import { ClipboardList, GitCompareArrows, Scale, FileWarning, Clock, CalendarDays, Target, Database } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/ussfcu/cfo/signals.json';
import dataSources from '@/data/ussfcu/cfo/dataSources.json';
import capabilityCallouts from '@/data/ussfcu/cfo/capabilityCallouts.json';

import SignalCard from '@/components/cards/SignalCard';
import CapmKpiCarousel from '@/components/penfed/capmarkets/CapmKpiCarousel';
import ReconciliationWaterfall from '@/components/ussfcu/cfo/ReconciliationWaterfall';
import DataFlowLineageMap from '@/components/ussfcu/cfo/DataFlowLineageMap';
import AuditCompletionForecast from '@/components/ussfcu/cfo/AuditCompletionForecast';
import PortfolioDivergenceChart from '@/components/ussfcu/cfo/PortfolioDivergenceChart';
import EvidencePackagePreview from '@/components/ussfcu/cfo/EvidencePackagePreview';
import RemediationRoadmap from '@/components/ussfcu/cfo/RemediationRoadmap';

const flows = (getPersonaFlowConfigs('ussfcu') as unknown as Record<string, PersonaManifest['flows']>).ussfcu_cfo;

const manifest: PersonaManifest = {
  id: 'ussfcu_cfo',
  clientId: 'ussfcu',
  domainId: 'financial-services',

  identity: { name: 'Sylvia Reyes', initials: 'SR', role: 'Chief Financial Officer', greeting: 'Sylvia' },
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
  statsComponent: CapmKpiCarousel as unknown as PersonaManifest['statsComponent'],
  // Reframe the ops nav pages as the data-governance story.
  navLabels: { journey: 'Data Flow & Lineage', risk: 'Governance Signals' },

  ui: {
    greetingFlowKey: 'ussfcu_cfo_greeting',
    initialChips: [
      "Why doesn't my loan-loss number match Lending?",
      'Show me the data flow from the core to Tableau',
      'Which board figures have no lineage?',
      'Reconcile the portfolio balance to one governed number',
      'How long until the audit closes?',
      'How many hours are we spending on manual reconciliation?',
      'Generate the audit evidence package',
      'Draft the data-governance remediation plan',
    ],
    goldenPathChip: {
      ussfcu_cfo_greeting: 'Show me where the numbers break',
      ussfcu_cfo_turn_show_break: 'Show me the data flow that produced this',
      ussfcu_cfo_turn_data_flow: 'What would full lineage do for the audit?',
      ussfcu_cfo_turn_full_lineage: 'Show me the CFO and Lending parity gap',
      ussfcu_cfo_turn_parity_gap: 'Generate the audit evidence package',
      ussfcu_cfo_turn_evidence_package: 'Draft the data-governance remediation plan',
      ussfcu_cfo_turn_remediation_plan: 'Export for the leadership event',
    },
    flowKeyToCapabilityTrigger: {
      ussfcu_cfo_greeting: 'home_load',
      ussfcu_cfo_signal_1_loanloss: 'ask_turn_1',
      ussfcu_cfo_signal_2_parity: 'ask_turn_4',
      ussfcu_cfo_signal_3_lineage: 'ask_turn_2',
      ussfcu_cfo_turn_show_break: 'ask_turn_1',
      ussfcu_cfo_turn_data_flow: 'ask_turn_2',
      ussfcu_cfo_turn_full_lineage: 'ask_turn_3',
      ussfcu_cfo_turn_parity_gap: 'ask_turn_4',
      ussfcu_cfo_turn_evidence_package: 'ask_turn_5',
      ussfcu_cfo_turn_remediation_plan: 'ask_turn_3',
    },
    stats: [
      { id: 'audit_items', label: 'Audit Items Open', value: '38 of 64', trend: 'Audit / GRC System', positive: false, icon: ClipboardList, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'How long until the audit closes?' },
      { id: 'recon_breaks', label: 'Reconciliation Breaks', value: '19', trend: 'GL + Ledger, unresolved', positive: false, icon: GitCompareArrows, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me where the numbers break' },
      { id: 'parity', label: 'CFO-to-Lending Parity', value: '82%', trend: 'GL vs. Origination', positive: false, icon: Scale, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me the CFO and Lending parity gap' },
      { id: 'lineage_gap', label: 'Figures Lacking Lineage', value: '47', trend: 'Tableau dashboards', positive: false, icon: FileWarning, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Which board figures have no lineage?' },
      { id: 'recon_hours', label: 'Manual Recon Hours (MTD)', value: '164 hrs', trend: 'Finance time logs', positive: false, icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'How many hours are we spending on manual reconciliation?' },
      { id: 'close_cycle', label: 'Month-End Close Cycle', value: '9.5 days', trend: 'Finance Close Tracker', positive: false, icon: CalendarDays, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: null },
      { id: 'audit_days', label: 'Days to Audit Completion', value: '31 days', trend: 'Projected', positive: false, icon: Target, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'How long until the audit closes?' },
      { id: 'sources', label: 'Data Sources Connected', value: '6', trend: '1 partial (Tableau)', positive: true, icon: Database, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: null },
    ],
    signalToChip: {
      'SIG-USSFCU-CFO-001': 'Show me where the numbers break',
      'SIG-USSFCU-CFO-002': 'Show me the CFO and Lending parity gap',
      'SIG-USSFCU-CFO-003': 'Show me the data flow that produced this',
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

    if (k === 'ussfcu_cfo_signal_1_loanloss') { pushSignal('SIG-USSFCU-CFO-001', 'cfosig1'); out.push(<ReconciliationWaterfall key="cfo-recon-sig1" />); }
    if (k === 'ussfcu_cfo_signal_2_parity') { pushSignal('SIG-USSFCU-CFO-002', 'cfosig2'); out.push(<PortfolioDivergenceChart key="cfo-div-sig2" />); }
    if (k === 'ussfcu_cfo_signal_3_lineage') { pushSignal('SIG-USSFCU-CFO-003', 'cfosig3'); out.push(<DataFlowLineageMap key="cfo-lineage-sig3" />); }
    if (k === 'ussfcu_cfo_turn_show_break' || k === 'ussfcu_cfo_reconcile_now' || k === 'ussfcu_cfo_reconcile_parity') out.push(<ReconciliationWaterfall key={`cfo-recon-${k}`} />);
    if (k === 'ussfcu_cfo_turn_data_flow' || k === 'ussfcu_cfo_highest_risk_figures' || k === 'ussfcu_cfo_fix_worst_gap') out.push(<DataFlowLineageMap key={`cfo-lineage-${k}`} />);
    if (k === 'ussfcu_cfo_turn_full_lineage' || k === 'ussfcu_cfo_audit_timeline' || k === 'ussfcu_cfo_time_cost') out.push(<AuditCompletionForecast key={`cfo-forecast-${k}`} />);
    if (k === 'ussfcu_cfo_turn_parity_gap' || k === 'ussfcu_cfo_who_sees_what') out.push(<PortfolioDivergenceChart key={`cfo-div-${k}`} />);
    if (k === 'ussfcu_cfo_turn_evidence_package' || k === 'ussfcu_cfo_route_and_notify' || k === 'ussfcu_cfo_whats_open') out.push(<EvidencePackagePreview key={`cfo-evidence-${k}`} />);
    if (k === 'ussfcu_cfo_turn_remediation_plan' || k === 'ussfcu_cfo_export_leadership' || k === 'ussfcu_cfo_access_routing') out.push(<RemediationRoadmap key={`cfo-roadmap-${k}`} />);

    return out.length ? out : undefined;
  },
};

export default manifest;
