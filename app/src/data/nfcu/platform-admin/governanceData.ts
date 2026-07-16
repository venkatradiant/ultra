/**
 * Platform Admin (Daniel Okonkwo) governance data layer.
 *
 * GROUND RULE: static data now, live API later. Every component reads through a
 * getter below. Swapping a getter body to a `fetch` is the ONLY change when the
 * backend is ready — the components never change.
 *
 * Source of truth: NFCU_CCaaS_Prototype_Spec.docx (Daniel Okonkwo). The build
 * companion (Ultra_PlatformAdmin_GenUI_Components.md) supplies these fixtures.
 * Where they disagree, the spec wins.
 *
 * The routing model (per NFCU_Demo_Routing_Logic_Note.docx) — two gates:
 *   Gate 1 "safe to send":  any field carrying PII stays in the SLM. Hard constraint.
 *   Gate 2 "worth sending": SLM is the default; a TASK escalates to the frontier
 *                           model only when it needs reasoning/generation the SLM
 *                           cannot do reliably. "Public" is eligibility, not a trigger.
 * => Fields never route to the frontier. TASKS do. Every field row reads SLM.
 */

export interface FieldLedgerRow {
  field: string;
  sensitivity: 'PII' | 'Sensitive-Internal' | 'Public';
  model: 'SLM';
  reason: string;
}

export interface CostRow {
  task: string;
  complexity: string;
  model: 'SLM' | 'Frontier';
  piiToFrontier: number;
  cost: number;
  /** Why this task justified the frontier model (frontier rows only). */
  justification?: string;
}

/** Turn 2 — Field Sovereignty Ledger. Every field on the SLM; frontier runs one task. */
export const FIELD_LEDGER = {
  badge: '0 PII to frontier',
  fields: [
    { field: 'Member SSN', sensitivity: 'PII', model: 'SLM', reason: 'PII (DG-07) — kept in-environment' },
    { field: 'Account Number', sensitivity: 'PII', model: 'SLM', reason: 'Financial account data (DG-07) — kept in-environment' },
    { field: 'Account Balance', sensitivity: 'PII', model: 'SLM', reason: 'Member financial data (DG-07) — kept in-environment' },
    { field: 'Member Name', sensitivity: 'PII', model: 'SLM', reason: 'Personally identifiable (DG-02) — kept in-environment' },
    { field: 'Current Auto Loan Rate', sensitivity: 'Sensitive-Internal', model: 'SLM', reason: 'Member-specific financial term (DG-04) — kept in-environment' },
    { field: 'Promotional Rate (2.9%)', sensitivity: 'Public', model: 'SLM', reason: 'Public, SLM sufficient — no frontier task needed' },
    { field: 'Payment Estimate Formula', sensitivity: 'Public', model: 'SLM', reason: 'Deterministic calculation — no frontier task needed' },
  ] as FieldLedgerRow[],
  // The frontier model never processes a field. It runs one task on non-PII inputs.
  frontierTask: {
    task: 'Spike analysis and recommendation',
    model: 'Frontier (Claude Sonnet)',
    inputs: 'Non-PII signals: queue depth, service level, promo correlation',
    pii: 0,
  },
};

/** Turn 4 — the two-gate routing flowchart (Mermaid v11). */
export const ROUTING_MERMAID = `flowchart LR
  A[Field tagging] --> B{Safe to send?}
  B -- carries PII --> S[In-environment SLM]
  B -- no PII --> C{Worth sending?}
  C -- simple, SLM sufficient --> S
  C -- complex and safe --> L[Frontier LLM]`;

