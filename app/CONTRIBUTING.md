# Contributing — the North Star architecture

This app is a **config-driven demo platform**. It renders three axes:

```
Domain   →   Client (tenant)   →   Persona (role)   →   Experience
```

The runtime never knows about a specific tenant. It resolves the active
Domain → Client → Persona from the session, loads that persona's **manifest
module**, and renders whatever the manifest declares. **All tenant knowledge is
data.** Adding a domain, client, or persona is a drop-in — you never edit shared
or runtime code.

## Where things live

| Path | What |
|---|---|
| `src/core/` | The generic runtime — never mentions a tenant. Types, registry, resolver, chat engine, validation. |
| `src/shared/workspace/PersonaWorkspace.jsx` | The one generic screen. Renders any persona from its manifest. |
| `src/domains/<domain>/` | **All** tenant/persona specifics. |
| `src/domains/index.ts` | The domain registry — the single list the runtime reads. |

A persona module is a folder with:
- `manifest.tsx` — the `PersonaManifest` (identity, flows, signals, UI config, and
  the component switchboard). May `export default` a factory `(clientId) => manifest`
  when the persona is shared across clients.
- `index.ts` — a lazy `PersonaModule` whose `load()` imports the manifest (so each
  persona code-splits into its own chunk).

## The `PersonaManifest` contract

Every per-persona rendering decision is a **field**, not a branch. See
[`src/core/types/persona.ts`](src/core/types/persona.ts). Key optional slots:

| Field | Replaces | Used by |
|---|---|---|
| `layout: 'split' \| 'inline' \| 'full'` | `INLINE_ONLY_PERSONAS` | all |
| `contextPanel` | `contextPanelRegistries[id]` | split personas |
| `inlineComponents` | `inlineComponentRegistries[id]` | inline personas |
| `statsComponent` | KPI carousel branch | capmarkets, cfo, ceo |
| `signalsComponent` | CeoHomeSignals branch | ceo |
| `initialExtras` | Data Trust Strip branch | ceo |
| `overlayComponent` + `features.overlayOpenEvent` | Presentation Mode branch | ceo |
| `briefing` | intraday dashboard + briefing panel | supervisor, director |

The runtime validates every manifest at build time (`core/runtime/validate.ts`),
so a misconfigured tenant fails loudly instead of blank-rendering.

---

## Playbook: add a new **persona** to an existing client

1. `npm run scaffold:persona <domain> <client> <personaId>` — generates the folder.
2. Fill in `manifest.tsx`: identity, capabilities, `flows`, `signals`,
   `dataSources`, `ui`, and (as needed) `contextPanel` / `inlineComponents` /
   the optional slots above.
3. Register it in the client manifest's `personas: [...]` array.
4. If the persona is selectable via login/URL, add its id to the client's list in
   `src/context/PersonaContext.jsx` and its definition in `src/data/personas.js`.
5. `npm run typecheck && npm test && npm run build`. Done — it code-splits and
   renders through `PersonaWorkspace` automatically.

## Playbook: add a new **client** (tenant)

1. Create `src/domains/<domain>/clients/<client>/client.manifest.ts` with
   `branding` + the `personas` it exposes (reuse shared factories or add
   client-specific persona folders under `clients/<client>/personas/`).
2. Add the client to its domain manifest's `clients: [...]`.
3. To make it loginable: add branding to `src/config/clients.js`, a mock
   credential to `src/config/access.ts`, its persona allowlist to
   `src/context/PersonaContext.jsx`, and (if it has a non-generic default) an
   entry in that file's `CLIENT_DEFAULT_PERSONA`.

## Playbook: add a new **domain**

This is a superset of "add a client". The **healthcare domain** is a complete,
self-contained worked example — read it end to end:

- `src/domains/healthcare/domain.manifest.ts`
- `src/domains/healthcare/clients/riverside-health/client.manifest.ts`
- `src/domains/healthcare/shared/personas/care-ops/` (inline flows/signals — no
  external data files, no bespoke components: the minimum to stand up a domain)

Then register the domain in `src/domains/index.ts` and do the loginable-client
wiring above. Log in with `riverside` / `riverside@9705` to see it.

---

## Verifying

- `npm run typecheck` · `npm test` · `npm run lint` · `npm run build` must all pass.
- Boot the dev server and drive the persona's scripted flow in the browser.
- Confirm the persona code-splits: loading it must not fetch other tenants' chunks.
