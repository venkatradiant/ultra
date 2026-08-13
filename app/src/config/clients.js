// `loginSlug` is this client's front door: `/login/<slug>`, and the username on
// that page. It is mirrored in config/access.ts, which holds the matching
// password and is the module the gate actually reads — a test asserts the two
// agree, so neither can drift.
export const CLIENTS = {
  financial_services: {
    id: 'financial_services',
    loginSlug: 'fs',
    name: 'Financial Services',
    shortName: 'FS',
    nameLines: ['Financial Services'],
    tagline: 'AI Platform',
    logo: '/logos/fs-logo.svg',
    favicon: '/logos/fs-logo.svg',
    primaryColor: '#003087',
    navLabels: { journey: 'Member Journey', risk: 'Risk Signals' },
  },
  ussfcu: {
    id: 'ussfcu',
    loginSlug: 'ussfcu',
    name: 'United States Senate Federal Credit Union',
    shortName: 'USSFCU',
    nameLines: ['United States Senate', 'Federal Credit Union'],
    tagline: 'AI Platform',
    logo: '/ussfcu-seal.png',
    favicon: '/ussfcu-seal.png',
    primaryColor: '#003087',
    navLabels: { journey: 'Member Journey', risk: 'Risk Signals' },
  },
  penfed: {
    id: 'penfed',
    loginSlug: 'penfed',
    name: 'Pentagon Federal Credit Union',
    shortName: 'PenFed',
    nameLines: ['Pentagon Federal', 'Credit Union'],
    tagline: 'AI Platform',
    logo: '/logos/penfed-logo.svg',
    favicon: '/logos/penfed-logo.svg',
    primaryColor: '#003087',
    navLabels: { journey: 'Member Journey', risk: 'Risk Signals' },
  },
  // Educational Systems Federal Credit Union — the CEO executive-briefing demo.
  // Navy is ESFCU's own (#003768, sampled from the mark on esfcu.org); the
  // brand's maroon is kept out of the UI palette because it collides with the
  // critical-severity red. Keep in sync with
  // markets/financial-services/clients/esfcu/client.manifest.ts — BrandingContext
  // reads THIS map, not the manifest.
  esfcu: {
    id: 'esfcu',
    loginSlug: 'esfcu',
    name: 'Educational Systems Federal Credit Union',
    shortName: 'ESFCU',
    nameLines: ['Educational Systems', 'Federal Credit Union'],
    tagline: 'Executive Intelligence',
    logo: '/logos/esfcu-logo.svg',
    favicon: '/logos/esfcu-logo.svg',
    primaryColor: '#003768',
    navLabels: { journey: 'Business Performance', risk: 'Priority Signals' },
  },
  nfcu: {
    id: 'nfcu',
    loginSlug: 'nfcu',
    name: 'Navy Federal Credit Union',
    shortName: 'NFCU',
    nameLines: ['Navy Federal', 'Credit Union'],
    tagline: 'Workforce AI Platform',
    logo: '/logos/nfcu-logo.svg',
    favicon: '/logos/nfcu-logo.svg',
    primaryColor: '#003087',
    navLabels: { journey: 'Workforce Intelligence', risk: 'Quality Signals', governance: 'Model Governance' },
  },
  // ─── Commercial market — Newfold Digital (cross-brand SMB care) ──
  newfold_digital: {
    id: 'newfold_digital',
    loginSlug: 'newfold',
    name: 'Newfold Digital',
    shortName: 'Newfold',
    nameLines: ['Newfold', 'Digital'],
    tagline: 'Customer Care Intelligence',
    logo: '/logos/newfold-icon.svg',
    favicon: '/logos/newfold-icon.svg',
    primaryColor: '#F27121',
    navLabels: { journey: 'Workforce Intelligence', risk: 'Quality Signals' },
  },
  // ─── Oil & Gas market — Aramco (TrackLynk.AI HSE reference demo) ──
  // Aramco carries the client identity and the palette; TrackLynk is the
  // product and sits bottom-left where Radiant's mark normally goes. Aramco is
  // an illustrative target example, not a customer — the Data Sources screen
  // carries that statement. Keep in sync with
  // markets/oil-gas/clients/aramco/client.manifest.ts — BrandingContext reads
  // THIS map, not the manifest.
  aramco: {
    id: 'aramco',
    loginSlug: 'aramco',
    name: 'Aramco',
    shortName: 'Aramco',
    nameLines: ['Aramco'],
    tagline: 'HSE Intelligence',
    // The emblem square cropped from the official lockup — it carries its own
    // green-to-blue field, so it reads on the light sidebar surface. The full
    // white lockup is kept for dark fields (see AramcoBackdropPanel).
    logo: '/logos/aramco-emblem.png',
    favicon: '/logos/aramco-emblem.png',
    primaryColor: '#0071CE',
    // Official TrackLynk lockup (coral mark over the wordmark), taken from
    // TrackLynk's own deck rather than recreated.
    footerMark: {
      logo: '/logos/tracklynk-logo.png',
      alt: 'TrackLynk',
      label: 'Powered by',
    },
    navLabels: {
      ask: 'Ask TrackLynk',
      liveSite: 'Live Site Picture',
      permits: 'Permit and Job Detail',
      muster: 'Muster Status',
    },
  },
  // ─── Telecommunications market — AT&T (AI Billing Workbench) ────
  // AT&T-branded: the official globe and AT&T's blues. The data is still
  // illustrative and says so on the Data Sources screen. Keep in sync with
  // src/markets/telecom/clients/att/client.manifest.ts.
  att: {
    id: 'att',
    loginSlug: 'att',
    name: 'AT&T',
    shortName: 'AT&T',
    nameLines: ['AT&T'],
    tagline: 'AI Billing Workbench',
    logo: '/logos/att-globe.png',
    favicon: '/logos/att-globe.png',
    primaryColor: '#0568AE',
    navLabels: {
      ask: 'AI Conversation',
      patterns: 'Patterns',
      dashboard: 'Dashboard',
      history: 'Resolution History',
      adminConsole: 'Platform Administration',
      agentObservability: 'Agent Observability',
    },
  },
  // ─── SLED market — Maryland Department of Information Technology ──
  // DoIT carries the client identity and the palette; VOCE is the product and
  // sits bottom-left where Radiant's mark normally goes — the same shape as
  // Aramco/TrackLynk. Illustrative demo: no figure describes real Maryland
  // program data, and the Data Sources screen carries that statement. The
  // palette and the arch mark come from the department's own site. Keep in sync
  // with markets/sled/clients/doit/client.manifest.ts — BrandingContext reads
  // THIS map, ChooseClientScreen reads THAT one, and nothing asserts they agree.
  doit: {
    id: 'doit',
    loginSlug: 'doit',
    name: 'Maryland Department of Information Technology',
    shortName: 'Maryland DoIT',
    // Split at three lines, not two: the login hero column is a fixed 384px and
    // both "Maryland Department of" (421px) and "Information Technology" (410px)
    // overflow it, so a two-line split re-wraps into a ragged four.
    nameLines: ['Maryland Department', 'of Information', 'Technology'],
    tagline: 'Voice of the Resident',
    logo: '/logos/maryland-doit-mark.svg',
    favicon: '/logos/maryland-doit-mark.svg',
    primaryColor: '#1a4480',
    footerMark: {
      logo: '/logos/voce-logo.svg',
      alt: 'VOCE — Voice of the Resident',
      label: 'Powered by',
    },
    navLabels: { ask: 'Ask VOCE' },
  },
  // ─── Healthcare market (proves the platform is multi-market) ────
  riverside_health: {
    id: 'riverside_health',
    loginSlug: 'riverside',
    name: 'Riverside Health System',
    shortName: 'Riverside',
    nameLines: ['Riverside', 'Health System'],
    tagline: 'Care Intelligence Platform',
    logo: '/logos/fs-logo.svg',
    favicon: '/logos/fs-logo.svg',
    primaryColor: '#0F766E',
    navLabels: { journey: 'Patient Journey', risk: 'Clinical Signals' },
  },
};

export const DEFAULT_CLIENT_ID = 'financial_services';
export const STORAGE_KEY = 'selected_client';
