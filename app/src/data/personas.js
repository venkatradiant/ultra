/**
 * Persona Registry
 * Central definitions for all persona configurations.
 * URL param ?persona=<id> selects the active persona.
 */

const personas = {
  ops: {
    id: 'ops',
    name: 'Maya J.',
    initials: 'MJ',
    role: 'Operations & Analytics',
    greeting: 'Maya',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },
  cx: {
    id: 'cx',
    name: 'Priya K.',
    initials: 'PK',
    role: 'CX Transformation',
    greeting: 'Priya',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Automated Action',
    ],
  },
  retention: {
    id: 'retention',
    name: 'Derek T.',
    initials: 'DT',
    role: 'Member Retention',
    greeting: 'Derek',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Predictive Intelligence',
      'Automated Action',
    ],
  },
  risk: {
    id: 'risk',
    name: 'James R.',
    initials: 'JR',
    role: 'Risk & Fraud',
    greeting: 'James',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Anomaly Detection',
      'Automated Action',
    ],
  },

  // ─── PenFed-only Persona ──────────────────────────────────────
  // Visible only when clientId === 'penfed' (gated in PersonaContext CLIENT_PERSONAS).
  capmarkets: {
    id: 'capmarkets',
    name: 'Sowmya Ha',
    initials: 'SH',
    role: 'Capital Markets Risk',
    greeting: 'Sowmya',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },

  // ─── NFCU Personas ────────────────────────────────────────────
  nfcu_supervisor: {
    id: 'nfcu_supervisor',
    name: 'Priya Kapoor',
    initials: 'PK',
    role: 'Contact Center Operations Manager',
    greeting: 'Priya',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },
  nfcu_analyst: {
    id: 'nfcu_analyst',
    name: 'Derek Whitfield',
    initials: 'DW',
    role: 'Workforce Planning Analyst',
    greeting: 'Derek',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
    ],
  },
  nfcu_workforce: {
    id: 'nfcu_workforce',
    name: 'Janelle Moreau',
    initials: 'JM',
    role: 'Quality & Member Experience Analyst',
    greeting: 'Janelle',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Anomaly Detection',
      'Automated Action',
    ],
  },
  nfcu_director: {
    id: 'nfcu_director',
    name: 'Marcus Tillman',
    initials: 'MT',
    role: 'Director, Contact Center Operations',
    greeting: 'Marcus',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
      'Friction Observability',
    ],
  },
  // Member self-service view — the member-facing AI assistant (mobile / online
  // banking) with seamless handoff to a live agent.
  nfcu_member: {
    id: 'nfcu_member',
    name: 'Elena Ruiz',
    initials: 'ER',
    role: 'Navy Federal Member (Self-Service)',
    greeting: 'Elena',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Anomaly Detection',
      'Predictive Intelligence',
      'Automated Action',
    ],
  },
  // Agent-Assist view — live-call copilot for a contact center agent.
  nfcu_agent: {
    id: 'nfcu_agent',
    name: 'David Torres',
    initials: 'DT',
    role: 'Contact Center Agent (Agent-Assist)',
    greeting: 'David',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Anomaly Detection',
      'Predictive Intelligence',
      'Automated Action',
    ],
  },
  // Platform Administrator — AI governance & LLMOps. The only Gen-UI-wired persona;
  // tells the sovereignty-routing / KAG-provenance / tokenomics governance story.
  nfcu_platform_admin: {
    id: 'nfcu_platform_admin',
    name: 'Daniel Okonkwo',
    initials: 'DO',
    role: 'AI Governance Admin, LLMOps',
    greeting: 'Daniel',
    capabilities: [
      'Proactive Intelligence',
      'Anomaly Detection',
      'Automated Action',
      'Friction Observability',
    ],
  },

  // ─── USSFCU-only Persona ──────────────────────────────────────
  // Visible only when clientId === 'ussfcu' (gated in PersonaContext CLIENT_PERSONAS).
  // Risk & Compliance — VP Compliance & Public Policy. The deep compliance query
  // and the member-specific disclosure checklist + calendar, at population altitude.
  ussfcu_evelyn: {
    id: 'ussfcu_evelyn',
    name: 'Evelyn Marsh',
    initials: 'EM',
    role: 'VP, Compliance & Public Policy',
    greeting: 'Evelyn',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Anomaly Detection',
      'Automated Action',
      'Predictive Intelligence',
      'Friction Observability',
    ],
  },

  // ─── USSFCU-only Persona ──────────────────────────────────────
  // Visible only when clientId === 'ussfcu' (gated in PersonaContext CLIENT_PERSONAS).
  // Risk & Compliance — Compliance Analyst. The operator version: file-level
  // exceptions, timelines, tests, checklist + calendar, and complaint logging.
  ussfcu_nadia: {
    id: 'ussfcu_nadia',
    name: 'Nadia Hassan',
    initials: 'NH',
    role: 'Compliance Analyst',
    greeting: 'Nadia',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Anomaly Detection',
      'Friction Observability',
      'Automated Action',
    ],
  },

  // ─── USSFCU-only Persona ──────────────────────────────────────
  // Visible only when clientId === 'ussfcu' (gated in PersonaContext CLIENT_PERSONAS).
  // Enterprise financial data-governance / audit story (data-flow & lineage).
  ussfcu_cfo: {
    id: 'ussfcu_cfo',
    name: 'Sylvia Reyes',
    initials: 'SR',
    role: 'Chief Financial Officer',
    greeting: 'Sylvia',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },

  // ─── USSFCU-only Persona ──────────────────────────────────────
  // Visible only when clientId === 'ussfcu' (gated in PersonaContext CLIENT_PERSONAS).
  // Pure executive altitude: state-of-the-business roll-up with a first-class
  // data-trust strip. Dual-mode (Conversation + Presentation); Presentation Mode
  // is a later phase, so the hero "View Full Briefing" is a placeholder for now.
  ussfcu_ceo: {
    id: 'ussfcu_ceo',
    name: 'Timothy L. Anderson',
    initials: 'TA',
    role: 'President & Chief Executive Officer',
    greeting: 'Tim',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },

  // ─── ESFCU — Educational Systems Federal Credit Union ─────────
  // Girado Smith, President & CEO. Single-persona Tier 1 tenant: the funding and
  // liquidity board briefing, with the Howard University post-merger
  // reconciliation as its trust centerpiece. Visible only when
  // clientId === 'esfcu'. Identity must match the PersonaModule and the
  // PersonaManifest exactly — manifests.test.ts asserts all three agree.
  esfcu_ceo: {
    id: 'esfcu_ceo',
    name: 'Girado Smith',
    initials: 'GS',
    role: 'President & Chief Executive Officer',
    greeting: 'Girado',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },

  // Renata Alvarez, Chief Risk Officer — ESFCU's second persona: fraud, BSA/AML
  // and enterprise risk. REPRESENTATIVE, not real: ESFCU's actual risk leader is
  // not public (CRO spec §3, §17), unlike Girado Smith who is the real CEO. That
  // asymmetry is disclosed on the Data Sources posture panel.
  // Identity must match the PersonaModule and the PersonaManifest exactly —
  // manifests.test.ts asserts all three agree.
  esfcu_cro: {
    id: 'esfcu_cro',
    name: 'Renata Alvarez',
    initials: 'RA',
    role: 'Chief Risk Officer',
    greeting: 'Renata',
    illustrativePersona: true,
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },

  // ─── Healthcare market — Riverside Health System ──────────────
  // Visible only when clientId === 'riverside_health'.
  care_ops: {
    id: 'care_ops',
    name: 'Dana W.',
    initials: 'DW',
    role: 'Care Operations',
    greeting: 'Dana',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },

  // ─── Commercial market — Newfold Digital (CCaaS) ───────────────
  newfold_director: {
    id: 'newfold_director',
    name: 'Marisol Castellano',
    initials: 'MC',
    role: 'Director, Global Customer Care',
    greeting: 'Marisol',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
      'Friction Observability',
    ],
  },
  newfold_ops: {
    id: 'newfold_ops',
    name: 'Sofia Reyes',
    initials: 'SR',
    role: 'Contact Center Operations Manager',
    greeting: 'Sofia',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },
  // Oil & Gas — Aramco (TrackLynk.AI). Title only, no name, at the intake's
  // request. Keep in sync with the persona module and manifest identity.
  aramco_hse_gm: {
    id: 'aramco_hse_gm',
    name: 'Gina "GM"',
    initials: 'GM',
    role: 'General Manager, Health, Safety and Environment',
    greeting: 'Gina',
    capabilities: [
      'Proactive Intelligence',
      'Anomaly Detection',
      'Converged Conversation',
      'Friction Observability',
      'Automated Action',
      'Predictive Intelligence',
    ],
  },
  aramco_complex_manager: {
    id: 'aramco_complex_manager',
    name: 'Connor "Complex"',
    initials: 'CC',
    role: 'Complex Manager, Refining and Petrochemical Site',
    greeting: 'Connor',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Predictive Intelligence',
      'Friction Observability',
      'Automated Action',
      'Anomaly Detection',
    ],
  },
  aramco_shift_supervisor: {
    id: 'aramco_shift_supervisor',
    name: 'Sally "Shift Super"',
    initials: 'SS',
    role: 'Shift Supervisor, Units 2 and 3',
    greeting: 'Sally',
    capabilities: [
      'Proactive Intelligence',
      'Anomaly Detection',
      'Converged Conversation',
      'Friction Observability',
      'Automated Action',
      'Predictive Intelligence',
    ],
  },
  aramco_permit_issuer: {
    id: 'aramco_permit_issuer',
    name: 'Penny "Permit"',
    initials: 'PP',
    role: 'Permit Issuing Authority, Turnaround',
    greeting: 'Penny',
    capabilities: [
      'Proactive Intelligence',
      'Anomaly Detection',
      'Predictive Intelligence',
      'Friction Observability',
      'Automated Action',
      'Converged Conversation',
    ],
  },

  // ─── Telecommunications — AT&T, AI Billing Workbench ───────────
  // Names are representative and illustrative (spec §3). Must stay identical
  // to the PersonaModule identity in each persona's index.ts — manifests.test
  // asserts they do not drift.
  att_billing_operator: {
    id: 'att_billing_operator',
    name: 'Bianca R.',
    initials: 'BR',
    role: 'Billing Operator — Anomaly Resolution',
    greeting: 'Bianca',
    capabilities: [
      'Proactive Intelligence',
      'Anomaly Detection',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Automated Action',
    ],
  },
  att_platform_admin: {
    id: 'att_platform_admin',
    name: 'Aria N.',
    initials: 'AN',
    role: 'Platform Admin — System Configuration',
    greeting: 'Aria',
    capabilities: [
      'Proactive Intelligence',
      'Friction Observability',
      'Converged Conversation',
      'Predictive Intelligence',
      'Automated Action',
      'Anomaly Detection',
    ],
  },

  // ─── SLED — Maryland DoIT, VOCE (Voice of the Resident) ─────────
  // Names are representative and illustrative. Must stay identical to the
  // PersonaModule identity in each persona's index.ts and to the manifest's own
  // identity — manifests.test asserts all three agree. PersonaContext resolves
  // through THIS map before the manifest loads, so a missing record here
  // silently drops the tenant to the generic `ops` record.
  doit_author: {
    id: 'doit_author',
    name: 'Sarah Chen',
    initials: 'SC',
    role: 'Survey Author',
    greeting: 'Sarah',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },
  // MJ collides with the generic `ops` persona (Maya J.). Legal — nothing
  // asserts initials uniqueness — and intentional. Please don't "fix" it.
  doit_admin: {
    id: 'doit_admin',
    name: 'Marcus Johnson',
    initials: 'MJ',
    role: 'Survey Administrator',
    greeting: 'Marcus',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Automated Action',
      'Anomaly Detection',
    ],
  },
  // Not a named person: an anonymous member of the public. The greeting is
  // "there" precisely because VOCE does not know who is answering, and the
  // survey's own copy says so.
  doit_resident: {
    id: 'doit_resident',
    name: 'Maryland Resident',
    initials: 'MR',
    role: 'Resident — anonymous',
    greeting: 'there',
    capabilities: ['Converged Conversation', 'Friction Observability', 'Proactive Intelligence'],
  },

  // ─── SLED — AMISA (American International Schools in the Americas) ───
  // Dr. Dereck Rhoads is AMISA's real, named Executive Director and the person
  // this demo is built for. Ana Lucía Restrepo is REPRESENTATIVE — a plausible
  // HR coordinator at a fictional member school, not a real individual — and
  // the Data Sources screen states the difference. Same three-place identity
  // rule as the DoIT records above: PersonaModule, PersonaManifest and this
  // must agree, and manifests.test asserts it.
  amisa_director: {
    id: 'amisa_director',
    name: 'Dr. Dereck Rhoads',
    initials: 'DR',
    role: 'Executive Director',
    greeting: 'Dereck',
    capabilities: [
      'Proactive Intelligence',
      'Converged Conversation',
      'Friction Observability',
      'Predictive Intelligence',
      'Anomaly Detection',
      'Automated Action',
    ],
  },
  amisa_hr: {
    id: 'amisa_hr',
    name: 'Ana Lucía Restrepo',
    initials: 'AR',
    role: 'HR Director — member school',
    greeting: 'Ana Lucía',
    capabilities: ['Converged Conversation', 'Friction Observability', 'Proactive Intelligence'],
  },
};

export default personas;
