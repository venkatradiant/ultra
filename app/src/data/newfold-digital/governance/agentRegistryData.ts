/**
 * Newfold Digital — Enterprise Agent Inventory / Governance Registry (turn 9 +
 * the Agent Inventory page). Mirrors the NFCU agentRegistryData shapes.
 *
 * The point of the screen (spec Table 47): teams run AI on several foundries —
 * Copilot Studio, Azure AI Foundry, Anthropic, OpenAI, the Bluehost agent runtime,
 * and Vertex — and every one routes through the SAME governance layer, except the
 * three shadow agents not yet onboarded (spec-fixed at 3).
 *
 * Invariants match NFCU: exactly 3 ungoverned rows; the six agents in
 * GOVERNANCE.agents appear here as governed rows; ungoverned rows report
 * piiSafe/withinBudget as null (unknown, not false); N and the pivots are derived.
 */

export type Foundry =
  | 'Copilot Studio'
  | 'Azure AI Foundry'
  | 'Anthropic'
  | 'OpenAI'
  | 'Bluehost agent runtime'
  | 'Vertex';

export interface AgentRow {
  agent: string;
  lob: string;
  foundry: Foundry;
  models: string;
  governed: boolean;
  piiSafe: boolean | null;
  withinBudget: boolean | null;
  policyVersion: string;
  health: 'Healthy' | 'Watch' | 'Unknown';
  lastActive: string;
  initiative?: string;
}

const AGENTS: AgentRow[] = [
  // ─── Customer Care — Copilot Studio / Azure AI Foundry ───
  { agent: 'Renewals & Billing Assist', lob: 'Billing & Renewals', foundry: 'Copilot Studio', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '2 min ago', initiative: 'Customer Care' },
  { agent: 'Hosting Support Assist', lob: 'Hosting Support', foundry: 'Azure AI Foundry', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '4 min ago', initiative: 'Customer Care' },
  { agent: 'Save Desk Assist', lob: 'Retention', foundry: 'Copilot Studio', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Watch', lastActive: '1 min ago', initiative: 'Customer Care' },
  { agent: 'Quality & Compliance Assist', lob: 'Quality Assurance', foundry: 'Copilot Studio', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '3 min ago' },
  { agent: 'Workforce Forecast Assist', lob: 'Workforce Management', foundry: 'Azure AI Foundry', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '6 min ago' },

  // ─── Bluehost Customer AI — Bluehost agent runtime + Anthropic ───
  { agent: 'Bluehost Account Assistant', lob: 'Bluehost Digital', foundry: 'Bluehost agent runtime', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '1 min ago', initiative: 'Bluehost Customer AI' },
  { agent: 'Site-Down Self-Service', lob: 'Bluehost Digital', foundry: 'Anthropic', models: 'Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '1 min ago', initiative: 'Bluehost Customer AI' },
  { agent: 'Domain Transfer Assistant', lob: 'Domains', foundry: 'Bluehost agent runtime', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '12 min ago' },

  // ─── Engineering Copilots — Vertex ───
  { agent: 'Platform Engineering Copilot', lob: 'Engineering', foundry: 'Vertex', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '6 min ago', initiative: 'Engineering Copilots' },

  // ─── Everything else already onboarded ───
  { agent: 'WHOIS Privacy Assistant', lob: 'Compliance', foundry: 'Azure AI Foundry', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '22 min ago' },
  { agent: 'Chargeback Review Assist', lob: 'Payments', foundry: 'OpenAI', models: 'GPT-4o', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '9 min ago' },
  { agent: 'Migration Runbook Bot', lob: 'Consolidation PMO', foundry: 'Copilot Studio', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.06', health: 'Healthy', lastActive: '35 min ago' },
  { agent: 'HR Policy Assistant', lob: 'Human Resources', foundry: 'Copilot Studio', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.06', health: 'Healthy', lastActive: '1 h ago' },
  { agent: 'IT Incident Triage Bot', lob: 'Technology', foundry: 'Vertex', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.06', health: 'Healthy', lastActive: '14 min ago' },

  // ─── The three shadow agents — spec: "Three agents are not yet onboarded" ───
  { agent: 'Marketing Copy Generator', lob: 'Marketing', foundry: 'OpenAI', models: 'GPT-4o', governed: false, piiSafe: null, withinBudget: null, policyVersion: '—', health: 'Unknown', lastActive: '27 min ago' },
  { agent: 'Contract Summarizer (pilot)', lob: 'Legal', foundry: 'Anthropic', models: 'Claude Sonnet', governed: false, piiSafe: null, withinBudget: null, policyVersion: '—', health: 'Unknown', lastActive: '2 h ago' },
  { agent: 'Sandbox Research Agent', lob: 'Data Science', foundry: 'Vertex', models: 'Mixed / unpinned', governed: false, piiSafe: null, withinBudget: null, policyVersion: '—', health: 'Unknown', lastActive: '4 h ago' },
];

export const FOUNDRY_ORDER: Foundry[] = [
  'Copilot Studio', 'Azure AI Foundry', 'Anthropic', 'OpenAI', 'Bluehost agent runtime', 'Vertex',
];

export async function getAgentRegistry() {
  const governed = AGENTS.filter((a) => a.governed).length;
  const ungoverned = AGENTS.length - governed;
  return {
    rows: AGENTS,
    total: AGENTS.length,
    governed,
    ungoverned,
    foundries: FOUNDRY_ORDER.filter((f) => AGENTS.some((a) => a.foundry === f)).length,
  };
}

export async function getRegistryByFoundry() {
  return FOUNDRY_ORDER
    .map((foundry) => {
      const rows = AGENTS.filter((a) => a.foundry === foundry);
      return { foundry, rows, total: rows.length, ungoverned: rows.filter((a) => !a.governed).length };
    })
    .filter((g) => g.total > 0);
}

export async function getUngovernedAgents() {
  return AGENTS.filter((a) => !a.governed);
}
