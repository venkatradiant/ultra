/**
 * Enterprise Agent Inventory / Governance Registry — turn 9 + the Agent
 * Inventory page. CR-08 / spec v2 Step 9.
 *
 * GROUND RULE: static now, live API later. Swap the getter body to a `fetch`;
 * the components never change. Same seam as governanceData.ts.
 *
 * WHY THIS SCREEN EXISTS — Parijat (NFCU), in his own words: "the more important
 * question for NFCU is not whether we can build more AI agents, it is whether we
 * can scale AI across the enterprise without creating another generation of
 * fragmented, independently governed solutions." Every other turn *asserts* one
 * governance model. This one makes it literal: every agent, every foundry, one
 * layer — and the three that aren't under it yet.
 *
 * ⚠ INVARIANTS
 *  - `governed: false` on EXACTLY 3 rows. Spec v2 Step 9 states "Three agents
 *    are not yet onboarded to governance" as a fact; the count is spec-owned.
 *  - The six agents in GOVERNANCE.agents (governanceData.ts) must all appear
 *    here as governed rows — turn 8 reports their health, turn 9 lists them.
 *  - `N` and the two pivots (by foundry, not-yet-governed) are DERIVED from the
 *    rows in the getters below, never authored, so they cannot drift.
 *  - Ungoverned rows report piiSafe/withinBudget as `null`, not `false`. That is
 *    the point: outside the governance layer these are *unknown*, and claiming
 *    otherwise would be the exact fiction the screen exists to expose.
 */

export type Foundry =
  | 'Copilot Studio'
  | 'Azure AI Foundry'
  | 'Anthropic'
  | 'OpenAI'
  | 'Backbase AI'
  | 'Cloud core';

export interface AgentRow {
  agent: string;
  /** Owning line of business. */
  lob: string;
  foundry: Foundry;
  models: string;
  governed: boolean;
  /** null = not under governance, therefore unknown — never assume false. */
  piiSafe: boolean | null;
  withinBudget: boolean | null;
  /** '—' for ungoverned rows: no policy is applied. */
  policyVersion: string;
  health: 'Healthy' | 'Watch' | 'Unknown';
  lastActive: string;
  /** Initiative, matching GOVERNANCE.agents where the agent appears there. */
  initiative?: string;
}

const AGENTS: AgentRow[] = [
  // ─── Contact Center — Copilot Studio / Azure AI Foundry (spec v2 Step 9) ───
  { agent: 'Auto Loan Assist', lob: 'Lending', foundry: 'Copilot Studio', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '2 min ago', initiative: 'Contact Center' },
  { agent: 'Mortgage Servicing', lob: 'Lending', foundry: 'Azure AI Foundry', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '4 min ago', initiative: 'Contact Center' },
  { agent: 'Card Disputes', lob: 'Cards', foundry: 'Copilot Studio', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Watch', lastActive: '1 min ago', initiative: 'Contact Center' },
  { agent: 'Member Servicing Assist', lob: 'Member Services', foundry: 'Copilot Studio', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '1 min ago' },
  { agent: 'Fraud Triage Assist', lob: 'Risk & Fraud', foundry: 'Azure AI Foundry', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '3 min ago' },

  // ─── Collections — Copilot Studio ─────────────────────────────────────────
  { agent: 'Collections Assist', lob: 'Collections', foundry: 'Copilot Studio', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '8 min ago', initiative: 'Collections' },

  // ─── Member-facing — Anthropic ────────────────────────────────────────────
  { agent: 'Member Assistant', lob: 'Digital Channels', foundry: 'Anthropic', models: 'Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '1 min ago', initiative: 'Member Assistant' },
  { agent: 'Statement Explainer', lob: 'Digital Channels', foundry: 'Anthropic', models: 'Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '12 min ago' },

  // ─── Core banking pilot — Backbase AI ─────────────────────────────────────
  { agent: 'Core Banking Copilot', lob: 'Core Banking', foundry: 'Backbase AI', models: 'SLM + Claude Sonnet', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '6 min ago', initiative: 'Core Banking' },

  // ─── Everything else already onboarded ────────────────────────────────────
  { agent: 'KYC Document Reader', lob: 'Compliance', foundry: 'Azure AI Foundry', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '22 min ago' },
  { agent: 'Wire Review Assist', lob: 'Payments', foundry: 'OpenAI', models: 'GPT-4o', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.07', health: 'Healthy', lastActive: '9 min ago' },
  { agent: 'Branch Scheduling Bot', lob: 'Branch Operations', foundry: 'Cloud core', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.06', health: 'Healthy', lastActive: '35 min ago' },
  { agent: 'HR Policy Assistant', lob: 'Human Resources', foundry: 'Copilot Studio', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.06', health: 'Healthy', lastActive: '1 h ago' },
  { agent: 'IT Service Desk Bot', lob: 'Technology', foundry: 'Cloud core', models: 'SLM', governed: true, piiSafe: true, withinBudget: true, policyVersion: 'DG-2026.06', health: 'Healthy', lastActive: '14 min ago' },

  // ─── The three shadow agents — spec v2: "Three agents are not yet onboarded"
  // piiSafe / withinBudget are null, not false: nobody can answer the question
  // for an agent that isn't routed through the layer. That's the finding.
  { agent: 'Marketing Copy Generator', lob: 'Marketing', foundry: 'OpenAI', models: 'GPT-4o', governed: false, piiSafe: null, withinBudget: null, policyVersion: '—', health: 'Unknown', lastActive: '27 min ago' },
  { agent: 'Contract Summarizer (pilot)', lob: 'Legal', foundry: 'Anthropic', models: 'Claude Sonnet', governed: false, piiSafe: null, withinBudget: null, policyVersion: '—', health: 'Unknown', lastActive: '2 h ago' },
  { agent: 'Sandbox Research Agent', lob: 'Data Science', foundry: 'Cloud core', models: 'Mixed / unpinned', governed: false, piiSafe: null, withinBudget: null, policyVersion: '—', health: 'Unknown', lastActive: '4 h ago' },
];

/** Foundry display order — spec v2 Step 9 lists these. */
export const FOUNDRY_ORDER: Foundry[] = [
  'Copilot Studio', 'Azure AI Foundry', 'Anthropic', 'OpenAI', 'Backbase AI', 'Cloud core',
];

// ─── Data access ────────────────────────────────────────────────────────────
// Swap the bodies below to API calls when ready. Components stay untouched.

export async function getAgentRegistry() {
  const governed = AGENTS.filter((a) => a.governed).length;
  const ungoverned = AGENTS.length - governed;
  return {
    rows: AGENTS,
    // All DERIVED from rows — `N` in the scripted response reads from `total`,
    // so the prose and the table can never disagree.
    total: AGENTS.length,
    governed,
    ungoverned,
    foundries: FOUNDRY_ORDER.filter((f) => AGENTS.some((a) => a.foundry === f)).length,
  };
}

/** Pivot: group by foundry — proves multi-platform coverage at a glance. */
export async function getRegistryByFoundry() {
  return FOUNDRY_ORDER
    .map((foundry) => {
      const rows = AGENTS.filter((a) => a.foundry === foundry);
      return {
        foundry,
        rows,
        total: rows.length,
        ungoverned: rows.filter((a) => !a.governed).length,
      };
    })
    .filter((g) => g.total > 0);
}

/** Pivot: the shadow agents. Spec-fixed at 3 — a test asserts it. */
export async function getUngovernedAgents() {
  return AGENTS.filter((a) => !a.governed);
}
