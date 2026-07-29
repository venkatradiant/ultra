/**
 * Newfold Digital — AI Governance Admin (Arjun Nair) data layer.
 *
 * Mirrors the NFCU platform-admin governanceData shapes exactly, re-skinned to
 * Newfold's care context: the renewal-spike incident (Sofia's response), domain-
 * registrant PII, and the cross-foundry enterprise. Static now, live API later —
 * every governance component reads through a getter below; only the getter body
 * changes when the backend is ready.
 *
 * Source of truth: Newfold_CCaaS_Prototype_Spec_v1.docx (Arjun Nair, Tables 39–48).
 * The routing 3-gate model is universal, so RoutingDiagram reuses the shared NFCU
 * routing getter — only the export filename differs.
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
  justification?: string;
}

/** Turn 2 — Field Sovereignty Ledger. Every field on the SLM; frontier runs one task. */
export const FIELD_LEDGER = {
  badge: '0 PII or PCI to frontier',
  fields: [
    { field: 'Card on File', sensitivity: 'PII', model: 'SLM', reason: 'PCI cardholder data (DG-07) — kept in-environment' },
    { field: 'Billing Address', sensitivity: 'PII', model: 'SLM', reason: 'Personally identifiable (DG-02) — kept in-environment' },
    { field: 'Account Credentials', sensitivity: 'PII', model: 'SLM', reason: 'Authentication secret (DG-07) — kept in-environment' },
    { field: 'Domain Registrant Details', sensitivity: 'PII', model: 'SLM', reason: 'WHOIS registrant PII (DG-02) — kept in-environment' },
    { field: 'Customer Name', sensitivity: 'PII', model: 'SLM', reason: 'Personally identifiable (DG-02) — kept in-environment' },
    { field: 'Current Renewal Price', sensitivity: 'Sensitive-Internal', model: 'SLM', reason: "Customer-specific contract price — PII under DG-04, not public list pricing — kept in-environment" },
    { field: 'Public List Price', sensitivity: 'Public', model: 'SLM', reason: 'Public catalog price, SLM sufficient — no frontier task needed' },
  ] as FieldLedgerRow[],
  frontierTask: {
    task: 'Renewal-spike analysis and recommendation',
    model: 'Frontier (Claude Sonnet)',
    inputs: 'Non-PII signals: queue depth, service level, campaign correlation',
    pii: 0,
  },
};

/** Turn 3 — bounded KAG subgraph for the borderline catch (the renewal price). */
export interface KagNode {
  id: string;
  caption: string;
  group:
    | 'field-internal' | 'field-pii' | 'source' | 'policy'
    | 'source-table' | 'column' | 'transform' | 'pipeline' | 'steward' | 'control';
  parent?: string;
  detail: { kind: string; description: string; tags: string[] };
}
export interface KagRel { id: string; from: string; to: string; caption: string; }