/** Turn 3 — bounded KAG subgraph for the borderline catch. Neo4j NVL shape. */
export const KAG_SUBGRAPH = {
  nodes: [
    { id: 'rate', caption: 'Current Auto Loan Rate', group: 'field-internal' },
    { id: 'ssn', caption: 'Member SSN', group: 'field-pii' },
    { id: 'dyn', caption: 'Dynamics 365', group: 'source' },
    { id: 'dg04', caption: 'Policy DG-04', group: 'policy' },
    { id: 'dg07', caption: 'Policy DG-07', group: 'policy' },
  ],
  rels: [
    { id: 'r1', from: 'rate', to: 'dyn', caption: 'originates in' },
    { id: 'r2', from: 'rate', to: 'dg04', caption: 'governed by' },
    { id: 'r3', from: 'ssn', to: 'dyn', caption: 'originates in' },
    { id: 'r4', from: 'ssn', to: 'dg07', caption: 'governed by' },
  ],
  policyCard: {
    id: 'DG-04',
    title: 'Member-specific financial term',
    body: 'Member-specific rates and terms are treated as sensitive and must stay in-environment.',
  },
};

/**
 * Turn 5 — LLM Cost and Usage Report for Priya's session.
 *
 * RECONCILIATION (spec owns the footer; these rows must add up to it):
 *   21 SLM rows      = $0.506
 *    3 Frontier rows = $0.124  (0.041 + 0.033 + 0.050)
 *   -----------------------------
 *   24 tasks         = $0.630  ✓ matches the spec's $0.63 total
 *   All-frontier counterfactual $2.18 => 1 - (0.63 / 2.18) = 71% saved ✓
 *
 * Why some SLM rows cost more than a frontier row: per-task cost tracks TOKEN
 * VOLUME, not model tier. The batch jobs (transcript summarization, sentiment
 * over 90 calls, cross-source correlation) push far more tokens than one short
 * frontier reasoning call. Those same heavy tasks are exactly what makes the
 * all-frontier counterfactual ($2.18) so much larger than the actual $0.63 —
 * on the frontier they'd cost ~4x what the SLM charges. The savings story and
 * the row costs are the same fact viewed two ways.
 */
