/**
 * Platform Admin (Daniel Okonkwo) agent-observability data layer.
 *
 * GROUND RULE: static data now, live API later. Every component reads through a
 * getter below. Swapping a getter body to a `fetch` is the ONLY change when the
 * backend is ready — the components never change. Same contract as
 * governanceData.ts, which this file deliberately mirrors.
 *
 * The getters map 1:1 onto the documented endpoints (ui_api_docs.md):
 *   getCategories()          → GET /api/categories
 *   getComponents(filter)    → GET /api/components?category=&layer=
 *   getComponent(id)         → GET /api/components/{id}
 *   getComponentMetrics(id)  → GET /api/components/{id}/metrics    (poll 5s)
 *   getComponentActivity(id) → GET /api/components/{id}/activity   (poll 3–5s)
 *   getSystemOverview()      → DERIVED — no endpoint exists for this.
 *
 * WHAT THIS OBSERVES: the NFCU AI platform stack across the four layers, not
 * generic infrastructure. The application layer IS the contact-center AI agents;
 * the data layer is the KAG and the routing/cost stores; infrastructure is the
 * in-environment SLM pool and the model gateway; the network layer is the
 * egress path to the frontier model. That last one is the point of the page:
 * `frontier-egress-gateway` reports `pii_blocked_count` — Gate 1 as live
 * telemetry, which is what ties observability back to the sovereignty claim.
 *
 * SELF-HEALING SCOPE: agents detect, diagnose (RCA + confidence) and RECOMMEND.
 * A human approves before anything executes. The NFCU spec does not claim
 * autonomous remediation and neither does this page.
 *
 * ⚠ CROSS-SURFACE INVARIANT: the three AI agents below also appear in
 * GOVERNANCE.agents (governanceData.ts, turn 6). Their health MUST agree —
 * turn 6 'Watch' ↔ 'degraded' here. Card Disputes is the degraded one, and this
 * page is where turn 6's unexplained "Watch" gets its diagnosis.
 * observabilityData.test.ts enforces this; don't edit one surface alone.
 */

export type ComponentState = 'healthy' | 'degraded' | 'failed' | 'recovering';

export type LayerId =
  | 'application_layer'
  | 'data_layer'
  | 'infrastructure_layer'
  | 'network_layer';

export interface CategoryRow {
  category: string;
  layer: LayerId;
}

export interface PlatformComponent {
  component: string;
  layer: LayerId;
  category: string;
  state: ComponentState;
  /** Metric names and count vary by category — by design, per ui_api_docs.md. */
  metrics: Record<string, number>;
  /** Display label; the API returns ids only, so the UI falls back to `component`. */
  label?: string;
  lastUpdated: string;
}

export interface ActivityEvent {
  component: string;
  message: string;
  timestamp: string;
}

/** Human-readable layer names for the gauges/labels. */
export const LAYER_LABELS: Record<LayerId, string> = {
  application_layer: 'Application',
  data_layer: 'Data',
  infrastructure_layer: 'Infrastructure',
  network_layer: 'Network',
};

/** Category → human-readable name. */
export const CATEGORY_LABELS: Record<string, string> = {
  ai_agents: 'AI Agents',
  api_services_member: 'Member API Services',
  orchestration: 'Orchestration',
  knowledge_graph: 'Knowledge Graph (KAG)',
  routing_log: 'Routing Log',
  cost_records: 'Cost Records',
  vector_store: 'Vector Store',
  slm_inference: 'SLM Inference Pool',
  model_gateway: 'Model Gateway',
  container_platform: 'Container Platform',
  frontier_egress: 'Frontier Egress',
  private_endpoints: 'Private Endpoints',
  api_gateway: 'API Gateway',
};

