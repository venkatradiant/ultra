# Platform Admin Gen UI — wiring the components to live APIs

**Audience:** RK, Avantika (KAG), Charan (observability), Aditya (routing policy).
**Owner of this layer:** Venkat.
**Status:** all five Gen UI components + the Agent Observability page are built and rendering from static fixtures. They are API-ready.

---

## The one rule

**The components never change. Only a getter body changes.**

Everything lives behind two data files:

```
src/data/nfcu/platform-admin/governanceData.ts     ← turns 2–6 (Gen UI)      — the ONLY files
src/data/nfcu/platform-admin/observabilityData.ts  ← Agent Observability page   you touch
src/hooks/useAsyncData.js                          ← for getters with NO argument
src/hooks/usePolledData.js                         ← for getters WITH an argument + polling
```

Each getter is already `async` and already returns a promise. To go live, replace the body:

```ts
// before
export async function getKagSubgraph() { return KAG_SUBGRAPH; }

// after
export async function getKagSubgraph() {
  const res = await fetch('/api/kag/subgraph?field=rate');
  return res.json();          // must match the shape below, exactly
}
```

No component edit, no manifest edit, no turn edit. If you find yourself editing a component, the API is returning the wrong shape — fix the shape.

---

## The five getters

| Getter | Feeds | Turn | Flex goal |
|---|---|---|---|
| `getFieldLedger()` | Field Sovereignty Ledger | 2 | — (routing log) |
| `getKagSubgraph()` | KAG Node View (Neo4j NVL) | 3 | **RK + Avantika — flex 1** |
| `getRoutingMermaid()` | Routing Logic Diagram (Mermaid) | 4 | **RK + Avantika — flex 2** |
| `getCostReport()` | LLM Cost and Usage Report | 5 | — (LiteLLM) |
| `getGovernance()` | Agent Observability & Governance Dashboard | 6 | **Charan — flex** |

---

## Contracts

### `getKagSubgraph()` → KAG Node View

```ts
{
  nodes: [ { id: 'rate', caption: 'Current Auto Loan Rate', group: 'field-internal' } ],
  rels:  [ { id: 'r1', from: 'rate', to: 'dyn', caption: 'originates in' } ],
  policyCard: { id: 'DG-04', title: '…', body: '…' }
}
```

- `group` ∈ `field-pii` | `field-internal` | `source` | `policy`.
  **Return the group, not a colour.** The group drives the node colour *and* the legend from one map in the component — so they can never drift apart. A colour in the payload is ignored.
- `rels[].from` / `to` must match a `nodes[].id`. An orphan edge silently disappears.
- Keep it a **bounded subgraph** — the flagged field, its source system, its governing policy. The spec is explicit that we return a bounded subgraph, not the whole graph, and that Neo4j stays backend-only.
- `policyCard` renders beside the graph and explains *why* the field stayed local.

### `getRoutingMermaid()` → Routing Logic Diagram

Returns a **Mermaid v11 flowchart string** (not an object):

```
flowchart LR
  A[Field tagging] --> B{Safe to send?}
  B -- carries PII --> S[In-environment SLM]
  B -- no PII --> C{Worth sending?}
  C -- simple, SLM sufficient --> S
  C -- complex and safe --> L[Frontier LLM]
```

Must encode **both gates** — the whole point of the turn. If KAG serves this metadata, render it to this syntax server-side and return the string.

### `getGovernance()` → Observability Dashboard

```ts
{
  frontierTaskShare: '11%',                                   // string, pre-formatted
  agents: [ { name: 'Auto Loan Assist', health: 'Healthy', tasks: 412, frontier: 46 } ],
  spendTrend: [0.42, 0.48, 0.55, 0.51, 0.63],                 // numbers; drives the sparkline
  sampleAction: {
    query: '…', action: '…',
    context: 'Quality scorecard, call transcript, 3 prior calls',   // ⚠ comma-separated STRING
    chainOfThought: '…',
    policy: 'QA-12, coaching thresholds'
  }
}
```

- `health` ∈ `Healthy` | `Watch` (anything else styles as Watch).
- ⚠ **`context` must be a comma-separated string, not an array.** The component does `context.split(',')` to build the chips — an array will throw. If your API returns a list, `.join(', ')` it in the getter.
- `spendTrend` — plain numbers, any length; the sparkline scales itself.

### `getFieldLedger()` → Field Sovereignty Ledger

```ts
{
  badge: '0 PII to frontier',
  fields: [ { field: 'Member SSN', sensitivity: 'PII', model: 'SLM', reason: 'PII (DG-07) — kept in-environment' } ],
  frontierTask: { task: '…', model: 'Frontier (Claude Sonnet)', inputs: 'Non-PII signals: …', pii: 0 }
}
```

- `sensitivity` ∈ `PII` | `Sensitive-Internal` | `Public`.
- **`model` is always `'SLM'` for every field row.** Fields never route to the frontier — tasks do. The frontier appears exactly once, in `frontierTask`. If a field row ever comes back `Frontier`, the routing has a bug and the demo's whole claim breaks.

### `getCostReport()` → Cost and Usage Report

```ts
{
  rows: [ { task, complexity, model: 'SLM'|'Frontier', piiToFrontier: 0, cost: 0.041, justification? } ],
  footer: { totalTasks, frontierTasks, tokenSplit, total, allFrontier, saved }
}
```

