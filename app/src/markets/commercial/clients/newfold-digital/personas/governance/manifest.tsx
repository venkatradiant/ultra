/**
 * Persona: AI Governance Admin, LLMOps (Arjun Nair) — Newfold Digital.
 *
 * The CTO's assurance view and the only Gen-UI-wired surface. An ASSURANCE
 * JOURNEY (spec Tables 39–47): Arjun verifies customer data stayed in-environment,
 * confirms every frontier use was justified, reviews cost and reuse, then zooms
 * out across every AI agent and foundry in the enterprise.
 *
 * Reuses the eight NFCU platform-admin Gen-UI components as-is, each fed a Newfold
 * getter via prop (the components default to the NFCU getters, so NFCU is
 * untouched). Data lives in data/newfold-digital/governance/*.
 */
import { ShieldOff, ShieldCheck, Sparkles, Cpu, TrendingDown, Receipt, Layers } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/newfold-digital/governance/signals.json';
import dataSources from '@/data/newfold-digital/_shared/dataSources.json';
import capabilityCallouts from '@/data/newfold-digital/governance/capabilityCallouts.json';
import {
  getFieldLedger, getKagSubgraph, getCostReport, getGovernance,
  getGovernanceSummary, getBudgetGuardrail, getCacheReuse,
} from '@/data/newfold-digital/governance/governanceData';
import { getAgentRegistry } from '@/data/newfold-digital/governance/agentRegistryData';

import FieldSovereigntyLedger from '@/components/nfcu/platform-admin/FieldSovereigntyLedger';
import KagNodeView from '@/components/nfcu/platform-admin/KagNodeView';
import RoutingDiagram from '@/components/nfcu/platform-admin/RoutingDiagram';
import LlmCostUsageReport from '@/components/nfcu/platform-admin/LlmCostUsageReport';
import AgentObservabilityGovernanceDashboard from '@/components/nfcu/platform-admin/AgentObservabilityGovernanceDashboard';
import GovernanceSummaryCard from '@/components/nfcu/platform-admin/GovernanceSummaryCard';
import BudgetGuardrailPanel from '@/components/nfcu/platform-admin/BudgetGuardrailPanel';
import CacheReusePanel from '@/components/nfcu/platform-admin/CacheReusePanel';
import EnterpriseAgentInventory from '@/components/nfcu/platform-admin/EnterpriseAgentInventory';

const flows = (getPersonaFlowConfigs('newfold_digital') as unknown as Record<string, PersonaManifest['flows']>).newfold_governance;