/** Metric key → display label + unit, so panels don't parse snake_case at render. */
export const METRIC_META: Record<string, { label: string; unit: string; max?: number }> = {
  containment_rate_percent: { label: 'Containment Rate', unit: '%', max: 100 },
  avg_response_time_ms: { label: 'Avg Response Time', unit: 'ms' },
  escalation_rate_percent: { label: 'Escalation Rate', unit: '%', max: 100 },
  frontier_task_share_percent: { label: 'Frontier Task Share', unit: '%', max: 100 },
  tasks_per_minute: { label: 'Tasks per Minute', unit: '/min' },
  response_time_ms: { label: 'Response Time', unit: 'ms' },
  error_rate_percent: { label: 'Error Rate', unit: '%', max: 100 },
  throughput_rps: { label: 'Throughput', unit: 'rps' },
  cpu_percent: { label: 'CPU Usage', unit: '%', max: 100 },
  memory_percent: { label: 'Memory Usage', unit: '%', max: 100 },
  gpu_utilization_percent: { label: 'GPU Utilization', unit: '%', max: 100 },
  inference_latency_ms: { label: 'Inference Latency', unit: 'ms' },
  queue_depth: { label: 'Queue Depth', unit: '' },
  tokens_per_second: { label: 'Tokens per Second', unit: 't/s' },
  temperature_celsius: { label: 'Temperature', unit: '°C' },
  active_connections: { label: 'Active Connections', unit: '' },
  query_latency_ms: { label: 'Query Latency', unit: 'ms' },
  replication_lag_ms: { label: 'Replication Lag', unit: 'ms' },
  cache_hit_rate_percent: { label: 'Cache Hit Rate', unit: '%', max: 100 },
  requests_per_second: { label: 'Requests per Second', unit: 'rps' },
  p95_latency_ms: { label: 'p95 Latency', unit: 'ms' },
  pii_blocked_count: { label: 'PII Blocked at Gate 1', unit: '' },
  egress_requests_per_minute: { label: 'Egress Requests', unit: '/min' },
  tls_handshake_ms: { label: 'TLS Handshake', unit: 'ms' },
  throughput_mbps: { label: 'Network Throughput', unit: 'Mbps' },
  index_size_gb: { label: 'Index Size', unit: 'GB' },
  embedding_latency_ms: { label: 'Embedding Latency', unit: 'ms' },
  pod_restarts: { label: 'Pod Restarts', unit: '' },
  node_count: { label: 'Nodes Ready', unit: '' },
};

/**
 * Metrics that are healthier when LOW (latency, errors, queues). Everything else
 * reads healthier when high. Drives sparkline tone; without it a rising error
 * rate would render as "good".
 */
export const LOWER_IS_BETTER = new Set([
  'avg_response_time_ms', 'response_time_ms', 'error_rate_percent', 'escalation_rate_percent',
  'inference_latency_ms', 'queue_depth', 'query_latency_ms', 'replication_lag_ms',
  'p95_latency_ms', 'tls_handshake_ms', 'temperature_celsius', 'cpu_percent',
  'memory_percent', 'gpu_utilization_percent', 'embedding_latency_ms', 'pod_restarts',
  'frontier_task_share_percent', 'egress_requests_per_minute',
]);

/**
 * Cumulative counters, not gauges. They only ever climb, and a line chart of a
 * monotonic counter is meaningless — these render as a value + delta instead.
 * `pii_blocked_count` is the one that matters: it's the Gate 1 tally on the
 * egress gateway, and showing it wobbling up and down would be visibly wrong to
 * the exact audience most interested in it.
 */
export const COUNTER_METRICS = new Set(['pii_blocked_count', 'pod_restarts']);

/**
 * All timestamps are offsets back from a single module-scope T0, never absolute
 * literals. Two reasons: the log renders relative times ("4m ago"), so hardcoded
 * dates rot — the Data Sources page already shows "Last sync: 2022h ago" from
 * exactly this mistake. And every component's events share one T0, so the
 * incident timeline still lines up when the presenter clicks from Card Disputes
 * to the SLM pool and says "same incident, other end".
 */
const T0 = Date.now();
const minutesAgo = (m: number) => new Date(T0 - m * 60_000).toISOString();

const BASE_TS = minutesAgo(0);

/**
 * The platform. `metrics` here are the BASELINE values — getComponentMetrics()
 * jitters them per tick so the page reads as live. States are authored, never
 * random: a demo must show the same story every time it's run.
 */