- `justification` is required on `Frontier` rows (it renders under the task name); ignored on SLM rows.
- **`rows` must reconcile to `footer`** — row count = `totalTasks`, frontier count = `frontierTasks`, `Σ cost` = `total`. The current fixture is exact: 21 SLM ($0.506) + 3 frontier ($0.124) = **$0.63**, vs `allFrontier` $2.18 → **71% saved**. A technical audience will add the column up.

---

---

## The Agent Observability page (`observabilityData.ts`)

Separate page, separate data file, same rule. This page is `ds-pa-07` ("Grafana (via API)") realised — the telemetry pulled through an API and re-rendered as Gen UI rather than an embedded Grafana panel.

**Its getters map 1:1 onto Charan's documented endpoints**, so going live is one `fetch` each:

| Getter | Endpoint | Poll |
|---|---|---|
| `getCategories()` | `GET /api/categories` | — |
| `getComponents({category, layer})` | `GET /api/components?category=&layer=` | — |
| `getComponent(id)` | `GET /api/components/{id}` | — |
| `getComponentMetrics(id)` | `GET /api/components/{id}/metrics` | 5s |
| `getComponentActivity(id)` | `GET /api/components/{id}/activity` | 3s |
| `getRootCause(id)` | **no endpoint yet — needs one** | — |
| `getSystemOverview()` | **derived client-side, do not add an endpoint** | — |

### Four things to get right

1. **`getSystemOverview()` is derived, and must stay derived.** Totals, health counts and the four layer gauges are computed from the components list. If a future endpoint returns its own totals, the header will eventually contradict the table underneath it in front of a client. `observabilityData.test.ts` asserts the reconciliation — keep it passing.

2. **`series` is a fixture convenience.** The real `/metrics` returns point values only (Grafana's charts come from its own TSDB). A live client must keep a ring buffer of polls — which means charts start empty and fill over minutes, useless for a 2-minute demo. So the getter ships pre-baked history next to the current reading, and *the last point of each series IS the current reading* (same jitter call). When you go live, keep the buffer in the getter; the components don't change.

3. **`pii_blocked_count` is a counter, not a gauge** (see `COUNTER_METRICS`). It renders as a value + "cumulative today", never a line — a chart of a monotonic tally is meaningless, and this is the Gate 1 number the room scrutinises hardest. A counter that ticks *down* would discredit the sovereignty claim on the spot.

4. **Remediation is recommend-only, by design.** Agents detect → RCA (with confidence) → recommend; a human approves. The NFCU spec doesn't claim autonomous remediation, so nothing in the event log may show an executed action without a preceding approval — there's a test asserting exactly that. If the backend ever auto-executes, that's a product decision, not a data-shape change.

### `getRootCause(id)` → the RCA card

```ts
{
  finding: 'Upstream SLM queue saturation',
  confidence: 86.0,                       // number, 0–100
  evidence: ['…'],                        // why it concluded this
  ruledOut: ['…'],                        // what it eliminated — this is what makes it a
                                          // diagnosis rather than a threshold alert
  recommendation: 'Scale slm-inference-pool-02 to 4 replicas',
  policy: 'DG-11 — scale-out within approved cost envelope',
  status: 'awaiting_approval' | 'completed',
  outcome?: '…',                          // required when status === 'completed'
}
```
Return `null` for a healthy component. There is **no endpoint for this yet** — it's the one genuinely new contract this page needs.

### ⚠ `useAsyncData` vs `usePolledData`

`useAsyncData`'s deps are `[getter]`, so it only accepts a **stable module-scope function with no arguments**. Every observability getter takes an id, so `useAsyncData(() => getComponent(id))` hands it a new identity each render and refetches forever. Use **`usePolledData(getter, key, { intervalMs })`** for those — it reads the getter through a ref and keys the effect on `key` only. Don't "fix" `useAsyncData`; five shipped components depend on its current behaviour.

---

## Gotchas that will cost you a morning

1. **NVL `layout: 'forceDirected'` collapses a small graph onto a single point.**
   Use **`layout: 'd3Force'`**. NVL's own types deprecate `forceDirected` for small datasets. Verified live — NVL's accessibility string reads: *"A graph visualization with 5 nodes and 4 relationships, displayed using a d3Force layout."*

2. **NVL renders to `<canvas>`, not DOM/SVG.** Two canvases (one WebGL, one 2d) at 2× backing resolution. Consequences: colours must arrive **through the data** (`group`), CSS can't style the graph, and nodes aren't inspectable in devtools.

3. **Mermaid needs a DOM-safe unique id.** `useId()` returns `:r0:`-style ids that mermaid rejects → `useId().replace(/:/g,'')`. `mermaid.render()` is async and returns `{ svg }`.

4. **This is a Vite SPA with no SSR.** The build companion's `dynamic(() => import(...), { ssr: false })` advice is Next-specific and does **not** apply. Import directly.

---

## Async + failure behaviour

`useAsyncData(getter)` returns `null` until the promise resolves; every component renders `null` while null. So a slow API degrades to an empty card rather than a crash.

**There is no error or loading UI yet.** A rejected promise currently renders nothing. If your API can realistically fail or be slow in front of a client, that's the first thing to add — say the word and it's a small change to the hook, still with no component edits.

---

## Known debt

- **Bundle**: main chunk is ~2.6MB (was ~810kB) because NVL + mermaid land in the eagerly-imported Governance route. Fix is `React.lazy` on `PlatformAdminGovernance`. Deferred — fine over localhost, worth doing before any hosted deploy.
- Components verified at ~800px width only; not yet checked at projector/mobile widths.