export const COST_REPORT = {
  rows: [
    // ── Retrieval / deterministic work — resolved locally, PII never leaves ──
    { task: 'Service level lookup', complexity: 'Simple', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Queue metrics retrieval', complexity: 'Retrieval', model: 'SLM', piiToFrontier: 0, cost: 0.002 },
    { task: 'Sensitivity classification', complexity: 'Simple', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Overtime candidate list', complexity: 'Retrieval, PII in', model: 'SLM', piiToFrontier: 0, cost: 0.002 },
    { task: 'Member record lookup', complexity: 'Retrieval, PII in', model: 'SLM', piiToFrontier: 0, cost: 0.002 },
    { task: 'Account balance resolution', complexity: 'Retrieval, PII in', model: 'SLM', piiToFrontier: 0, cost: 0.002 },
    { task: 'SSN tokenization', complexity: 'Simple, PII in', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Auto loan rate lookup', complexity: 'Retrieval', model: 'SLM', piiToFrontier: 0, cost: 0.002 },
    { task: 'Policy lookup (DG-04, DG-07)', complexity: 'Retrieval', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Force-to-load computation', complexity: 'Deterministic', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Audit log write', complexity: 'Deterministic', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Callback eligibility rules', complexity: 'Rules', model: 'SLM', piiToFrontier: 0, cost: 0.003 },
    { task: 'KAG field tagging, 7 fields', complexity: 'Classification', model: 'SLM', piiToFrontier: 0, cost: 0.008 },
    // ── Heavier local batch work — high token volume, still in-environment ──
    { task: 'Queue volume aggregation, 4h', complexity: 'Aggregation', model: 'SLM', piiToFrontier: 0, cost: 0.031 },
    { task: 'Abandonment blend, D365 + Genesys', complexity: 'Aggregation', model: 'SLM', piiToFrontier: 0, cost: 0.029 },
    { task: 'Agent skill matching, 60 agents', complexity: 'Retrieval', model: 'SLM', piiToFrontier: 0, cost: 0.034 },
    { task: 'Historical promo pattern match, 3 yrs', complexity: 'Retrieval', model: 'SLM', piiToFrontier: 0, cost: 0.048 },
    { task: 'Intent classification, queue backlog', complexity: 'Classification, batch', model: 'SLM', piiToFrontier: 0, cost: 0.062 },
    { task: 'Sentiment classification, 90 calls', complexity: 'Classification, batch', model: 'SLM', piiToFrontier: 0, cost: 0.071 },
    { task: 'Call transcript summarization, 12 calls', complexity: 'Summarization, batch', model: 'SLM', piiToFrontier: 0, cost: 0.086 },
    { task: 'Cross-source signal correlation, 6 systems', complexity: 'Correlation, batch', model: 'SLM', piiToFrontier: 0, cost: 0.118 },
    // ── The only frontier work: 3 tasks, all on non-PII inputs ──
    { task: 'Spike cause analysis', complexity: 'Complex reasoning', model: 'Frontier', piiToFrontier: 0, cost: 0.041, justification: 'Multi-source causal reasoning the SLM cannot do reliably. Non-PII inputs only.' },
    { task: 'Staffing recommendation', complexity: 'Complex reasoning', model: 'Frontier', piiToFrontier: 0, cost: 0.033, justification: 'Weighs cost, coverage and history to recommend an action. Non-PII inputs only.' },
    { task: 'Draft leadership summary', complexity: 'Complex generation', model: 'Frontier', piiToFrontier: 0, cost: 0.050, justification: 'Long-form generation for a human audience. Non-PII inputs only.' },
  ] as CostRow[],
  footer: {
    totalTasks: 24,
    frontierTasks: 3,
    tokenSplit: '88% SLM / 12% frontier',
    total: 0.63,
    allFrontier: 2.18,
    saved: '71%',
  },
};

/** Turn 6 — Agent Observability and Governance Dashboard (contact center, this month). */
export const GOVERNANCE = {
  frontierTaskShare: '11%',
  agents: [
    { name: 'Auto Loan Assist', health: 'Healthy', tasks: 412, frontier: 46 },
    { name: 'Mortgage Servicing', health: 'Healthy', tasks: 380, frontier: 51 },
    { name: 'Card Disputes', health: 'Watch', tasks: 205, frontier: 18 },
  ],
  spendTrend: [0.42, 0.48, 0.55, 0.51, 0.63],
  sampleAction: {
    query: 'Recommend a coaching action for this agent',
    action: 'Generated a coaching recommendation',
    context: 'Quality scorecard, call transcript, 3 prior calls',
    chainOfThought: 'Compared handle time and QA scores against the cohort, identified the gap, matched it to a coaching play',
    policy: 'QA-12, coaching thresholds',
  },
};

/** The seven governance KPIs (spec: Dashboard KPIs). Single source for the stats row + governance page. */
export const GOVERNANCE_KPIS = [
  { id: 'pii_frontier', label: 'PII Sent to Frontier Model', value: '0', trend: 'Routing log + KAG', positive: true },
  { id: 'sensitive_local', label: 'Sensitive Fields Kept In-Environment', value: '100%', trend: 'Routing log', positive: true },
  { id: 'frontier_share', label: 'Frontier Task Share (today)', value: '12%', trend: 'LLM usage log', positive: true },
  { id: 'token_split', label: 'SLM / Frontier Token Split', value: '88% / 12%', trend: 'LiteLLM gateway', positive: true },
  { id: 'spend_vs_all', label: 'Frontier Spend vs All-Frontier', value: '-71%', trend: 'Cost and usage report', positive: true },
  { id: 'cost_query', label: 'Average Cost per Query', value: '$0.11', trend: 'LiteLLM cost records', positive: true },
  { id: 'models', label: 'Models in Production', value: '2', trend: 'In-environment SLM + Claude Sonnet', positive: true },
];

// ─── Data access ────────────────────────────────────────────────────────────
// Swap the bodies below to API calls when ready. Components stay untouched.

export async function getFieldLedger() { return FIELD_LEDGER; }
export async function getRoutingMermaid() { return ROUTING_MERMAID; }
export async function getKagSubgraph() { return KAG_SUBGRAPH; }
export async function getCostReport() { return COST_REPORT; }
export async function getGovernance() { return GOVERNANCE; }