const COMPONENTS: PlatformComponent[] = [
  // ─── application_layer · ai_agents ────────────────────────────────────────
  // These three mirror GOVERNANCE.agents (turn 6). Health must agree — see the
  // invariant note at the top of this file.
  {
    component: 'auto-loan-assist', label: 'Auto Loan Assist',
    layer: 'application_layer', category: 'ai_agents', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { containment_rate_percent: 78.4, avg_response_time_ms: 940, escalation_rate_percent: 21.6, frontier_task_share_percent: 11.2, tasks_per_minute: 6.8 },
  },
  {
    component: 'mortgage-servicing-assist', label: 'Mortgage Servicing',
    layer: 'application_layer', category: 'ai_agents', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { containment_rate_percent: 74.1, avg_response_time_ms: 1120, escalation_rate_percent: 25.9, frontier_task_share_percent: 13.4, tasks_per_minute: 5.9 },
  },
  {
    // The narrative subject. Turn 6 says "Watch" and never explains why; the
    // event log on this component is where it gets diagnosed.
    component: 'card-disputes-assist', label: 'Card Disputes',
    layer: 'application_layer', category: 'ai_agents', state: 'degraded',
    lastUpdated: BASE_TS,
    metrics: { containment_rate_percent: 61.2, avg_response_time_ms: 2840, escalation_rate_percent: 38.8, frontier_task_share_percent: 8.8, tasks_per_minute: 3.1 },
  },
  {
    component: 'member-servicing-assist', label: 'Member Servicing',
    layer: 'application_layer', category: 'ai_agents', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { containment_rate_percent: 81.6, avg_response_time_ms: 870, escalation_rate_percent: 18.4, frontier_task_share_percent: 9.6, tasks_per_minute: 8.2 },
  },
  {
    component: 'fraud-triage-assist', label: 'Fraud Triage',
    layer: 'application_layer', category: 'ai_agents', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { containment_rate_percent: 69.8, avg_response_time_ms: 1340, escalation_rate_percent: 30.2, frontier_task_share_percent: 16.1, tasks_per_minute: 4.4 },
  },
  {
    component: 'collections-assist', label: 'Collections Assist',
    layer: 'application_layer', category: 'ai_agents', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { containment_rate_percent: 72.3, avg_response_time_ms: 1010, escalation_rate_percent: 27.7, frontier_task_share_percent: 10.4, tasks_per_minute: 3.8 },
  },

  // ─── application_layer · api_services_member ──────────────────────────────
  {
    component: 'member-profile-api', label: 'Member Profile API',
    layer: 'application_layer', category: 'api_services_member', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { response_time_ms: 84, error_rate_percent: 0.2, throughput_rps: 142.6, cpu_percent: 34.1, memory_percent: 51.8 },
  },
  {
    component: 'account-summary-api', label: 'Account Summary API',
    layer: 'application_layer', category: 'api_services_member', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { response_time_ms: 112, error_rate_percent: 0.4, throughput_rps: 98.3, cpu_percent: 41.7, memory_percent: 58.2 },
  },
  {
    component: 'auth-api', label: 'Authentication API',
    layer: 'application_layer', category: 'api_services_member', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { response_time_ms: 46, error_rate_percent: 0.1, throughput_rps: 210.4, cpu_percent: 28.9, memory_percent: 44.3 },
  },

  // ─── application_layer · orchestration ────────────────────────────────────
  {
    component: 'turn-orchestrator', label: 'Turn Orchestrator',
    layer: 'application_layer', category: 'orchestration', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { response_time_ms: 62, error_rate_percent: 0.3, throughput_rps: 74.2, cpu_percent: 46.8, memory_percent: 62.1 },
  },
  {
    component: 'tool-router', label: 'Tool Router',
    layer: 'application_layer', category: 'orchestration', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { response_time_ms: 38, error_rate_percent: 0.2, throughput_rps: 88.7, cpu_percent: 32.4, memory_percent: 47.9 },
  },
  {
    component: 'context-assembler', label: 'Context Assembler',
    layer: 'application_layer', category: 'orchestration', state: 'recovering',
    lastUpdated: BASE_TS,
    metrics: { response_time_ms: 240, error_rate_percent: 1.8, throughput_rps: 52.1, cpu_percent: 68.3, memory_percent: 74.6 },
  },

  // ─── data_layer · knowledge_graph ─────────────────────────────────────────
  {
    component: 'neo4j-kag-primary', label: 'Neo4j KAG — Primary',
    layer: 'data_layer', category: 'knowledge_graph', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { cpu_percent: 42.6, memory_percent: 61.4, active_connections: 84, query_latency_ms: 24.8, cache_hit_rate_percent: 94.2 },
  },
  {
    component: 'neo4j-kag-replica-01', label: 'Neo4j KAG — Replica 01',
    layer: 'data_layer', category: 'knowledge_graph', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { cpu_percent: 28.3, memory_percent: 54.1, active_connections: 41, query_latency_ms: 19.2, cache_hit_rate_percent: 96.1 },
  },
  {
    component: 'neo4j-kag-replica-02', label: 'Neo4j KAG — Replica 02',
    layer: 'data_layer', category: 'knowledge_graph', state: 'degraded',
    lastUpdated: BASE_TS,
    metrics: { cpu_percent: 79.4, memory_percent: 86.2, active_connections: 118, query_latency_ms: 184.6, cache_hit_rate_percent: 71.3 },
  },

  // ─── data_layer · routing_log ─────────────────────────────────────────────
  {
    component: 'pg-routing-log-primary', label: 'Routing Log — Primary',
    layer: 'data_layer', category: 'routing_log', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { cpu_percent: 38.1, memory_percent: 57.9, active_connections: 96, query_latency_ms: 12.4, replication_lag_ms: 18 },
  },
  {
    component: 'pg-routing-log-replica', label: 'Routing Log — Replica',
    layer: 'data_layer', category: 'routing_log', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { cpu_percent: 24.7, memory_percent: 48.3, active_connections: 34, query_latency_ms: 9.8, replication_lag_ms: 42 },
  },

  // ─── data_layer · cost_records ────────────────────────────────────────────
  {
    component: 'pg-litellm-cost', label: 'LiteLLM Cost Records',
    layer: 'data_layer', category: 'cost_records', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { cpu_percent: 19.6, memory_percent: 41.2, active_connections: 22, query_latency_ms: 8.1, replication_lag_ms: 12 },
  },

  // ─── data_layer · vector_store ────────────────────────────────────────────
  {
    component: 'vector-index-policy-docs', label: 'Policy Docs Index',
    layer: 'data_layer', category: 'vector_store', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { cpu_percent: 33.4, memory_percent: 66.8, query_latency_ms: 31.2, index_size_gb: 18.4, embedding_latency_ms: 42.6 },
  },
  {
    component: 'vector-index-transcripts', label: 'Transcript Index',
    layer: 'data_layer', category: 'vector_store', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { cpu_percent: 47.2, memory_percent: 72.1, query_latency_ms: 48.9, index_size_gb: 64.2, embedding_latency_ms: 58.3 },
  },

  // ─── infrastructure_layer · slm_inference ─────────────────────────────────
  {
    component: 'slm-inference-pool-01', label: 'SLM Inference Pool 01',
    layer: 'infrastructure_layer', category: 'slm_inference', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { gpu_utilization_percent: 64.2, memory_percent: 58.4, inference_latency_ms: 182, queue_depth: 3, tokens_per_second: 1840, temperature_celsius: 68.4 },
  },
  {
    // The upstream cause of Card Disputes degrading — queue saturation here is
    // what the RCA on that agent points to. The two event logs corroborate.
    component: 'slm-inference-pool-02', label: 'SLM Inference Pool 02',
    layer: 'infrastructure_layer', category: 'slm_inference', state: 'degraded',
    lastUpdated: BASE_TS,
    metrics: { gpu_utilization_percent: 94.8, memory_percent: 88.1, inference_latency_ms: 2140, queue_depth: 47, tokens_per_second: 410, temperature_celsius: 84.2 },
  },
  {
    component: 'slm-inference-pool-03', label: 'SLM Inference Pool 03',
    layer: 'infrastructure_layer', category: 'slm_inference', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { gpu_utilization_percent: 58.6, memory_percent: 52.3, inference_latency_ms: 164, queue_depth: 2, tokens_per_second: 1920, temperature_celsius: 65.1 },
  },

  // ─── infrastructure_layer · model_gateway ─────────────────────────────────
  {
    component: 'litellm-gateway-01', label: 'LiteLLM Gateway 01',
    layer: 'infrastructure_layer', category: 'model_gateway', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { requests_per_second: 48.2, p95_latency_ms: 218, error_rate_percent: 0.3, cpu_percent: 44.6, memory_percent: 56.2 },
  },
  {
    component: 'litellm-gateway-02', label: 'LiteLLM Gateway 02',
    layer: 'infrastructure_layer', category: 'model_gateway', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { requests_per_second: 51.7, p95_latency_ms: 204, error_rate_percent: 0.2, cpu_percent: 47.1, memory_percent: 58.9 },
  },

  // ─── infrastructure_layer · container_platform ────────────────────────────
  {
    component: 'aks-node-pool-ai', label: 'AKS Node Pool — AI',
    layer: 'infrastructure_layer', category: 'container_platform', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { cpu_percent: 62.4, memory_percent: 68.1, pod_restarts: 2, node_count: 12 },
  },
  {
    component: 'aks-node-pool-data', label: 'AKS Node Pool — Data',
    layer: 'infrastructure_layer', category: 'container_platform', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { cpu_percent: 48.7, memory_percent: 59.3, pod_restarts: 0, node_count: 8 },
  },

  // ─── network_layer · frontier_egress ──────────────────────────────────────
  {
    // THE component. `pii_blocked_count` is Gate 1 rendered as telemetry — the
    // sovereignty claim ("0 PII to frontier") observable in real time. If this
    // ever reads healthy while PII escapes, the demo's whole claim breaks.
    component: 'frontier-egress-gateway', label: 'Frontier Egress Gateway',
    layer: 'network_layer', category: 'frontier_egress', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { pii_blocked_count: 34, egress_requests_per_minute: 8.4, p95_latency_ms: 642, tls_handshake_ms: 48, throughput_mbps: 12.6 },
  },
  {
    component: 'egress-policy-enforcer', label: 'Egress Policy Enforcer',
    layer: 'network_layer', category: 'frontier_egress', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { pii_blocked_count: 34, egress_requests_per_minute: 8.4, p95_latency_ms: 12, tls_handshake_ms: 0, throughput_mbps: 12.6 },
  },

  // ─── network_layer · private_endpoints ────────────────────────────────────
  {
    component: 'azure-pe-openai', label: 'Private Endpoint — Azure OpenAI',
    layer: 'network_layer', category: 'private_endpoints', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { p95_latency_ms: 18, tls_handshake_ms: 22, throughput_mbps: 48.2, error_rate_percent: 0.0 },
  },
  {
    component: 'azure-pe-storage', label: 'Private Endpoint — Storage',
    layer: 'network_layer', category: 'private_endpoints', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { p95_latency_ms: 12, tls_handshake_ms: 16, throughput_mbps: 128.6, error_rate_percent: 0.0 },
  },
  {
    component: 'azure-pe-neo4j', label: 'Private Endpoint — Neo4j',
    layer: 'network_layer', category: 'private_endpoints', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { p95_latency_ms: 9, tls_handshake_ms: 14, throughput_mbps: 64.1, error_rate_percent: 0.0 },
  },

  // ─── network_layer · api_gateway ──────────────────────────────────────────
  {
    component: 'apim-contact-center', label: 'APIM — Contact Center',
    layer: 'network_layer', category: 'api_gateway', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { requests_per_second: 184.2, p95_latency_ms: 62, error_rate_percent: 0.4, throughput_mbps: 96.4 },
  },
  {
    component: 'apim-member-portal', label: 'APIM — Member Portal',
    layer: 'network_layer', category: 'api_gateway', state: 'healthy',
    lastUpdated: BASE_TS,
    metrics: { requests_per_second: 96.8, p95_latency_ms: 74, error_rate_percent: 0.6, throughput_mbps: 52.8 },
  },
];

