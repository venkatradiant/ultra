# AI Capability Demo Platform

A config-driven, multi-tenant demo platform that showcases AI capabilities as
deterministic, scripted experiences. Built with Vite + React 19 + TypeScript +
Tailwind v4.

## The architecture in one picture

```
Domain          financial-services · healthcare · …
  └─ Client     nfcu · penfed · ussfcu · riverside_health · …
       └─ Persona  supervisor · ceo · capmarkets · care_ops · …
            └─ Experience = a PersonaManifest (flows + data + visuals + layout)
```

A **generic runtime** (`src/core`, `src/shared/workspace/PersonaWorkspace.jsx`)
renders whatever the active persona's **manifest** declares. There are no tenant
names in shared code. Adding a domain, client, or persona is a drop-in module
under `src/domains/` — see **[CONTRIBUTING.md](CONTRIBUTING.md)** for the
playbook, and `src/domains/healthcare/` for a complete self-contained example.

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build (per-persona code-splitting)
npm run typecheck    # tsc --noEmit
npm test             # vitest (runtime engine, registry, manifest validation)
npm run lint         # eslint
npm run scaffold:persona <domain> <client> <personaId>   # generate a persona stub
```

## Layout

| Path | Role |
|---|---|
| `src/core/` | Domain-agnostic runtime — types, registry, resolver, chat engine, validation |
| `src/shared/` | Reusable UI (the generic `PersonaWorkspace`) |
| `src/domains/` | **All** tenant/persona specifics + `index.ts` domain registry |
| `src/config/` | Client branding + the platform gate credential (`access.ts`) |
| `api/` | Vercel serverless functions (ElevenLabs TTS proxy) |

Sign-in is a **single parent gate** in front of the whole platform, not one
credential per client: `ultra` / `ultra@9705` gets you to the market and client
picker, and you choose a tenant from there. Appending `?access=rdvr@9705` to any
URL skips sign-in and opens the picker directly. Both are scoped to the browser
tab. See `src/config/access.ts` — this is a demo, not a security boundary; the
credential ships in the client bundle.

Persona is selectable via `?persona=<id>`.
