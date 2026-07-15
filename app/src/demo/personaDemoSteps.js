/**
 * Per-persona guided demo step definitions.
 * Each step has a label (shown in the overlay) and an actions array
 * that DemoRunner interprets sequentially.
 *
 * Action types:
 *   { type: 'navigate', path }
 *   { type: 'waitTyping' }
 *   { type: 'sleep', ms }
 *   { type: 'clickCapability', name }
 *   { type: 'clickChip', partial }
 *   { type: 'confirmAction' }
 *   { type: 'submitQuery', query, hint }
 *   { type: 'closeDrawer' }
 */

// ─── Operations & Analytics (Maya J.) — 14 steps, 6 capabilities ──
const opsSteps = [
  {
    label: 'Greeting — Proactive Intelligence',
    actions: [
      { type: 'navigate', path: '/' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Proactive Intelligence' },
    ],
  },
  {
    label: 'Turn 1 — Converged Conversation',
    actions: [
      { type: 'clickChip', partial: 'mortgage drop-off' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Converged Conversation' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Turn 2 — Friction Observability',
    actions: [
      { type: 'clickChip', partial: 'show me who' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Friction Observability' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Turn 3 — Predictive Intelligence',
    actions: [
      { type: 'clickChip', partial: 'Not yet' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Predictive Intelligence' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Turn 4 — Anomaly Detection',
    actions: [
      { type: 'clickChip', partial: 'anomalies across systems' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Anomaly Detection' },
      { type: 'sleep', ms: 1500 },
    ],
  },
  {
    label: 'Turn 5 — Automated Action',
    actions: [
      { type: 'clickChip', partial: 'act on this' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Automated Action' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Confirm JIRA ticket & Slack notification',
    actions: [
      { type: 'sleep', ms: 1000 },
      { type: 'confirmAction' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 1500 },
      { type: 'clickChip', partial: 'notify them in Slack' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
    ],
  },
  {
    label: 'Journey — View member journey map',
    actions: [
      { type: 'navigate', path: '/journey' },
      { type: 'sleep', ms: 3500 },
    ],
  },
  {
    label: 'Journey — Ask about friction points',
    actions: [
      { type: 'submitQuery', query: "What's driving the mortgage drop-off?", hint: 'journey' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 3500 },
      { type: 'closeDrawer' },
    ],
  },
  {
    label: 'Risk — View risk dashboard',
    actions: [
      { type: 'navigate', path: '/risk' },
      { type: 'sleep', ms: 3500 },
    ],
  },
  {
    label: 'Risk — Analyze transaction anomalies',
    actions: [
      { type: 'clickChip', partial: 'transaction anomaly' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 3500 },
      { type: 'closeDrawer' },
    ],
  },
  {
    label: 'Risk — NCUA posture comparison',
    actions: [
      { type: 'clickChip', partial: 'NCUA posture' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 3500 },
      { type: 'closeDrawer' },
    ],
  },
  {
    label: 'Data Sources — View connected integrations',
    actions: [
      { type: 'navigate', path: '/data-sources' },
      { type: 'sleep', ms: 4000 },
    ],
  },
  {
    label: 'Return to Ask the AI — Demo complete',
    actions: [
      { type: 'navigate', path: '/' },
      { type: 'sleep', ms: 2000 },
    ],
  },
];

// ─── CX Operator (Priya K.) — 10 steps, 4 capabilities ──────────
const cxSteps = [
  {
    label: 'Greeting — Proactive Intelligence',
    actions: [
      { type: 'navigate', path: '/' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Proactive Intelligence' },
    ],
  },
  {
    label: 'Turn 1 — Converged Conversation',
    actions: [
      { type: 'clickChip', partial: 'members hitting friction' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Converged Conversation' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Turn 2 — Friction Observability',
    actions: [
      { type: 'clickChip', partial: 'journeys underperform' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Friction Observability' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Turn 3 — Automated Action',
    actions: [
      { type: 'clickChip', partial: 'intervention is needed' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Automated Action' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Confirm action — Proactive callback outreach',
    actions: [
      { type: 'sleep', ms: 1000 },
      { type: 'confirmAction' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
    ],
  },
  {
    label: 'Journey — View member journey map',
    actions: [
      { type: 'navigate', path: '/journey' },
      { type: 'sleep', ms: 3500 },
    ],
  },
  {
    label: 'Risk — View risk dashboard',
    actions: [
      { type: 'navigate', path: '/risk' },
      { type: 'sleep', ms: 3500 },
    ],
  },
  {
    label: 'Data Sources — View connected integrations',
    actions: [
      { type: 'navigate', path: '/data-sources' },
      { type: 'sleep', ms: 4000 },
    ],
  },
  {
    label: 'Return to Ask the AI — Demo complete',
    actions: [
      { type: 'navigate', path: '/' },
      { type: 'sleep', ms: 2000 },
    ],
  },
];

// ─── Member Retention Analyst (Derek T.) — 10 steps, 4 capabilities ─
const retentionSteps = [
  {
    label: 'Greeting — Proactive Intelligence',
    actions: [
      { type: 'navigate', path: '/' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Proactive Intelligence' },
    ],
  },
  {
    label: 'Turn 1 — Converged Conversation',
    actions: [
      { type: 'clickChip', partial: 'churn signals' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Converged Conversation' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Turn 2 — Predictive Intelligence',
    actions: [
      { type: 'clickChip', partial: 'segments are most at risk' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Predictive Intelligence' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Turn 3 — Automated Action',
    actions: [
      { type: 'clickChip', partial: 'Model the retention impact' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Automated Action' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Confirm action — Generate retention brief',
    actions: [
      { type: 'sleep', ms: 1000 },
      { type: 'confirmAction' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
    ],
  },
  {
    label: 'Journey — View member journey map',
    actions: [
      { type: 'navigate', path: '/journey' },
      { type: 'sleep', ms: 3500 },
    ],
  },
  {
    label: 'Risk — View risk dashboard',
    actions: [
      { type: 'navigate', path: '/risk' },
      { type: 'sleep', ms: 3500 },
    ],
  },
  {
    label: 'Data Sources — View connected integrations',
    actions: [
      { type: 'navigate', path: '/data-sources' },
      { type: 'sleep', ms: 4000 },
    ],
  },
  {
    label: 'Return to Ask the AI — Demo complete',
    actions: [
      { type: 'navigate', path: '/' },
      { type: 'sleep', ms: 2000 },
    ],
  },
];

// ─── Risk & Fraud Executive (James R.) — 10 steps, 4 capabilities ─
const riskSteps = [
  {
    label: 'Greeting — Proactive Intelligence',
    actions: [
      { type: 'navigate', path: '/' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Proactive Intelligence' },
    ],
  },
  {
    label: 'Turn 1 — Converged Conversation',
    actions: [
      { type: 'clickChip', partial: 'anomalies were detected' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Converged Conversation' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Turn 2 — Anomaly Detection',
    actions: [
      { type: 'clickChip', partial: 'regulatory exposure' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Anomaly Detection' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Turn 3 — Automated Action',
    actions: [
      { type: 'clickChip', partial: 'needs escalation' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Automated Action' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Confirm action — File SARs',
    actions: [
      { type: 'sleep', ms: 1000 },
      { type: 'confirmAction' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
    ],
  },
  {
    label: 'Journey — View member journey map',
    actions: [
      { type: 'navigate', path: '/journey' },
      { type: 'sleep', ms: 3500 },
    ],
  },
  {
    label: 'Risk — View risk dashboard',
    actions: [
      { type: 'navigate', path: '/risk' },
      { type: 'sleep', ms: 3500 },
    ],
  },
  {
    label: 'Data Sources — View connected integrations',
    actions: [
      { type: 'navigate', path: '/data-sources' },
      { type: 'sleep', ms: 4000 },
    ],
  },
  {
    label: 'Return to Ask the AI — Demo complete',
    actions: [
      { type: 'navigate', path: '/' },
      { type: 'sleep', ms: 2000 },
    ],
  },
];

// ─── NFCU Supervisor (Priya K.) — Intraday demo, 9 steps ──────────
// Auto-opens the intraday dashboard via the `?intraday=1` deep-link
// query param so the dashboard panel is visible from the first turn.
const nfcuSupervisorIntradaySteps = [
  {
    label: 'Open Intraday Dashboard — Proactive Intelligence',
    actions: [
      { type: 'navigate', path: '/?intraday=1' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 1 — Live Intraday Status',
    actions: [
      { type: 'clickChip', partial: 'live intraday status' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 2 — Walk me through the SIP impact',
    actions: [
      { type: 'clickChip', partial: 'SIP impact' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 3 — Rate promotion impact',
    actions: [
      { type: 'clickChip', partial: 'rate promotion impact' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 4 — Predictive Intelligence (scenarios)',
    actions: [
      { type: 'clickChip', partial: 'are my options' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 5 — Execute Plan C',
    actions: [
      { type: 'clickChip', partial: 'Execute Plan C' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 6 — Leadership briefing',
    actions: [
      { type: 'clickChip', partial: 'tell leadership' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 7 — Historical comparison',
    actions: [
      { type: 'clickChip', partial: 'historical incidents' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Data Sources — Show new cross-source integrations',
    actions: [
      { type: 'navigate', path: '/data-sources' },
      { type: 'sleep', ms: 4000 },
      { type: 'navigate', path: '/?intraday=1' },
      { type: 'sleep', ms: 1500 },
    ],
  },
];

// ─── NFCU Director (Marcus T.) — Intraday demo, 9 steps ────────────
const nfcuDirectorIntradaySteps = [
  {
    label: 'Open Intraday Dashboard — Executive view',
    actions: [
      { type: 'navigate', path: '/?intraday=1' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 1 — Live Intraday Status',
    actions: [
      { type: 'clickChip', partial: 'live intraday status' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 2 — SIP impact across teams',
    actions: [
      { type: 'clickChip', partial: 'SIP impact' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 3 — Rate promotion impact',
    actions: [
      { type: 'clickChip', partial: 'rate promotion impact' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 4 — Scenarios for cross-team stabilization',
    actions: [
      { type: 'clickChip', partial: 'are my options' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 5 — Execute Plan C across teams',
    actions: [
      { type: 'clickChip', partial: 'Execute Plan C' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 6 — COO briefing',
    actions: [
      { type: 'clickChip', partial: 'tell the COO' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Step 7 — Historical incidents (ROI evidence)',
    actions: [
      { type: 'clickChip', partial: 'historical incidents' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2500 },
    ],
  },
  {
    label: 'Data Sources — Cross-source integrations',
    actions: [
      { type: 'navigate', path: '/data-sources' },
      { type: 'sleep', ms: 4000 },
      { type: 'navigate', path: '/?intraday=1' },
      { type: 'sleep', ms: 1500 },
    ],
  },
];

// ─── USSFCU CFO (Sylvia Reyes) — 7 steps, 6 capabilities ─────────
const ussfcuCfoSteps = [
  {
    label: 'Greeting — Proactive Intelligence',
    actions: [
      { type: 'navigate', path: '/' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Proactive Intelligence' },
    ],
  },
  {
    label: 'Step 2 — Converged Conversation',
    actions: [
      { type: 'clickChip', partial: 'where the numbers break' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Converged Conversation' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Step 3 — Friction Observability',
    actions: [
      { type: 'clickChip', partial: 'data flow that produced' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Friction Observability' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Step 4 — Predictive Intelligence',
    actions: [
      { type: 'clickChip', partial: 'full lineage do for the audit' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Predictive Intelligence' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Step 5 — Anomaly Detection',
    actions: [
      { type: 'clickChip', partial: 'parity gap' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Anomaly Detection' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Step 6 — Automated Action',
    actions: [
      { type: 'clickChip', partial: 'audit evidence package' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Automated Action' },
      { type: 'sleep', ms: 1000 },
      { type: 'confirmAction' },
      { type: 'sleep', ms: 1500 },
    ],
  },
  {
    label: 'Step 7 — Remediation Plan (Predictive Intelligence)',
    actions: [
      { type: 'clickChip', partial: 'remediation plan' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Predictive Intelligence' },
      { type: 'sleep', ms: 1500 },
    ],
  },
];

// ─── USSFCU CEO (Timothy L. Anderson) — 8 beats, 6 capabilities ──
// Pure executive state-of-the-business walkthrough anchored on the primary
// liquidity issue and culminating in the board briefing + View Full Briefing.
const ussfcuCeoSteps = [
  {
    label: 'Greeting — Proactive Intelligence',
    actions: [
      { type: 'navigate', path: '/' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
      { type: 'clickCapability', name: 'Proactive Intelligence' },
    ],
  },
  {
    label: 'Step 2 — Converged Conversation (liquidity)',
    actions: [
      { type: 'clickChip', partial: 'Walk me through the liquidity' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Converged Conversation' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Step 3 — Predictive Intelligence (projection)',
    actions: [
      { type: 'clickChip', partial: 'What happens to liquidity if this continues' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Predictive Intelligence' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Step 4 — Anomaly Detection (data trust)',
    actions: [
      { type: 'clickChip', partial: 'Can I trust these numbers' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Anomaly Detection' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Step 5 — Friction Observability (lineage trace)',
    actions: [
      { type: 'clickChip', partial: 'Trace net income back to source' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Friction Observability' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Step 6 — Converged Conversation (membership & growth)',
    actions: [
      { type: 'clickChip', partial: 'Show me membership and growth' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Converged Conversation' },
      { type: 'sleep', ms: 1000 },
    ],
  },
  {
    label: 'Step 7 — Automated Action (board briefing)',
    actions: [
      { type: 'clickChip', partial: 'Draft the board briefing' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2200 },
      { type: 'clickCapability', name: 'Automated Action' },
      { type: 'sleep', ms: 1000 },
      { type: 'confirmAction' },
      { type: 'sleep', ms: 1500 },
    ],
  },
  {
    label: 'Step 8 — View Full Briefing',
    actions: [
      { type: 'clickChip', partial: 'Open the full briefing' },
      { type: 'waitTyping' },
      { type: 'sleep', ms: 2000 },
    ],
  },
];

// ─── Registry ────────────────────────────────────────────────────
const personaDemoSteps = {
  ops: opsSteps,
  cx: cxSteps,
  retention: retentionSteps,
  risk: riskSteps,
  nfcu_supervisor: nfcuSupervisorIntradaySteps,
  nfcu_director: nfcuDirectorIntradaySteps,
  ussfcu_cfo: ussfcuCfoSteps,
  ussfcu_ceo: ussfcuCeoSteps,
};

export function getDemoSteps(personaId) {
  return personaDemoSteps[personaId] || personaDemoSteps.ops;
}

// ─── Capability checklists per persona (for DemoOverlay) ─────────
export const personaCapabilities = {
  ops: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Friction Observability',
    'Predictive Intelligence',
    'Anomaly Detection',
    'Automated Action',
  ],
  cx: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Friction Observability',
    'Automated Action',
  ],
  retention: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Predictive Intelligence',
    'Automated Action',
  ],
  risk: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Anomaly Detection',
    'Automated Action',
  ],
  ussfcu_cfo: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Friction Observability',
    'Predictive Intelligence',
    'Anomaly Detection',
    'Automated Action',
  ],
  ussfcu_ceo: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Predictive Intelligence',
    'Anomaly Detection',
    'Friction Observability',
    'Automated Action',
  ],
};
