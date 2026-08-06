# TrackLynk.AI — visualization stack recommendation

**To:** Lam Huynh, Director of Digital Experience
**From:** Venkat (design/build)
**Re:** Round-1 feedback, change 3 — "run a short tooling evaluation… return a one-page
recommendation for sign-off before you build the spatial views"
**Date:** 2026-08-06

---

## Recommendation in one line

**Adopt MapLibre GL for both the outdoor site GIS and the indoor plan; add three.js only for the
3D interior toggle. Reject deck.gl, React Three Fiber, xeokit, CesiumJS and Potree for this
build.** The whole spatial layer runs offline, with no API key, no tile server, and no
third-party request at runtime. Two dependencies, 386 KB gzipped between them, both lazily
loaded so neither reaches the initial bundle.

---

## The RTLS baseline — now closed

You asked me to review the current RTLS interface before building the spatial views. That
reference has since arrived (screen captures of the deployed **Synapse / TrackLynk** console:
Configure Site, Site Infrastructure, Site View, Muster Event, Muster Control Center, Logs). It is
now the baseline this prototype is built against rather than an open question.

**What the console does well, and we now do the same way:**

| Console pattern | Where it lands here |
|---|---|
| Site boundary drawn in red with its vertices exposed | `MapCanvas` — `perimeter-line` + `perimeter-vertex` |
| Zones as translucent fills with **dashed** borders, each with a type, an icon and an occupancy | `zone-fill` / `zone-line`; `zoneType`, `icon`, `occupancy` in `site.geo.json` |
| Click anything → a card with an icon tile, name, type chip and labelled fields | `MapFeatureCard` — zone, entity, device, muster point and gate variants |
| Entity card shows Entity ID, Tag ID, Tag Type, Event Type, **Inside Zone**, coordinates | `MapFeatureCard` entity variant, joined by `lib/rtlsIdentity.js` |
| The RTLS estate itself on the map — Bridgeport gateways, Beacon RF ATEX anchors | `infra` features, behind the **RTLS estate** toggle |
| Gate markers carrying an in/out glyph | `SiteMapPanel` gate marker |
| A live cursor coordinate readout across the foot of the map | `SiteMapPanel` readout strip |
| Zoom control bottom-right | `NavigationControl`, repositioned |
| Muster Control Center: not-started / mustering / mustered, progress ring, in/out, duration | `MusterControlCenter` |
| Entity–muster-zone allocation with 0–50 / 51–80 / 81–100 / >100 load bands | `MusterBoard` allocation cards |
| Muster catchment drawn as a radius ring | `musterRadius` features, on for the muster view |

**Where we deliberately go past it,** which is the "elevate, not restate" part of the brief:

- The console shows *where people are*. This shows **where people are against the permit that
  authorises them to be there** — the fusion that produces the three flagged jobs is not something
  either the permit system or the location feed can do alone.
- The console has no **indoor** view. The Unit 3 confined-space interior — IMDF-shaped plan plus a
  3D toggle that puts the entrants visibly *below* the deck with the standby person above at the
  manway — is the clearest differentiator we have.
- The console reports **events**; this reports a **ranked, reasoned brief** with provenance and
  confidence on every figure, and a defensible headcount rather than two that disagree.
- Equipment condition as an **HSE** input (the compressor's exclusion radius against the permits
  inside it) has no equivalent in the console at all.

---

## What the industry actually uses

| Category | What the field ships | Read |
|---|---|---|
| RTLS / worker location dashboards | 2D site plan or vector map, zone polygons, live dots, heat overlay for density, geofence alerts | Everyone renders a *map*, not a diagram. Our current grid of unit boxes is the outlier. |
| Site GIS / digital twin | MapLibre or Mapbox GL for 2D/2.5D; Cesium + 3D Tiles where a real scan or CAD model exists | 3D is table stakes only when there is real captured geometry behind it. Without it, 3D reads as decoration. |
| Asset performance management | Health score, alarm/condition state, remaining useful life, sensor sparkline, source + freshness | This is a well-settled card pattern. Worth copying closely rather than inventing. |
| Plant interiors | IFC/BIM viewers (xeokit, Autodesk) where a model exists; otherwise a 2D floor plan with live positions | The BIM viewers are model-loaders. With no model they have nothing to load. |

---

## The evaluation

Verified against the live npm registry, 2026-08-06.

### Adopt

| Library | Version | Licence | Size (min+gz) | Why |
|---|---|---|---|---|
| **maplibre-gl** | **5.24.0** | BSD-3 | 245 KB | A style of `background` + inline GeoJSON renders with **zero network requests** — real pan/zoom/pitch/rotate, real projection, no tile server, no key. Native `circle` and `heatmap` layers cover live worker density. |
| **three** | 0.185.1 | MIT | 141 KB (built) | Only for the 3D interior toggle, lazily loaded on demand. Used directly, without a React binding — see the R3F note below. |