/**
 * Per-component agent activity. Chronological, oldest → newest (the UI reverses).
 *
 * The remediation arc stops at "awaiting approval" → "approved by D. Okonkwo"
 * → "completed". Agents never execute unattended; that's a deliberate scope
 * line, not an omission.
 */
// `component` is stamped on by the getter, so the fixture doesn't repeat the id
// on all ~50 rows.
type ActivityFixture = Omit<ActivityEvent, 'component'>;

const ACTIVITY: Record<string, ActivityFixture[]> = {
  'card-disputes-assist': [
    { message: 'Containment rate crossed lower threshold (65%) — 61.2%', timestamp: minutesAgo(30) },
    { message: 'State changed to DEGRADED', timestamp: minutesAgo(30) },
    { message: 'Orchestrator opened investigation INV-4471', timestamp: minutesAgo(30) },
    { message: 'RCA Agent: correlating with upstream dependencies', timestamp: minutesAgo(29) },
    { message: 'RCA Result: upstream_slm_queue_saturation, Confidence: 86.0%', timestamp: minutesAgo(29) },
    { message: 'Contributing signal: slm-inference-pool-02 queue depth 47 (baseline 3)', timestamp: minutesAgo(29) },
    { message: 'Contributing signal: avg response time 2840ms (baseline 1010ms)', timestamp: minutesAgo(29) },
    { message: 'Ruled out: model drift — accuracy within tolerance over 14d', timestamp: minutesAgo(29) },
    { message: 'Ruled out: frontier routing — task share 8.8%, below policy ceiling', timestamp: minutesAgo(29) },
    { message: 'Recommended action: scale slm-inference-pool-02 to 4 replicas — awaiting approval', timestamp: minutesAgo(28) },
    { message: 'Notified: D. Okonkwo (Platform Administrator)', timestamp: minutesAgo(28) },
    { message: 'Gate 1 verified during incident: 0 PII fields routed to frontier', timestamp: minutesAgo(28) },
    { message: 'Awaiting human approval — no action executed', timestamp: minutesAgo(1) },
  ],
  'slm-inference-pool-02': [
    { message: 'GPU utilization crossed upper threshold (90%) — 94.8%', timestamp: minutesAgo(34) },
    { message: 'Queue depth 47 exceeds capacity target of 10', timestamp: minutesAgo(34) },
    { message: 'State changed to DEGRADED', timestamp: minutesAgo(34) },
    { message: 'RCA Agent: analyzing inference workload distribution', timestamp: minutesAgo(33) },
    { message: 'RCA Result: slm_inference_queue_saturation, Confidence: 91.0%', timestamp: minutesAgo(33) },
    { message: 'Contributing signal: card disputes batch re-scoring started', timestamp: minutesAgo(33) },
    { message: 'Contributing signal: tokens/sec fell 1840 → 410', timestamp: minutesAgo(33) },
    { message: 'Downstream impact: card-disputes-assist DEGRADED', timestamp: minutesAgo(33) },
    { message: 'Recommended action: scale to 4 replicas — awaiting approval', timestamp: minutesAgo(32) },
    { message: 'Policy check: scale-out within approved cost envelope (DG-11)', timestamp: minutesAgo(32) },
    { message: 'Awaiting human approval — no action executed', timestamp: minutesAgo(1) },
  ],
  'neo4j-kag-replica-02': [
    { message: 'Query latency crossed upper threshold (100ms) — 184.6ms', timestamp: minutesAgo(21) },
    { message: 'State changed to DEGRADED', timestamp: minutesAgo(21) },
    { message: 'RCA Agent: analyzing query plan and cache behaviour', timestamp: minutesAgo(20) },
    { message: 'RCA Result: cache_eviction_thrash, Confidence: 74.0%', timestamp: minutesAgo(20) },
    { message: 'Contributing signal: cache hit rate fell 96.1% → 71.3%', timestamp: minutesAgo(20) },
    { message: 'Recommended action: increase page cache to 8GB — awaiting approval', timestamp: minutesAgo(20) },
    { message: 'Read traffic shifted to neo4j-kag-replica-01 — no member impact', timestamp: minutesAgo(20) },
    { message: 'Awaiting human approval — no action executed', timestamp: minutesAgo(1) },
  ],
  'context-assembler': [
    { message: 'Error rate crossed upper threshold (1.0%) — 2.4%', timestamp: minutesAgo(51) },
    { message: 'State changed to FAILED', timestamp: minutesAgo(51) },
    { message: 'RCA Agent: analyzing failure signature', timestamp: minutesAgo(51) },
    { message: 'RCA Result: context_window_overflow, Confidence: 88.0%', timestamp: minutesAgo(50) },
    { message: 'Recommended action: restart pod with raised truncation limit — awaiting approval', timestamp: minutesAgo(50) },
    { message: 'Action approved by D. Okonkwo', timestamp: minutesAgo(47) },
    { message: 'Starting action: restart pod context-assembler', timestamp: minutesAgo(47) },
    { message: 'Action completed: restart pod — SUCCESS', timestamp: minutesAgo(46) },
    { message: 'State changed to RECOVERING', timestamp: minutesAgo(46) },
    { message: 'Verification: error rate 1.8% and falling — monitoring for 60s', timestamp: minutesAgo(46) },
    { message: 'Verification passed: error rate within tolerance', timestamp: minutesAgo(45) },
  ],
  'frontier-egress-gateway': [
    { message: 'Gate 1 blocked frontier egress: PII detected in field member_ssn (DG-07)', timestamp: minutesAgo(27) },
    { message: 'Task rerouted to in-environment SLM — no egress', timestamp: minutesAgo(27) },
    { message: 'Gate 1 blocked frontier egress: PII detected in field account_number (DG-07)', timestamp: minutesAgo(22) },
    { message: 'Task rerouted to in-environment SLM — no egress', timestamp: minutesAgo(22) },
    { message: 'Gate 2 allowed: spike analysis — non-PII signals only, frontier eligible', timestamp: minutesAgo(17) },
    { message: 'Egress permitted to Claude Sonnet (Azure) — 0 PII fields in payload', timestamp: minutesAgo(17) },
    { message: 'Gate 1 blocked frontier egress: PII detected in field member_dob (DG-07)', timestamp: minutesAgo(10) },
    { message: 'Task rerouted to in-environment SLM — no egress', timestamp: minutesAgo(10) },
    { message: 'Daily assertion: 34 PII blocks, 0 PII fields egressed', timestamp: minutesAgo(2) },
  ],
};

