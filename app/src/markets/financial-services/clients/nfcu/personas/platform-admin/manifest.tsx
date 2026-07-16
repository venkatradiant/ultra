/**
 * Persona: Platform Administrator, AI Governance & LLMOps (Daniel Okonkwo) — NFCU.
 *
 * The governance persona and the only Gen-UI-wired surface for this build. Per
 * NFCU_CCaaS_Prototype_Spec.docx this is an ASSURANCE JOURNEY, not a leak hunt:
 * Daniel verifies member data stayed in-environment, confirms every frontier use
 * was justified, and reviews cost. Two gates govern routing — safe to send (PII
 * stays in the SLM) and worth sending (only a task that needs the frontier gets
 * it). Fields never route to the frontier; tasks do.
 *
 * Turns 2–6 render the five Gen UI components, all fed by the governanceData
 * layer (static now, live API later — swapping a getter is the only change).
 */

import { ShieldOff, ShieldCheck, Sparkles, Cpu, TrendingDown, Receipt, Layers } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/nfcu/platform-admin/signals.json';
import dataSources from '@/data/nfcu/platform-admin/dataSources.json';
import capabilityCallouts from '@/data/nfcu/platform-admin/capabilityCallouts.json';

import PlatformAdminKpiCarousel from '@/components/nfcu/platform-admin/PlatformAdminKpiCarousel';
import FieldSovereigntyLedger from '@/components/nfcu/platform-admin/FieldSovereigntyLedger';
import KagNodeView from '@/components/nfcu/platform-admin/KagNodeView';
import RoutingDiagram from '@/components/nfcu/platform-admin/RoutingDiagram';
import LlmCostUsageReport from '@/components/nfcu/platform-admin/LlmCostUsageReport';
import AgentObservabilityGovernanceDashboard from '@/components/nfcu/platform-admin/AgentObservabilityGovernanceDashboard';
import GovernanceSummaryCard from '@/components/nfcu/platform-admin/GovernanceSummaryCard';

const flows = (getPersonaFlowConfigs('nfcu') as unknown as Record<string, PersonaManifest['flows']>).nfcu_platform_admin;

