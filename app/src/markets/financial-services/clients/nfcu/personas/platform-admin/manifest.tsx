/**
 * Persona: Platform Administrator, AI Governance & LLMOps (Daniel Okonkwo) — NFCU.
 * The governance persona and the only Gen-UI-wired surface for this build. Tells
 * the three-demo story — sovereignty-aware routing, KAG sensitivity & provenance,
 * and tokenomics — with agent observability as the connective tissue. Every turn
 * renders a governance artifact inline. Scripted/synthetic data only.
 */

import { ShieldCheck, Lock, Cpu, Zap, Receipt, FileCheck, Layers } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/nfcu/platform-admin/signals.json';
import dataSources from '@/data/nfcu/platform-admin/dataSources.json';
import capabilityCallouts from '@/data/nfcu/platform-admin/capabilityCallouts.json';
import governance from '@/data/nfcu/platform-admin/governance.json';

import PlatformAdminKpiCarousel from '@/components/nfcu/platform-admin/PlatformAdminKpiCarousel';
import ModelRoutingProvenanceTrace from '@/components/nfcu/platform-admin/ModelRoutingProvenanceTrace';
import KagNodeView from '@/components/nfcu/platform-admin/KagNodeView';
import RoutingLogicDiagram from '@/components/nfcu/platform-admin/RoutingLogicDiagram';
import CostCard from '@/components/nfcu/platform-admin/CostCard';
import TokenomicsDashboard from '@/components/nfcu/platform-admin/TokenomicsDashboard';
import AgentObservabilityPanel from '@/components/nfcu/platform-admin/AgentObservabilityPanel';
import SensitiveFieldRegistry from '@/components/nfcu/platform-admin/SensitiveFieldRegistry';
import SystemMetricChart from '@/components/nfcu/platform-admin/SystemMetricChart';

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

  navLabels: { governance: 'Governance & Observability' },
  features: { navSlots: ['ask', 'governance', 'dataSources'], staticCapabilityBadges: true },

  // 7 governance KPIs shown 4-up in a paginated carousel (see statsComponent).
  statsComponent: PlatformAdminKpiCarousel as unknown as PersonaManifest['statsComponent'],

  ui: {
    greetingFlowKey: 'nfcu_pa_greeting',
    initialChips: [
      'Investigate the PII exception',
      'Did any PII reach a public LLM today?',
      "Show me this month's token spend by persona",
      "What policy drove this agent's action?",
      'Show me system health for the admin portal',
    ],
    goldenPathChip: {
      nfcu_pa_greeting: 'Investigate the PII exception',
      nfcu_pa_routing_provenance: 'Why was the SSN classified sensitive?',
      nfcu_pa_kag_sensitivity: 'Show me the routing logic',
      nfcu_pa_routing_logic: 'What did this response cost?',
      nfcu_pa_cost_query: "Show Marcus's cost for last month",
      nfcu_pa_cost_person: 'Which action is missing a citation?',
      nfcu_pa_observability: 'Show me system health for the admin portal',
    },
    flowKeyToCapabilityTrigger: {
      nfcu_pa_greeting: 'gov_observability',
      nfcu_pa_routing_provenance: 'gov_routing',
      nfcu_pa_pii_check: 'gov_routing',
      nfcu_pa_routing_correct: 'gov_routing',
      nfcu_pa_cost_gate_detail: 'gov_routing',
      nfcu_pa_kag_sensitivity: 'gov_kag',
      nfcu_pa_sensitive_registry: 'gov_kag',
      nfcu_pa_routing_logic: 'gov_routing',
      nfcu_pa_cost_query: 'gov_tokenomics',
      nfcu_pa_cost_person: 'gov_tokenomics',
      nfcu_pa_cost_anomaly: 'gov_tokenomics',
      nfcu_pa_llm_only_compare: 'gov_tokenomics',
      nfcu_pa_highest_cost: 'gov_tokenomics',
      nfcu_pa_observability: 'gov_observability',
      nfcu_pa_system_health: 'gov_observability',
      nfcu_pa_gov_summary: 'gov_observability',
    },
    stats: [
      { id: 'slm_routed', label: 'Sensitive Data Routed to SLM', value: '100%', trend: 'Routing log + KAG', positive: true, icon: ShieldCheck, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'Show me the routing logic as a diagram' },
      { id: 'pii_leaks', label: 'PII Leakage Events to LLM', value: '0', trend: 'Sovereignty guard', positive: true, icon: Lock, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'Did any PII reach a public LLM today?' },
      { id: 'token_split', label: 'SLM / LLM Token Split', value: '78% / 22%', trend: 'LiteLLM gateway', positive: true, icon: Cpu, iconColor: 'text-brand', iconBg: 'bg-brand/10', chipText: 'What did this conversation cost, SLM vs LLM?' },
      { id: 'cache', label: 'Semantic Cache Hit Rate', value: '63%', trend: '↓ after prompt change', positive: false, icon: Zap, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me the cost anomaly' },
      { id: 'cost_q', label: 'Avg Cost per Query', value: '$0.11', trend: 'LiteLLM cost records', positive: true, icon: Receipt, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: "Show me this month's token spend by persona" },
      { id: 'citation', label: 'Agent Actions w/ Policy Citation', value: '96%', trend: '1 render gap flagged', positive: false, icon: FileCheck, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: "What policy drove this agent's action?" },
      { id: 'models', label: 'Models in Production', value: '2', trend: 'SLM + Claude Sonnet', positive: true, icon: Layers, iconColor: 'text-text-muted', iconBg: 'bg-surface-2', chipText: null },
    ],
    signalToChip: {
      'SIG-NFCU-PA-001': 'Investigate the PII exception',
      'SIG-NFCU-PA-002': 'Show me the cost anomaly',
      'SIG-NFCU-PA-003': 'Which action is missing a citation?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    if (k === 'nfcu_pa_routing_provenance') out.push(<ModelRoutingProvenanceTrace key="prov" data={governance.routingTrace} />);
    if (k === 'nfcu_pa_kag_sensitivity') out.push(<KagNodeView key="kag" data={governance.kagGraph} />);
    if (k === 'nfcu_pa_routing_logic') out.push(<RoutingLogicDiagram key="flow" data={governance.routingFlow} />);
    if (k === 'nfcu_pa_cost_query' || k === 'nfcu_pa_llm_only_compare') out.push(<CostCard key="cost" data={governance.costQuery} />);
    if (k === 'nfcu_pa_cost_person' || k === 'nfcu_pa_highest_cost') out.push(<TokenomicsDashboard key="tok" data={governance.tokenomics} />);
    if (k === 'nfcu_pa_observability') out.push(<AgentObservabilityPanel key="obs" data={governance.observability} />);
    if (k === 'nfcu_pa_sensitive_registry') out.push(<SensitiveFieldRegistry key="reg" data={governance.sensitiveFields} />);
    if (k === 'nfcu_pa_system_health') out.push(<SystemMetricChart key="sys" data={governance.systemMetric} />);
    return out.length ? out : undefined;
  },
};

export default manifest;