/** Fallback for the healthy components with no incident to report. */
const STEADY_ACTIVITY: ActivityFixture[] = [
  { message: 'Health check passed — all metrics within tolerance', timestamp: minutesAgo(2) },
  { message: 'No agent intervention required', timestamp: minutesAgo(2) },
];

/**
 * State history per component (oldest → newest), for the state timeline. Only
 * components with a story deviate from steady healthy.
 */
const STATE_HISTORY: Record<string, ComponentState[]> = {
  'card-disputes-assist': ['healthy', 'healthy', 'healthy', 'healthy', 'degraded', 'degraded', 'degraded', 'degraded'],
  'slm-inference-pool-02': ['healthy', 'healthy', 'healthy', 'degraded', 'degraded', 'degraded', 'degraded', 'degraded'],
  'neo4j-kag-replica-02': ['healthy', 'healthy', 'healthy', 'healthy', 'healthy', 'degraded', 'degraded', 'degraded'],
  'context-assembler': ['healthy', 'healthy', 'failed', 'failed', 'recovering', 'recovering', 'recovering', 'recovering'],
};

/** System health trend — % healthy over the last 12 intervals. */
const HEALTH_TREND = [97.1, 97.1, 94.3, 94.3, 91.4, 91.4, 91.4, 88.6, 88.6, 88.6, 88.6, 88.6];

