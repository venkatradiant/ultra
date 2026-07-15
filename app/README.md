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
| `src/config/` | Client branding + mock demo credentials (`access.ts`) |
| `api/` | Vercel serverless functions (ElevenLabs TTS proxy) |

Demo logins live in `src/config/access.ts` (this is a demo, not a security
boundary). Persona is selectable via `?persona=<id>`.
