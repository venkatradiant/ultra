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
  C -- complex and safe --> D{Within budget?}
  D -- over cap, non-critical --> S
  D -- within cap --> L[Frontier LLM]`;

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

/**
 * Turn 8 — Enterprise Agent Observability and Governance (this month). CR-06.
 *
 * Grouped by INITIATIVE, not by contact-center team: the point Parijat asked for
 * is "one common governance model across multiple AI implementations", and that
 * only reads at a glance if the contact center sits beside the other initiatives
 * rather than being the whole list.
 *
 * ⚠ The three Contact Center agents keep their EXACT original counts so the
 * Card Disputes thread (turn 8 says "Watch", the Observability page diagnoses
 * why) survives the reframe. New initiatives are additive.
 *
 * ARITHMETIC — `frontierTaskShare` must equal Σfrontier / Σtasks:
 *   tasks    412+380+205+180+240+160 = 1577
 *   frontier  46+ 51+ 18+ 19+ 28+ 17 =  179
 *   179/1577 = 11.35% → '11%'   ✓ matches spec v2 Step 8 ("held at 11% of tasks")
 * Note this is the MONTH figure. `ui.stats.frontier_share = '12%'` is TODAY —
 * a different window, also spec v2. They are not meant to match.
 */
export const GOVERNANCE = {
  frontierTaskShare: '11%',
  agents: [
    { initiative: 'Contact Center', name: 'Auto Loan Assist', health: 'Healthy', tasks: 412, frontier: 46 },
    { initiative: 'Contact Center', name: 'Mortgage Servicing', health: 'Healthy', tasks: 380, frontier: 51 },
    { initiative: 'Contact Center', name: 'Card Disputes', health: 'Watch', tasks: 205, frontier: 18 },
    { initiative: 'Core Banking', name: 'Core Banking Copilot', health: 'Healthy', tasks: 180, frontier: 19 },
    { initiative: 'Member Assistant', name: 'Member Assistant', health: 'Healthy', tasks: 240, frontier: 28 },
    { initiative: 'Collections', name: 'Collections Assist', health: 'Healthy', tasks: 160, frontier: 17 },
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

/**
 * Turn 5 — Budget Guardrail. CR-05 / spec v2 Step 5.
 *
 * ⚠ RESOLVES A WORDING CONFLICT IN THE SPEC. Step 5 says the user "crossed their
 * session budget" AND that "spend stayed inside the cap" — both can't be true of
 * one number. Modelled as two thresholds, which is how such systems actually
 * work and makes both sentences true:
 *   budget ($2.00) — the SOFT trigger. Cross it and non-critical tasks downshift.
 *   cap    ($2.50) — the HARD ceiling. Never breached.
 *
 * ARITHMETIC:
 *   18 tasks. Frontier through task 12, where spend hits $2.04 and crosses the
 *   budget. Remaining 6 tasks downshift to the SLM at ~$0.025 → +$0.15.
 *   final     2.04 + 0.15 = $2.19  → under the $2.50 cap ✓
 *   had they stayed on frontier: 2.04 + (6 × $0.20) = $3.24 → would have
 *   breached the cap by $0.74. That counterfactual is the point of the panel.
 */
export const BUDGET_GUARDRAIL = {
  user: 'Marcus Tillman',
  surface: 'Insights tool',
  window: 'This morning · session',
  budget: 2.0,
  cap: 2.5,
  spendAtDownshift: 2.04,
  finalSpend: 2.19,
  /** What the session would have cost with no downshift — breaches the cap. */
  counterfactual: 3.24,
  downshiftAtTask: 12,
  totalTasks: 18,
  before: { model: 'Frontier (Claude Sonnet)', tasks: 12 },
  after: { model: 'In-environment SLM', tasks: 6 },
  answerQuality: 'Acceptable',
  qualityNote: 'Post-downshift answers stayed complete and accurate; no task failed and no escalation was raised.',
  /** Per-task cumulative spend, index 0-based; the downshift is between 11 and 12. */
  spendByTask: [0.17, 0.34, 0.51, 0.69, 0.86, 1.03, 1.20, 1.37, 1.54, 1.70, 1.87, 2.04, 2.07, 2.09, 2.12, 2.14, 2.17, 2.19],
  policy: 'DG-14 — per-session budget, non-critical tasks downshift at the soft threshold',
};

/**
 * Turn 7 — Semantic Cache Reuse. CR-04 / spec v2 Step 7.
 *
 * ⚠ SCOPE. This is MONTH-scope and cross-user (Priya then Marcus). The cost
 * report (turn 6) is ONE session of Priya's — 24 tasks, $0.63. CR-04's note asks
 * these to "reconcile", but they measure different windows, so they cannot and
 * must not: nothing here may alter COST_REPORT. What it must agree with is the
 * month: 1577 tasks and 11% frontier share, from GOVERNANCE.agents above.
 *
 * ARITHMETIC (month):
 *   monthTasks 1577 (= Σ GOVERNANCE.agents.tasks)
 *   cacheHits   214  → hit rate 214/1577 = 13.6%
 *   costAvoided 214 × $0.11 (avg cost/query KPI) = $23.54
 *   tokensAvoided 214 × 4,200 avg = 898,800
 * getCacheReuse() derives rate and costAvoided rather than restating them.
 */
export const CACHE_REUSE = {
  /** The worked example: same question, two people, inside an hour. */
  pair: {
    first: {
      user: 'Priya Kapoor',
      at: '09:12',
      query: 'Summarize the auto loan spike and what we did about it',
      served: 'model' as const,
      model: 'In-environment SLM',
      tokens: 4180,
      cost: 0.12,
      latencyMs: 1240,
    },
    second: {
      user: 'Marcus Tillman',
      at: '09:41',
      query: 'Give me a summary of the auto loan spike response',
      served: 'cache' as const,
      model: 'None — served from semantic cache',
      tokens: 0,
      cost: 0,
      latencyMs: 180,
    },
    /** Cosine similarity that cleared the reuse threshold (0.90). */
    similarity: 0.94,
    threshold: 0.9,
  },
  month: {
    tasks: 1577,
    cacheHits: 214,
    avgTokensPerCall: 4200,
    avgCostPerQuery: 0.11,
  },
  policy: 'DG-16 — semantic reuse above 0.90 similarity, same tenant, 24h TTL',
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

/**
 * The closing turn — the governance summary Daniel would hand to a risk
 * committee. Every number here is restated from the fixtures above, not
 * recomputed: sovereignty from FIELD_LEDGER, frontier share and split from
 * GOVERNANCE/COST_REPORT, cost from COST_REPORT.footer. If one of those moves,
 * move it here too — governanceData.test.ts has no opinion, but a reader adding
 * the column up does.
 */
export const GOVERNANCE_SUMMARY = {
  // CR-07: enterprise altitude. The contact center is the worked example inside
  // this summary, not its scope.
  period: 'Enterprise · every AI initiative · month to date',
  verdict: 'One open item · everything else green',
  pillars: [
    {
      id: 'sovereignty',
      label: 'Sovereignty',
      headline: '0',
      unit: 'PII to the frontier model',
      support: '100% of sensitive fields resolved in-environment',
      detail: 'The knowledge graph caught one borderline field — the current auto loan rate — and held it local under DG-04.',
      tone: 'emerald' as const,
    },
    {
      id: 'frontier',
      label: 'Frontier usage',
      headline: '11%',
      unit: 'of tasks, enterprise-wide',
      support: '88 / 12 token split',
      detail: 'Every one complex reasoning or generation. Every one on non-PII inputs. Same gates on every initiative.',
      tone: 'violet' as const,
    },
    {
      id: 'cost',
      label: 'Cost',
      headline: '−71%',
      unit: 'vs all-frontier',
      support: "Priya's session: $0.63 against $2.18",
      detail: 'Routing pays for itself at this volume; the counterfactual is modelled on the same 24 tasks.',
      tone: 'blue' as const,
    },
    {
      id: 'observability',
      label: 'Observability',
      headline: '100%',
      unit: 'of actions explainable',
      support: 'One governance layer across every foundry in the estate',
      detail: 'Contact center, core banking and the rest all route through the same model. Card Disputes on watch for volume, not compliance. Three agents are not yet onboarded.',
      tone: 'brand' as const,
    },
  ],
  openItems: [
    {
      id: 'OPEN-1',
      text: "Confirm the justification on Priya's spike review and close it.",
      owner: 'D. Okonkwo',
      severity: 'review' as const,
    },
  ],
};

// ─── Data access ────────────────────────────────────────────────────────────
// Swap the bodies below to API calls when ready. Components stay untouched.

export async function getFieldLedger() { return FIELD_LEDGER; }
export async function getRoutingMermaid() { return ROUTING_MERMAID; }
export async function getKagSubgraph() { return KAG_SUBGRAPH; }
export async function getCostReport() { return COST_REPORT; }
export async function getGovernance() { return GOVERNANCE; }
export async function getGovernanceSummary() { return GOVERNANCE_SUMMARY; }
export async function getBudgetGuardrail() { return BUDGET_GUARDRAIL; }

/**
 * Cache reuse with the month figures DERIVED, not restated — hit rate and cost
 * avoided fall out of cacheHits, so they can't drift from each other the way two
 * hand-authored numbers would.
 */
export async function getCacheReuse() {
  const { tasks, cacheHits, avgTokensPerCall, avgCostPerQuery } = CACHE_REUSE.month;
  return {
    ...CACHE_REUSE,
    month: {
      ...CACHE_REUSE.month,
      hitRatePct: Math.round((cacheHits / tasks) * 1000) / 10,
      tokensAvoided: cacheHits * avgTokensPerCall,
      costAvoided: Math.round(cacheHits * avgCostPerQuery * 100) / 100,
      latencySavedMs: CACHE_REUSE.pair.first.latencyMs - CACHE_REUSE.pair.second.latencyMs,
    },
  };
}