export interface RootCause {
  finding: string;
  /** Percent, 0–100. Shown to 1dp. */
  confidence: number;
  evidence: string[];
  /** What the RCA agent considered and eliminated — this is what makes it read
   *  as diagnosis rather than a threshold alert. */
  ruledOut: string[];
  recommendation: string;
  /** The governing rule the recommendation was checked against. */
  policy: string;
  /** `awaiting_approval` is the resting state: agents recommend, humans approve.
   *  `completed` records an action a human already approved. */
  status: 'awaiting_approval' | 'completed';
  /** Present only when status === 'completed'. */
  outcome?: string;
}

/**
 * Structured RCA per component. The event log narrates this; the RCA card
 * renders it. Both read from here so they can't tell different stories.
 */
const ROOT_CAUSES: Record<string, RootCause> = {
  'card-disputes-assist': {
    finding: 'Upstream SLM queue saturation',
    confidence: 86.0,
    evidence: [
      'slm-inference-pool-02 queue depth 47, against a baseline of 3',
      'Avg response time 2,840ms, against a baseline of 1,010ms',
      'Containment fell to 61.2%, below the 65% threshold',
    ],
    ruledOut: [
      'Model drift — accuracy within tolerance across 14 days',
      'Frontier routing — task share 8.8%, below the policy ceiling',
    ],
    recommendation: 'Scale slm-inference-pool-02 to 4 replicas',
    policy: 'DG-11 — scale-out within approved cost envelope',
    status: 'awaiting_approval',
  },
  'slm-inference-pool-02': {
    finding: 'SLM inference queue saturation',
    confidence: 91.0,
    evidence: [
      'GPU utilization 94.8%, above the 90% threshold',
      'Queue depth 47 against a capacity target of 10',
      'Throughput fell from 1,840 to 410 tokens/sec',
    ],
    ruledOut: [
      'Node failure — all 3 pool members reporting healthy',
      'Memory pressure — within limits at 88.1%',
    ],
    recommendation: 'Scale to 4 replicas',
    policy: 'DG-11 — scale-out within approved cost envelope',
    status: 'awaiting_approval',
  },
  'neo4j-kag-replica-02': {
    finding: 'Page cache eviction thrash',
    confidence: 74.0,
    evidence: [
      'Cache hit rate fell from 96.1% to 71.3%',
      'Query latency 184.6ms, above the 100ms threshold',
    ],
    ruledOut: ['Replication lag — primary in sync', 'Query plan regression — plans unchanged'],
    recommendation: 'Increase page cache to 8GB',
    policy: 'DG-11 — scale-out within approved cost envelope',
    status: 'awaiting_approval',
  },
  'context-assembler': {
    finding: 'Context window overflow',
    confidence: 88.0,
    evidence: ['Error rate peaked at 2.4%, above the 1.0% threshold', 'Failures clustered on multi-turn sessions'],
    ruledOut: ['Downstream timeout — tool router healthy'],
    recommendation: 'Restart pod with a raised truncation limit',
    policy: 'DG-09 — in-place restart, no data migration',
    status: 'completed',
    outcome: 'Approved by D. Okonkwo · restart succeeded · verification passed',
  },
};

