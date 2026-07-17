/**
 * Per-page context for Daniel's floating assistant bar (NFCU AI Governance
 * Admin only). Maps a route to the questions the bar offers on that page and
 * the placeholder it shows.
 *
 * The chips here MUST exist in nfcuPaConfig.chipToFlowKey (personaFlowConfigs.js)
 * or they resolve to nothing — flowGraph.test.ts asserts this. Answers live in
 * chatFlows.json (the nfcu_pa_ask_* flows) and are reconciled to the same data
 * the dashboards render, so the bar never contradicts the page behind it.
 *
 * Deliberately excludes '/ask' — that page already is the full chat.
 */
export const ASSISTANT_CONTEXT = {
  '/governance': {
    title: 'Ask about governance',
    placeholder: 'Ask about sovereignty, policies, or open items…',
    chips: [
      "What's the governance posture?",
      "What's the open item?",
      'Which policies are applied?',
      'How much did routing save?',
    ],
  },
  '/agent-observability': {
    title: 'Ask about agent activity',
    placeholder: 'Ask about agent health, frontier usage, or a root cause…',
    chips: [
      'Why is Card Disputes degraded?',
      "What's the frontier share by initiative?",
      'How many agents are healthy?',
    ],
  },
  '/agent-inventory': {
    title: 'Ask about the agent inventory',
    placeholder: 'Ask about foundries, governance coverage, or PII safety…',
    chips: [
      'How many agents are ungoverned?',
      'Which foundries are in use?',
      "What isn't PII-safe?",
    ],
  },
  '/data-sources': {
    title: 'Ask about the data sources',
    placeholder: 'Ask what feeds routing, classification, or which sources are live…',
    chips: [
      'What feeds the routing decision?',
      'Where does sensitivity classification come from?',
      'Which sources are live?',
    ],
  },
};

/** The routes the bar appears on — the four non-Ask pages. */
export const ASSISTANT_ROUTES = Object.keys(ASSISTANT_CONTEXT);