**Pinned to MapLibre v5, not v6, deliberately.** v6 shipped three weeks ago, is ESM-only (breaks
the default import), forces manual `setWorkerUrl` + `optimizeDeps.exclude` wiring, and drops the
indoor plugin ecosystem's compatibility range. It buys nothing for a locally-authored style —
we already have WebGL2. Revisit when the ecosystem catches up.

### Reject

| Library | Verdict |
|---|---|
| **@react-three/fiber** | **Rejected after trying it.** R3F 9.7 is nominally the React-19 line (peer `>=19 <19.3` against our 19.2.4), but its reconciler reads React internals through `its-fine` and threw *"Invalid hook call … more than one copy of React"* with a blank canvas. `resolve.dedupe`, a cleared Vite dep cache and full reloads did not shift it. The scene is static apart from one orbiting camera, so R3F's declarative syntax was buying very little while adding a reconciler-compatibility risk on every React upgrade. Vanilla three.js in a single `useEffect` replaced it in about 200 lines and works. |
| **deck.gl** | **Not yet.** ~250 KB gz once its luma/loaders/math peers land — effectively a second MapLibre stacked on MapLibre. At our ~2,400 worker positions, MapLibre's native `circle` and `heatmap` layers do the job. **Adopt when we pass ~10,000 live positions, or when we need genuine 3D data layers.** That threshold is the trigger, and it is worth writing into the backlog rather than forgetting. |
| **xeokit** | **No.** Two independent reasons. It is **AGPL-3.0** — a commercial licence from Creoox is required for anything closed-source, which is a legal conversation we do not need for a demo. And it is a *model loader*: with no IFC/BIM file we would be hand-authoring boxes through a 393 KB gz BIM SDK to do what three.js does in 178 KB unencumbered. Its value is IFC loading and BIM metadata; with no model there is no value. |
| **CesiumJS** | **No.** Defaults to a Cesium ion token for imagery and terrain; running it offline means shipping ~148 MB of bundled assets to render a low-resolution globe. 1.32 MB gz. Reconsider only if we obtain real 3D Tiles of a facility. |
| **Potree** | **No.** Renders nothing without a PotreeConverter-generated octree. We have no laser scan. Revisit if a client supplies point-cloud data. |

### IMDF — the useful finding

**IMDF is a data format, not a renderer.** It is GeoJSON underneath (`level`, `unit`, `footprint`,
`anchor` features), and there is no canonical open-source IMDF viewer — Apple's MapKit JS can
render it but is Apple-hosted and keyed. Every real "IMDF renderer" ends up feeding those features
to MapLibre and filtering by level.

So **the indoor plan uses the same engine as the outdoor map.** One dependency covers both halves
of the request, the interior data is authored in a real open standard's shape rather than an
invented one, and adding a second floor or a second unit later is a data change, not a build.

---

## How it slots into the existing data layer

No change to the seam. Every spatial component takes a `getter` prop defaulting to
`src/data/aramco/hse-gm/index.js`, and reads through the existing `useAsyncData` hook — the same
pattern the permit, muster and reconciliation panels already use. Swapping a live location feed in
later is a change to one accessor body and nothing else.

| Component | Reads | Fixture today | Live later |
|---|---|---|---|
| `MapCanvas` | `getSiteGeo()`, `getWorkerPositions()` | `site.geo.json`, `workers.geo.json` | Site GIS export; RTLS position stream |
| `IndoorViewer` | `getIndoorGeo()`, `getPermits()` | `indoor.geo.json` | IMDF export or a BIM-derived floor plan |
| `AssetHealthCard` | `getAssets()` | `assets.json` | APM / CMMS API |

Two build notes carried into the implementation: the map components are `React.lazy` so the
manifest test suite never instantiates WebGL in jsdom, and MapLibre and three each get a pinned
Rolldown chunk group so neither reaches the already-oversized entry bundle.

---

## What this does *not* buy us

Worth saying plainly, so the sign-off is informed:

- **No real aerial imagery.** The facility is authored geometry, not a photo. It will read as a
  precise site plan, not a satellite view. Using real imagery would mean a keyed tile provider and
  putting an identifiable facility on screen — neither of which we want for an illustrative demo.
- **No real plant geometry.** The 3D interior is a built scene, not a scan or a BIM model. It is
  honest at demo fidelity and will not survive an engineer asking to measure something.
- **The site is fictional.** Consistent with the existing data posture: Aramco is an archetypal
  target, not a customer, and no facility layout is real.

---

## Ask

Sign-off on the two adoptions and the five rejections — particularly **deck.gl**, since it was on
your shortlist and I am proposing we defer it with a defined trigger rather than take the bundle
cost now.

And a read from Sajosh on the baseline table above: I have matched the console's patterns from the
screen captures, but he will know which of them operators actually *use* versus which are there
because someone asked for them once. That is the difference between copying a UI and inheriting a
workflow, and it is the one thing the captures cannot tell me.