// ─── Live simulation ────────────────────────────────────────────────────────
// Seeded, not random: a demo has to tell the same story every run. mulberry32
// keyed by component+metric+tick means values move but are reproducible, and a
// reload never invents a different platform.

function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * ±`spread`% jitter around a baseline, clamped to [0, max] where known.
 *
 * Counters are special-cased: they climb monotonically from the baseline rather
 * than oscillating around it, because a cumulative tally that ticks *down* is
 * self-evidently fake — and `pii_blocked_count` is the number this audience
 * will scrutinise hardest.
 */
function jitter(baseline: number, key: string, tick: number, spread = 0.06): number {
  const metric = key.split('|')[1] ?? '';
  const meta = METRIC_META[metric];

  if (COUNTER_METRICS.has(metric)) {
    // Monotonic: a deterministic increment every few ticks, never a decrease.
    let total = baseline;
    for (let t = 1; t <= Math.max(0, tick); t += 1) {
      if (mulberry32(hash(`${key}:${t}`))() > 0.72) total += 1;
    }
    return total;
  }

  const rand = mulberry32(hash(`${key}:${tick}`))();
  const delta = (rand - 0.5) * 2 * spread * (baseline || 1);
  let value = baseline + delta;
  if (value < 0) value = 0;
  if (meta?.max != null && value > meta.max) value = meta.max;
  // Integer-valued metrics stay integers; 2dp otherwise.
  const isCount = /depth|connections|node_count/.test(metric);
  return isCount ? Math.round(value) : Math.round(value * 100) / 100;
}

/** History window a metric panel plots (oldest → newest). */
export const METRIC_WINDOW = 20;

/**
 * A metric's recent series, ending at `tick`. Derived from the same seeded
 * jitter as the live value, so the last point of the series always equals the
 * value shown on the tile — they can't drift apart.
 */
export function metricSeries(componentId: string, metric: string, baseline: number, tick: number) {
  const out: Array<{ t: number; value: number }> = [];
  for (let i = METRIC_WINDOW - 1; i >= 0; i -= 1) {
    const t = tick - i;
    out.push({ t, value: jitter(baseline, `${componentId}|${metric}`, t) });
  }
  return out;
}

