# Platform Admin Gen UI — wiring the components to live APIs

**Audience:** RK, Avantika (KAG), Charan (observability), Aditya (routing policy).
**Owner of this layer:** Venkat.
**Status:** all five components are built and rendering from static fixtures. They are API-ready.

---

## The one rule

**The components never change. Only a getter body changes.**

Everything lives behind one file:

```
src/data/nfcu/platform-admin/governanceData.ts   ← the ONLY file you touch
src/hooks/useAsyncData.js                        ← the hook the components use
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