export const KAG_SUBGRAPH: {
  nodes: KagNode[];
  rels: KagRel[];
  policyCard: { id: string; title: string; body: string };
} = {
  nodes: [
    {
      id: 'price', caption: 'Current Renewal Price', group: 'field-internal',
      detail: {
        kind: 'Customer-specific PII field',
        description: "A specific customer's renewal price under their contract. Looks public, but it is customer-specific — PII under rule DG-04, not list pricing — so it stays in-environment.",
        tags: ['PII', 'DG-04', 'Customer-specific', 'Contract price'],
      },
    },
    {
      id: 'card', caption: 'Card on File', group: 'field-pii',
      detail: {
        kind: 'PCI field',
        description: 'Cardholder data. Direct payment identifier — never leaves the environment and is only ever read in tokenized form.',
        tags: ['PCI', 'Restricted', 'Tokenized'],
      },
    },
    {
      id: 'billing', caption: 'Billing & Subscriptions', group: 'source',
      detail: {
        kind: 'Source system',
        description: 'The system of record for subscriptions, renewals, and invoices. The renewal price originates here.',
        tags: ['System of record', 'Billing', 'Connector'],
      },
    },
    {
      id: 'dg04', caption: 'Policy DG-04', group: 'policy',
      detail: {
        kind: 'Governing policy',
        description: 'Customer-specific prices and terms are treated as sensitive and must stay in-environment.',
        tags: ['Data governance', 'In-environment only'],
      },
    },
    {
      id: 'dg07', caption: 'Policy DG-07', group: 'policy',
      detail: {
        kind: 'Governing policy',
        description: 'PCI cardholder data and credentials must be tokenized at rest and masked in transit.',
        tags: ['Data governance', 'PCI handling'],
      },
    },
    // Lineage: renewal price
    { id: 'price-col', caption: 'renewal_price', group: 'column', parent: 'price', detail: { kind: 'Column', description: 'Decimal column holding the effective renewal price. Type NUMBER(8,2).', tags: ['Column', 'NUMBER(8,2)', 'Confidential'] } },
    { id: 'price-calc', caption: 'Price derivation rule', group: 'transform', parent: 'price', detail: { kind: 'Transform', description: 'Derives the customer renewal price from base plan, contract tier, and loyalty adjustments. This per-customer computation is what makes the field sensitive.', tags: ['Derived', 'Per-customer', 'Business rule'] } },
    { id: 'price-tbl', caption: 'SUBSCRIPTION_TERMS', group: 'source-table', parent: 'price', detail: { kind: 'Source table', description: 'Origin table in Billing & Subscriptions that stores per-subscription terms and prices.', tags: ['Table', 'Billing'] } },
    // Lineage: card
    { id: 'card-col', caption: 'card_token', group: 'column', parent: 'card', detail: { kind: 'Column', description: 'Tokenized card reference. Stored token only; never persisted in the clear.', tags: ['Column', 'Tokenized', 'PCI'] } },
    { id: 'card-mask', caption: 'Tokenization step', group: 'transform', parent: 'card', detail: { kind: 'Transform', description: 'Tokenizes the card before any downstream read, so agents and models only ever see a token.', tags: ['Masking', 'Tokenization', 'PCI control'] } },
    // Lineage: billing
    { id: 'billing-sub', caption: 'SUBSCRIPTIONS', group: 'source-table', parent: 'billing', detail: { kind: 'Source table', description: 'Subscription master in Billing. Holds plan, status, and renewal fields.', tags: ['Table', 'Master data'] } },
    { id: 'billing-etl', caption: 'Nightly ETL ingest', group: 'pipeline', parent: 'billing', detail: { kind: 'Pipeline', description: 'Scheduled job that ingests Billing tables into the governed data environment each night.', tags: ['Batch', 'Nightly', 'Ingest'] } },
    { id: 'billing-steward', caption: 'Data steward', group: 'steward', parent: 'billing', detail: { kind: 'Owner', description: 'Accountable data steward for the Billing source domain and its classifications.', tags: ['Ownership', 'Accountable'] } },
    // Lineage: policies
    { id: 'dg04-scope', caption: 'Applies to customer-price columns', group: 'control', parent: 'dg04', detail: { kind: 'Policy scope', description: 'DG-04 scopes to any column carrying customer-specific prices or terms — including renewal_price.', tags: ['Scope', 'In-environment only'] } },
    { id: 'dg07-ctl', caption: 'Tokenization-at-rest control', group: 'control', parent: 'dg07', detail: { kind: 'Control', description: 'DG-07 control requiring PCI columns to be tokenized at rest and masked in transit.', tags: ['Control', 'Tokenization', 'Masking'] } },
  ],
  rels: [
    { id: 'r1', from: 'price', to: 'billing', caption: 'originates in' },
    { id: 'r2', from: 'price', to: 'dg04', caption: 'governed by' },
    { id: 'r3', from: 'card', to: 'billing', caption: 'originates in' },
    { id: 'r4', from: 'card', to: 'dg07', caption: 'governed by' },
    { id: 'r5', from: 'price', to: 'price-col', caption: 'has column' },
    { id: 'r6', from: 'price', to: 'price-calc', caption: 'derived by' },
    { id: 'r7', from: 'price', to: 'price-tbl', caption: 'sourced from' },
    { id: 'r8', from: 'card', to: 'card-col', caption: 'has column' },
    { id: 'r9', from: 'card', to: 'card-mask', caption: 'protected by' },
    { id: 'r10', from: 'billing', to: 'billing-sub', caption: 'has table' },
    { id: 'r11', from: 'billing', to: 'billing-etl', caption: 'ingested via' },
    { id: 'r12', from: 'billing', to: 'billing-steward', caption: 'owned by' },
    { id: 'r13', from: 'dg04', to: 'dg04-scope', caption: 'scopes to' },
    { id: 'r14', from: 'dg07', to: 'dg07-ctl', caption: 'enforces' },
  ],
  policyCard: {
    id: 'DG-04',
    title: 'Customer-specific contract price',
    body: 'Customer-specific prices and terms are treated as sensitive and must stay in-environment — classified by meaning, not keyword.',
  },
};