// ─── Data access ────────────────────────────────────────────────────────────
// Swap the bodies below to API calls when ready. Components stay untouched.
// The `tick` argument is a simulation artifact — a live API drops it and just
// returns whatever the simulator currently reports.

export async function getCategories(): Promise<CategoryRow[]> {
  const seen = new Map<string, LayerId>();
  for (const c of COMPONENTS) if (!seen.has(c.category)) seen.set(c.category, c.layer);
  return [...seen.entries()]
    .map(([category, layer]) => ({ category, layer }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export async function getComponents(filter: { category?: string; layer?: LayerId } = {}) {
  return COMPONENTS.filter(
    (c) => (!filter.category || c.category === filter.category) && (!filter.layer || c.layer === filter.layer),
  );
}

export async function getComponent(componentId: string) {
  return COMPONENTS.find((c) => c.component === componentId) ?? null;
}

/**
 * NOTE ON `series`: the documented endpoint returns point values only — Grafana's
 * charts come from its own TSDB. A live client would keep a ring buffer of polls,
 * which means charts start empty and fill over minutes: useless for a 2-minute
 * demo. So the getter ships pre-baked history alongside the current reading, and
 * the last point of every series IS the current reading by construction (both
 * come from the same jitter call). When the real endpoint lands, this getter
 * keeps the buffer instead of computing it — the shape the components see is
 * unchanged either way.
 */
export async function getComponentMetrics(componentId: string, tick = 0) {
  const c = COMPONENTS.find((x) => x.component === componentId);
  if (!c) return null;
  const metrics: Record<string, number> = {};
  const series: Record<string, Array<{ t: number; value: number }>> = {};
  for (const [key, baseline] of Object.entries(c.metrics)) {
    metrics[key] = jitter(baseline, `${componentId}|${key}`, tick);
    series[key] = metricSeries(componentId, key, baseline, tick);
  }
  return {
    component: c.component,
    layer: c.layer,
    category: c.category,
    state: c.state,
    metrics_count: Object.keys(metrics).length,
    metrics,
    series,
  };
}

export async function getComponentActivity(componentId: string) {
  const events = ACTIVITY[componentId] ?? STEADY_ACTIVITY;
  const withComponent = events.map((e) => ({ ...e, component: componentId }));
  return { component: componentId, total_events: withComponent.length, events: withComponent };
}

/** Null for a healthy component — nothing to diagnose, so no card renders. */
export async function getRootCause(componentId: string): Promise<RootCause | null> {
  return ROOT_CAUSES[componentId] ?? null;
}

export async function getComponentStateHistory(componentId: string): Promise<ComponentState[]> {
  const c = COMPONENTS.find((x) => x.component === componentId);
  return STATE_HISTORY[componentId] ?? Array<ComponentState>(8).fill(c?.state ?? 'healthy');
}

/**
 * DERIVED, not authored. Totals, health counts and per-layer health are all
 * computed from COMPONENTS so they cannot contradict the tables below them —
 * the same discipline that keeps the cost report's rows summing to its footer.
 * observabilityData.test.ts asserts it.
 */
export async function getSystemOverview() {
  const byState = (s: ComponentState) => COMPONENTS.filter((c) => c.state === s).length;
  const layers = (Object.keys(LAYER_LABELS) as LayerId[]).map((id) => {
    const members = COMPONENTS.filter((c) => c.layer === id);
    const healthy = members.filter((c) => c.state === 'healthy').length;
    return {
      id,
      label: LAYER_LABELS[id],
      total: members.length,
      healthy,
      // Percent of this layer's components reporting healthy.
      health: members.length ? Math.round((healthy / members.length) * 1000) / 10 : 100,
    };
  });
  return {
    total: COMPONENTS.length,
    healthy: byState('healthy'),
    degraded: byState('degraded'),
    failed: byState('failed'),
    recovering: byState('recovering'),
    layers,
    trend: HEALTH_TREND,
  };
}

/**
 * The cross-surface bridge: turn 6's agent health ↔ this page's component
 * states. Exported so the test can assert the two never diverge, and so the
 * page can cite turn 6's task counts without duplicating them.
 */
export const AGENT_STATE_BRIDGE: Record<string, { turn6Health: string; componentId: string }> = {
  'Auto Loan Assist': { turn6Health: 'Healthy', componentId: 'auto-loan-assist' },
  'Mortgage Servicing': { turn6Health: 'Healthy', componentId: 'mortgage-servicing-assist' },
  'Card Disputes': { turn6Health: 'Watch', componentId: 'card-disputes-assist' },
};

/** turn-6 'Watch' ↔ 'degraded' here; 'Healthy' ↔ 'healthy'. */
export function turn6HealthToState(health: string): ComponentState {
  return health === 'Healthy' ? 'healthy' : 'degraded';
}
