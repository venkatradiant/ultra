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
};

export default personas;