/** Turn 6 — LLM Cost and Usage Report for Sofia's session. 24 tasks, $0.63, -71%. */
export const COST_REPORT = {
  rows: [
    { task: 'Service level lookup', complexity: 'Simple', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Queue metrics retrieval', complexity: 'Retrieval', model: 'SLM', piiToFrontier: 0, cost: 0.002 },
    { task: 'Sensitivity classification', complexity: 'Simple', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Cross-trained agent list', complexity: 'Retrieval, PII in', model: 'SLM', piiToFrontier: 0, cost: 0.002 },
    { task: 'Customer record lookup', complexity: 'Retrieval, PII in', model: 'SLM', piiToFrontier: 0, cost: 0.002 },
    { task: 'Card-on-file resolution', complexity: 'Retrieval, PII in', model: 'SLM', piiToFrontier: 0, cost: 0.002 },
    { task: 'Card tokenization', complexity: 'Simple, PII in', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Renewal price lookup', complexity: 'Retrieval', model: 'SLM', piiToFrontier: 0, cost: 0.002 },
    { task: 'Policy lookup (DG-04, DG-07)', complexity: 'Retrieval', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Deflection eligibility rules', complexity: 'Rules', model: 'SLM', piiToFrontier: 0, cost: 0.003 },
    { task: 'Audit log write', complexity: 'Deterministic', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'Save-desk load computation', complexity: 'Deterministic', model: 'SLM', piiToFrontier: 0, cost: 0.001 },
    { task: 'KAG field tagging, 7 fields', complexity: 'Classification', model: 'SLM', piiToFrontier: 0, cost: 0.008 },
    { task: 'Renewal volume aggregation, 4h', complexity: 'Aggregation', model: 'SLM', piiToFrontier: 0, cost: 0.031 },
    { task: 'Contact-reason blend, Genesys Cloud', complexity: 'Aggregation', model: 'SLM', piiToFrontier: 0, cost: 0.029 },
    { task: 'Agent skill matching, 70 agents', complexity: 'Retrieval', model: 'SLM', piiToFrontier: 0, cost: 0.034 },
    { task: 'Historical renewal pattern match, 3 yrs', complexity: 'Retrieval', model: 'SLM', piiToFrontier: 0, cost: 0.048 },
    { task: 'Intent classification, queue backlog', complexity: 'Classification, batch', model: 'SLM', piiToFrontier: 0, cost: 0.062 },
    { task: 'Sentiment classification, 90 contacts', complexity: 'Classification, batch', model: 'SLM', piiToFrontier: 0, cost: 0.071 },
    { task: 'Contact transcript summarization, 12', complexity: 'Summarization, batch', model: 'SLM', piiToFrontier: 0, cost: 0.086 },
    { task: 'Cross-source signal correlation, 6 systems', complexity: 'Correlation, batch', model: 'SLM', piiToFrontier: 0, cost: 0.118 },
    { task: 'Spike cause analysis', complexity: 'Complex reasoning', model: 'Frontier', piiToFrontier: 0, cost: 0.041, justification: 'Multi-source causal reasoning the SLM cannot do reliably. Non-PII inputs only.' },
    { task: 'Stabilization recommendation', complexity: 'Complex reasoning', model: 'Frontier', piiToFrontier: 0, cost: 0.033, justification: 'Weighs cost, coverage and the Bluehost trade-off to recommend an action. Non-PII inputs only.' },
    { task: 'Draft daily ops summary', complexity: 'Complex generation', model: 'Frontier', piiToFrontier: 0, cost: 0.050, justification: 'Long-form generation for a human audience. Non-PII inputs only.' },
  ] as CostRow[],
  footer: { totalTasks: 24, frontierTasks: 3, tokenSplit: '88% SLM / 12% frontier', total: 0.63, allFrontier: 2.18, saved: '71%' },
};

/** Turn 8 — Enterprise Agent Observability, grouped by initiative. Frontier share 11%. */
export const GOVERNANCE = {
  frontierTaskShare: '11%',
  agents: [
    { initiative: 'Customer Care', name: 'Renewals & Billing Assist', health: 'Healthy', tasks: 412, frontier: 46 },
    { initiative: 'Customer Care', name: 'Hosting Support Assist', health: 'Healthy', tasks: 380, frontier: 51 },
    { initiative: 'Customer Care', name: 'Save Desk Assist', health: 'Watch', tasks: 205, frontier: 18 },
    { initiative: 'Bluehost Customer AI', name: 'Bluehost Account Assistant', health: 'Healthy', tasks: 180, frontier: 19 },
    { initiative: 'Bluehost Customer AI', name: 'Site-Down Self-Service', health: 'Healthy', tasks: 240, frontier: 28 },
    { initiative: 'Engineering Copilots', name: 'Platform Engineering Copilot', health: 'Healthy', tasks: 160, frontier: 17 },
  ],
  spendTrend: [0.42, 0.48, 0.55, 0.51, 0.63],
  sampleAction: {
    query: 'Recommend a stabilization action for the renewal spike',
    action: 'Generated a stabilization recommendation',
    context: 'Queue metrics, campaign correlation, agent skill profiles',
    chainOfThought: 'Compared today’s spike to prior renewal cycles, weighed reroute vs deflection, surfaced the Bluehost trade-off, recommended self-service deflection',
    policy: 'DG-12, routing and cost thresholds',
  },
};

/** Turn 5 — Budget Guardrail. A workforce-planning user crosses the soft budget. */
export const BUDGET_GUARDRAIL = {
  user: 'Tomas Herrera',
  surface: 'Workforce planning tool',
  window: 'This morning · session',
  budget: 2.0,
  cap: 2.5,
  spendAtDownshift: 2.04,
  finalSpend: 2.19,
  counterfactual: 3.24,
  downshiftAtTask: 12,
  totalTasks: 18,
  before: { model: 'Frontier (Claude Sonnet)', tasks: 12 },
  after: { model: 'In-environment SLM', tasks: 6 },
  answerQuality: 'Acceptable',
  qualityNote: 'Post-downshift answers stayed complete and accurate; no task failed and no escalation was raised.',
  spendByTask: [0.17, 0.34, 0.51, 0.69, 0.86, 1.03, 1.20, 1.37, 1.54, 1.70, 1.87, 2.04, 2.07, 2.09, 2.12, 2.14, 2.17, 2.19],
  policy: 'DG-14 — per-session budget, non-critical tasks downshift at the soft threshold',
};

/** Turn 7 — Semantic Cache Reuse. Sofia then Marisol, same renewal-spike summary. */
export const CACHE_REUSE = {
  pair: {
    first: { user: 'Sofia Reyes', at: '09:12', query: 'Summarize the renewal spike and what we did about it', served: 'model' as const, model: 'In-environment SLM', tokens: 4180, cost: 0.12, latencyMs: 1240 },
    second: { user: 'Marisol Castellano', at: '09:41', query: 'Give me a summary of the renewal spike response', served: 'cache' as const, model: 'None — served from semantic cache', tokens: 0, cost: 0, latencyMs: 180 },
    similarity: 0.94,
    threshold: 0.9,
  },
  month: { tasks: 1577, cacheHits: 214, avgTokensPerCall: 4200, avgCostPerQuery: 0.11 },
  policy: 'DG-16 — semantic reuse above 0.90 similarity, same tenant, 24h TTL',
};

/** The seven governance KPIs (spec Table 38). */
export const GOVERNANCE_KPIS = [
  { id: 'pii_frontier', label: 'PII or PCI Sent to Frontier Model', value: '0', trend: 'Routing log + KAG', positive: true },
  { id: 'sensitive_local', label: 'Sensitive Fields Kept In-Environment', value: '100%', trend: 'Routing log', positive: true },
  { id: 'frontier_share', label: 'Frontier Task Share (today)', value: '12%', trend: 'LLM usage log', positive: true },
  { id: 'token_split', label: 'SLM / Frontier Token Split', value: '88% / 12%', trend: 'LiteLLM gateway', positive: true },
  { id: 'spend_vs_all', label: 'Frontier Spend vs All-Frontier', value: '-71%', trend: 'Cost and usage report', positive: true },
  { id: 'cost_query', label: 'Average Cost per Query', value: '$0.11', trend: 'LiteLLM cost records', positive: true },
  { id: 'models', label: 'Models in Production', value: '2', trend: 'In-environment SLM + Claude Sonnet', positive: true },
];

/** The closing turn — the enterprise governance summary. */
export const GOVERNANCE_SUMMARY = {
  period: 'Enterprise · every AI initiative and foundry · month to date',
  verdict: 'One open item · everything else green',
  pillars: [
    { id: 'sovereignty', label: 'Sovereignty', headline: '0', unit: 'PII or PCI to the frontier model', support: '100% of sensitive fields resolved in-environment', detail: 'The knowledge graph caught one borderline field — the current renewal price — and held it local under DG-04.', tone: 'emerald' as const },
    { id: 'frontier', label: 'Frontier usage', headline: '11%', unit: 'of tasks, enterprise-wide', support: '88 / 12 token split', detail: 'Every one complex reasoning or generation. Every one on non-PII inputs. Same gates on every initiative and foundry.', tone: 'violet' as const },
    { id: 'cost', label: 'Cost', headline: '−71%', unit: 'vs all-frontier', support: "Sofia's session: $0.63 against $2.18", detail: 'Routing pays for itself at this volume; the counterfactual is modelled on the same 24 tasks.', tone: 'blue' as const },
    { id: 'observability', label: 'Observability', headline: '100%', unit: 'of actions explainable', support: 'One governance layer across every foundry in the estate', detail: 'Customer care, Bluehost customer AI, and engineering copilots all route through the same model. Save Desk Assist on watch for volume, not compliance. Three agents are not yet onboarded.', tone: 'brand' as const },
  ],
  openItems: [
    { id: 'OPEN-1', text: "Confirm the justification on Sofia's renewal-spike review and close it.", owner: 'A. Nair', severity: 'review' as const },
  ],
};

// ─── Data access ────────────────────────────────────────────────────────────
export async function getFieldLedger() { return FIELD_LEDGER; }
export async function getKagSubgraph() { return KAG_SUBGRAPH; }
export async function getCostReport() { return COST_REPORT; }
export async function getGovernance() { return GOVERNANCE; }
export async function getGovernanceSummary() { return GOVERNANCE_SUMMARY; }
export async function getBudgetGuardrail() { return BUDGET_GUARDRAIL; }

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