const manifest: PersonaManifest = {
  id: 'newfold_governance',
  clientId: 'newfold_digital',
  marketId: 'commercial',

  identity: { name: 'Arjun Nair', initials: 'AN', role: 'AI Governance Admin, LLMOps', greeting: 'Arjun' },
  capabilities: ['Proactive Intelligence', 'Anomaly Detection', 'Automated Action', 'Friction Observability'],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',

  navLabels: {
    governance: 'Governance',
    agentObservability: 'Agent Observability',
    agentInventory: 'Agent Inventory',
  },
  features: {
    navSlots: ['ask', 'governance', 'agentObservability', 'agentInventory', 'dataSources'],
    staticCapabilityBadges: true,
  },

  ui: {
    greetingFlowKey: 'newfold_gov_greeting',
    initialChips: [
      'Show me where every field in this response went',
      'Did any PII or PCI reach the frontier model?',
      'Why was this field classified sensitive?',
      'Show me the routing logic as a diagram',
      'Which tasks used the frontier model, and why?',
      'Run the LLM cost report for this session',
      'How much did routing save versus all-frontier?',
      'Show me agent activity and frontier usage across the enterprise',
      'What happens when someone hits their budget cap?',
      'Show me where we reused an answer instead of calling a model',
      'Show me every AI agent and foundry in the enterprise',
    ],
    goldenPathChip: {
      newfold_gov_greeting: 'Review the renewal spike',
      newfold_gov_field_sovereignty: 'Why did the renewal price stay local?',
      newfold_gov_kag_provenance: 'Show me the routing logic',
      newfold_gov_routing_logic: 'Show me the budget guardrail',
      newfold_gov_budget_guardrail: 'Run the cost report',
      newfold_gov_cost_usage: 'Show me where we reused an answer instead of calling a model',
      newfold_gov_cache_reuse: 'Show me agent activity and frontier usage across the enterprise',
      newfold_gov_observability: 'Show the enterprise agent inventory',
      newfold_gov_agent_inventory: 'Show anything not yet under governance',
    },
    flowKeyToCapabilityTrigger: {
      newfold_gov_greeting: 'step_briefing',
      newfold_gov_field_sovereignty: 'step_field_sovereignty',
      newfold_gov_frontier_task: 'step_field_sovereignty',
      newfold_gov_all_sensitive: 'step_field_sovereignty',
      newfold_gov_kag_provenance: 'step_kag',
      newfold_gov_graph_catch: 'step_kag',
      newfold_gov_routing_logic: 'step_routing',
      newfold_gov_budget_guardrail: 'step_routing',
      newfold_gov_near_budget: 'step_routing',
      newfold_gov_cost_usage: 'step_cost',
      newfold_gov_highest_cost: 'step_cost',
      newfold_gov_by_initiative: 'step_cost',
      newfold_gov_cache_reuse: 'step_cost',
      newfold_gov_cache_hit_rate: 'step_cost',
      newfold_gov_care_spend: 'step_cost',
      newfold_gov_observability: 'step_observability',
      newfold_gov_expand_action: 'step_observability',
      newfold_gov_compare_initiatives: 'step_observability',
      newfold_gov_agent_inventory: 'step_observability',
      newfold_gov_by_foundry: 'step_observability',
      newfold_gov_ungoverned: 'step_observability',
      newfold_gov_onboard_agent: 'step_observability',
      newfold_gov_summary: 'step_observability',
    },
    stats: [
      { id: 'pii_frontier', label: 'PII or PCI Sent to Frontier Model', value: '0', trend: 'Routing log + KAG', positive: true, icon: ShieldOff, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'Did any PII or PCI reach the frontier model?' },
      { id: 'sensitive_local', label: 'Sensitive Fields Kept In-Environment', value: '100%', trend: 'Routing log', positive: true, icon: ShieldCheck, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'Show me where every field in this response went' },
      { id: 'frontier_share', label: 'Frontier Task Share (today)', value: '12%', trend: 'LLM usage log', positive: true, icon: Sparkles, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'Show me agent activity and frontier usage across the enterprise' },
      { id: 'token_split', label: 'SLM / Frontier Token Split', value: '88% / 12%', trend: 'LiteLLM gateway', positive: true, icon: Cpu, iconColor: 'text-brand', iconBg: 'bg-brand/10', chipText: 'Show me the routing logic as a diagram' },
      { id: 'spend_vs_all', label: 'Frontier Spend vs All-Frontier', value: '-71%', trend: 'Cost and usage report', positive: true, icon: TrendingDown, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'Run the LLM cost report for this session' },
      { id: 'cost_query', label: 'Average Cost per Query', value: '$0.11', trend: 'LiteLLM cost records', positive: true, icon: Receipt, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Run the LLM cost report for this session' },
      { id: 'models', label: 'Models in Production', value: '2', trend: 'In-environment SLM + Claude Sonnet', positive: true, icon: Layers, iconColor: 'text-text-muted', iconBg: 'bg-surface-2', chipText: null },
    ],
    signalToChip: {
      'SIG-NEWFOLD-GOV-001': 'Review the renewal spike',
      'SIG-NEWFOLD-GOV-002': 'Show me care AI spend',
      'SIG-NEWFOLD-GOV-003': 'What did the graph catch?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    // Greeting shows the message + the compact governance briefing strip only;
    // the full item detail appears when a briefing tile is clicked.
    if (k === 'newfold_gov_field_sovereignty') {
      out.push(<FieldSovereigntyLedger key="ledger" getter={getFieldLedger} subtitle="Sofia's renewal spike response · every field resolved in-environment" />);
    }
    if (k === 'newfold_gov_kag_provenance' || k === 'newfold_gov_graph_catch') {
      out.push(<KagNodeView key="kag" getter={getKagSubgraph} internalLabel="Customer-specific" />);
    }
    if (k === 'newfold_gov_routing_logic') {
      out.push(<RoutingDiagram key="routing" downloadName="newfold-routing-logic.svg" />);
    }
    if (k === 'newfold_gov_cost_usage' || k === 'newfold_gov_highest_cost') {
      out.push(<LlmCostUsageReport key="cost" getter={getCostReport} heading="LLM Cost and Usage — Sofia's session" />);
    }
    if (k === 'newfold_gov_observability' || k === 'newfold_gov_expand_action') {
      out.push(<AgentObservabilityGovernanceDashboard key="obs" getter={getGovernance} />);
    }
    if (k === 'newfold_gov_budget_guardrail' || k === 'newfold_gov_near_budget') {
      out.push(<BudgetGuardrailPanel key="budget" getter={getBudgetGuardrail} />);
    }
    if (k === 'newfold_gov_cache_reuse' || k === 'newfold_gov_cache_hit_rate') {
      out.push(<CacheReusePanel key="cache" getter={getCacheReuse} />);
    }
    if (k === 'newfold_gov_agent_inventory' || k === 'newfold_gov_by_foundry'
        || k === 'newfold_gov_ungoverned' || k === 'newfold_gov_onboard_agent') {
      {/* getter cast: the Newfold Foundry union ('Bluehost agent runtime', 'Vertex')
          is nominally distinct from NFCU's; the JS component renders foundry as a
          plain string, so the shapes are structurally identical at runtime. */}
      out.push(<EnterpriseAgentInventory key="inventory" getter={getAgentRegistry as never} />);
    }
    if (k === 'newfold_gov_summary') out.push(<GovernanceSummaryCard key="gov-summary" getter={getGovernanceSummary} />);
    return out.length ? out : undefined;
  },
};

export default manifest;