const manifest: PersonaManifest = {
  id: 'nfcu_platform_admin',
  clientId: 'nfcu',
  marketId: 'financial-services',

  identity: { name: 'Daniel Okonkwo', initials: 'DO', role: 'Platform Administrator, AI Governance & LLMOps', greeting: 'Daniel' },
  capabilities: [
    'Proactive Intelligence',
    'Anomaly Detection',
    'Automated Action',
    'Friction Observability',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',

  // 'Governance' rather than 'Governance & Observability': Agent Observability is
  // now its own page, and two sidebar entries both claiming observability is a
  // coin-flip for a presenter mid-demo.
  navLabels: { governance: 'Governance', agentObservability: 'Agent Observability' },
  features: {
    navSlots: ['ask', 'governance', 'agentObservability', 'dataSources'],
    staticCapabilityBadges: true,
  },

  // 7 governance KPIs shown 4-up in a paginated carousel.
  statsComponent: PlatformAdminKpiCarousel as unknown as PersonaManifest['statsComponent'],

  ui: {
    greetingFlowKey: 'nfcu_pa_greeting',
    initialChips: [
      'Review the auto loan spike',
      'Did any PII reach the frontier model?',
      'Show me the routing logic as a diagram',
      'Run the LLM cost report for this session',
      'Show me agent activity across the contact center',
    ],
    // The golden path walks the spec's six turns in order.
    goldenPathChip: {
      nfcu_pa_greeting: 'Review the auto loan spike',
      nfcu_pa_field_sovereignty: 'Why did the auto loan rate stay local?',
      nfcu_pa_kag_provenance: 'Show me the routing logic',
      nfcu_pa_routing_logic: 'Run the cost report',
      nfcu_pa_cost_usage: 'Show frontier usage this month',
      nfcu_pa_observability: 'Generate a governance summary',
    },
    flowKeyToCapabilityTrigger: {
      nfcu_pa_greeting: 'step_briefing',
      nfcu_pa_field_sovereignty: 'step_field_sovereignty',
      nfcu_pa_pii_check: 'step_field_sovereignty',
      nfcu_pa_kag_provenance: 'step_kag',
      nfcu_pa_routing_logic: 'step_routing',
      nfcu_pa_cost_usage: 'step_cost',
      nfcu_pa_frontier_task: 'step_cost',
      nfcu_pa_spend_on_track: 'step_cost',
      nfcu_pa_savings: 'step_cost',
      nfcu_pa_highest_cost: 'step_cost',
      nfcu_pa_by_persona: 'step_cost',
      nfcu_pa_observability: 'step_observability',
      nfcu_pa_expand_action: 'step_observability',
      nfcu_pa_spend_trend: 'step_observability',
      nfcu_pa_gov_summary: 'step_observability',
    },
    // Dashboard KPIs — spec: Daniel Okonkwo.
    stats: [
      { id: 'pii_frontier', label: 'PII Sent to Frontier Model', value: '0', trend: 'Routing log + KAG', positive: true, icon: ShieldOff, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'Did any PII reach the frontier model?' },
      { id: 'sensitive_local', label: 'Sensitive Fields Kept In-Environment', value: '100%', trend: 'Routing log', positive: true, icon: ShieldCheck, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'Show me where every field in this response went' },
      { id: 'frontier_share', label: 'Frontier Task Share (today)', value: '12%', trend: 'LLM usage log', positive: true, icon: Sparkles, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'Which tasks used the frontier model, and why?' },
      { id: 'token_split', label: 'SLM / Frontier Token Split', value: '88% / 12%', trend: 'LiteLLM gateway', positive: true, icon: Cpu, iconColor: 'text-brand', iconBg: 'bg-brand/10', chipText: 'Show me the routing logic as a diagram' },
      { id: 'spend_vs_all', label: 'Frontier Spend vs All-Frontier', value: '-71%', trend: 'Cost and usage report', positive: true, icon: TrendingDown, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'How much did routing save versus all-frontier?' },
      { id: 'cost_query', label: 'Average Cost per Query', value: '$0.11', trend: 'LiteLLM cost records', positive: true, icon: Receipt, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Run the LLM cost report for this session' },
      { id: 'models', label: 'Models in Production', value: '2', trend: 'In-environment SLM + Claude Sonnet', positive: true, icon: Layers, iconColor: 'text-text-muted', iconBg: 'bg-surface-2', chipText: null },
    ],
    signalToChip: {
      'SIG-NFCU-PA-001': 'Review the auto loan spike',
      'SIG-NFCU-PA-002': 'Show me contact center spend',
      'SIG-NFCU-PA-003': 'What did the graph catch?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  // Turns 2–6 → the five Gen UI components. Each reads its own data-layer getter,
  // so swapping a getter to the live API needs no change here.
  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    if (k === 'nfcu_pa_field_sovereignty') out.push(<FieldSovereigntyLedger key="ledger" />);
    if (k === 'nfcu_pa_kag_provenance') out.push(<KagNodeView key="kag" />);
    if (k === 'nfcu_pa_routing_logic') out.push(<RoutingDiagram key="routing" />);
    if (k === 'nfcu_pa_cost_usage' || k === 'nfcu_pa_highest_cost') out.push(<LlmCostUsageReport key="cost" />);
    if (k === 'nfcu_pa_observability' || k === 'nfcu_pa_expand_action' || k === 'nfcu_pa_spend_trend') {
      out.push(<AgentObservabilityGovernanceDashboard key="obs" />);
    }
    // The closing summary: four numbers and an open item, not a wall of prose.
    if (k === 'nfcu_pa_gov_summary') out.push(<GovernanceSummaryCard key="gov-summary" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
