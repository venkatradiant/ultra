/**
 * USSFCU Finance persona (Fiona) — the canonical numbers.
 *
 * Spec: "Persona and Demo Specification: Finance Team Analyst at USS FCU"
 * (Radiant Digital, Lam Huynh, rev. 2026-09-24, Lauren feedback applied) and
 * the Fiona section of the USSFCU Oral Demo Talk Track v4. Those two documents
 * are the only source: anything they do not mention is not in this file.
 *
 * Every visual, tile and card reads its figures from here; the chat prose
 * (chatFlows.json) cannot import them, so financeData.test.ts pins every
 * figure the prose quotes to the value below.
 *
 * REAL vs ILLUSTRATIVE. PUBLIC_BACKDROP is the spec's real, sourced frame
 * (§2). Everything else is illustrative sample data, "not USS FCU data".
 *
 * SPEC vs FILL. A value is either stated in the spec (marked `spec`) or is the
 * minimum a spec visualization cannot be drawn without (marked `fill`), chosen
 * to agree with every stated figure. FILLED_VALUES at the bottom lists each
 * fill for review.
 *
 * DEMO TODAY is the spec's own date, 2026-09-24: the latest closed quarter is
 * Q2 2026, so "two quarters ago" is Q4 2025.
 */

export const DEMO_TODAY = '2026-09-24';
export const SCAN_AT = '2026-09-24T06:00:00';

/** §3: the persona. No executive title; the header greets her as "Fiona." */
export const PERSONA = {
  name: 'Fiona',
  role: 'Finance Team',
  initials: 'FI',
} as const;

// ─── The seven turns ───────────────────────────────────────────────────────
/** §10, the "User" line of Steps 2–7, verbatim. */
export const FINANCE_QUESTIONS = {
  delinquency: 'Show delinquency trends by loan segment, and flag any pool trending up or outside our aligned parameters.',
  limits: 'Which portfolios are approaching our board risk-tolerance limits, such as mortgages capped at 600% of net worth?',
  shutdown: 'Model a government shutdown as an employment shock. What happens to our members and our loan portfolio?',
  cushion: 'For that shutdown scenario, do we have enough dry powder? What happens to our capital ratios and liquidity?',
  playbook: 'For a shutdown of this kind, what is our pre-established playbook?',
  segDeposits: 'Show deposit activity by SEG group, and trigger an alert if more than a set percentage leaves.',
} as const;

/**
 * Talk Track v4, Fiona's CLICK lines — the golden path, verbatim. Where the
 * spec's follow-up wording differs ("Show deposit activity by SEG"), the talk
 * track wins.
 */
export const FINANCE_CHIPS = {
  delinquency: 'Show delinquency trends by segment',
  limits: 'Which portfolios are near their board limits?',
  shutdown: 'Model a government shutdown on the portfolio',
  cushion: 'Do we have enough capital and liquidity?',
  playbook: 'What is our shutdown playbook?',
  segDeposits: 'Show deposit activity by SEG group',
} as const;

/** §10 follow-up options that are not one of the talk track's CLICK lines. */
export const FOLLOW_UP_CHIPS = {
  ratesAndLiquidity: 'What is building on rates and liquidity?',
  hilDriver: 'What is driving the Home Improvement Loan rise?',
  downsideOnPool: 'Model a downside on this pool',
  runOff: 'How much can we run off to stay under the cap?',
  capitalHeadroom: 'Show capital and liquidity headroom',
  exportThis: 'Export this for the board',
  alcoSummary: 'Draft the ALCO summary',
  exportBriefing: 'Export the briefing for the board',
  retentionAction: 'Draft the retention action for this SEG',
  backToSignals: 'Back to the morning signals',
} as const;

/** §11 suggested query prompts, verbatim. */
export const SUGGESTED_PROMPTS = [
  'Show delinquency trends by segment and flag anything outside our parameters',
  'Which portfolios are approaching our board risk-tolerance limits?',
  'Model a government shutdown as an employment shock on our members and portfolio',
  'Do we have enough capital and liquidity headroom under that scenario?',
  'What is the board playbook action for each rate move?',
] as const;

// ─── Public backdrop (real, §2) ─────────────────────────────────────────────
export const PUBLIC_BACKDROP = {
  institution: 'United States Senate Federal Credit Union (USS FCU), chartered 1935, serving the U.S. Senate community',
  totalAssetsM: 1530, // spec: "Approximately $1.53B"
  members: 52500, // spec: "Approximately 52,500"
  netWorthRatioPct: 7.5, // spec: "7.50%, well capitalized"
  corePlatform: 'Jack Henry Symitar, with a migration underway to Thought Machine',
} as const;

/** Net worth in $M — 7.50% of $1.53B = $114.75M (derived from the backdrop). */
export const NET_WORTH_M = (PUBLIC_BACKDROP.totalAssetsM * PUBLIC_BACKDROP.netWorthRatioPct) / 100;

// ─── Step 2 · Delinquency by segment ───────────────────────────────────────
/** Eight quarters (spec: "trend lines over eight quarters"), ending Q2 2026. */
export const DQ_QUARTERS = ["Q3 '24", "Q4 '24", "Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"] as const;

/** spec: Home Improvement Loan (unsecured) aligned parameter. */
export const HIL_PARAMETER_PCT = 1.5;

/**
 * 60-day delinquency (%) per segment across DQ_QUARTERS.
 * spec: HIL 1.8% now, 1.1% two quarters ago; first mortgage 0.4% and HELOC
 * 0.6%, "steady". fill: HIL's first five quarters, and the aggregate
 * "other unsecured consumer credit" segment the shutdown answer implies
 * ("rises across unsecured consumer credit, led by the HIL book").
 */
export const DQ_SEGMENTS = [
  { id: 'hil', label: 'Home Improvement Loan (unsecured)', series: [0.9, 0.9, 1.0, 1.0, 1.0, 1.1, 1.4, 1.8], flagged: true },
  { id: 'first_mortgage', label: 'First mortgage', series: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], flagged: false },
  { id: 'heloc', label: 'HELOC', series: [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6], flagged: false },
  { id: 'other_unsecured', label: 'Other unsecured consumer credit', series: [1.3, 1.3, 1.3, 1.25, 1.25, 1.2, 1.2, 1.2], flagged: false },
] as const;

/** spec: where the HIL rise sits. */
export const HIL_DRIVER = {
  vintage: 'loans originated in the last 18 months',
  channel: 'the contractor channel',
} as const;

// ─── Step 3 · Board risk-tolerance limits ──────────────────────────────────
/**
 * spec: first mortgage $655M against a 600%-of-net-worth cap (571%, about
 * $33M headroom, cap in roughly two quarters). "No other portfolio is within
 * fifteen points of its limit" is read as share of the cap used — first
 * mortgage uses 95%; every other portfolio stays under 85%.
 * fill: the HELOC and HIL balances and caps, so the chart has the "bars" the
 * spec asks for.
 */
export const PORTFOLIO_LIMITS = [
  { id: 'first_mortgage', label: 'First mortgage', balanceM: 655, capPctOfNw: 600 },
  { id: 'heloc', label: 'HELOC', balanceM: 118, capPctOfNw: 150 },
  { id: 'hil', label: 'Home Improvement Loan (unsecured)', balanceM: 48, capPctOfNw: 75 },
] as const;

/** fill: first-mortgage growth per quarter; $33M of headroom is gone in two quarters. */
export const MORTGAGE_GROWTH_PER_QUARTER_M = 17;
/** spec: "you reach the cap in roughly two quarters". */
export const QUARTERS_TO_CAP = 2;
/** "within fifteen points of its limit", as share of the cap used. */
export const NEAR_LIMIT_POINTS = 15;

export const pctOfNetWorth = (balanceM: number) => (balanceM / NET_WORTH_M) * 100;
export const capUsePct = (balanceM: number, capPctOfNw: number) => (pctOfNetWorth(balanceM) / capPctOfNw) * 100;
export const capDollarsM = (capPctOfNw: number) => (NET_WORTH_M * capPctOfNw) / 100;
export const headroomM = (balanceM: number, capPctOfNw: number) => capDollarsM(capPctOfNw) - balanceM;

// ─── Step 4 · Government-shutdown employment shock ─────────────────────────
/**
 * spec: a 30-day shutdown; 18% of affected members draw down deposits; about
 * 6% delay a loan payment; modeled loan losses up about $4.2M over two
 * quarters. fill: the share of members affected and the projected
 * delinquency per segment (HIL leading, as the spec says).
 */
export const SHUTDOWN = {
  scenario: '30-day government shutdown',
  days: 30,
  membersAffectedPct: 27,
  depositDrawdownPct: 18,
  paymentDelayPct: 6,
  lossOverTwoQuartersM: 4.2,
  projectedDq: [
    { id: 'hil', label: 'Home Improvement Loan (unsecured)', beforePct: 1.8, afterPct: 3.2 },
    { id: 'other_unsecured', label: 'Other unsecured consumer credit', beforePct: 1.2, afterPct: 1.7 },
    { id: 'heloc', label: 'HELOC', beforePct: 0.6, afterPct: 0.7 },
    { id: 'first_mortgage', label: 'First mortgage', beforePct: 0.4, afterPct: 0.45 },
  ],
} as const;

/** Members affected, as a count of the ~52,500 backdrop membership. */
export const membersAffected = () => Math.round((PUBLIC_BACKDROP.members * SHUTDOWN.membersAffectedPct) / 100 / 100) * 100;
export const membersDrawingDown = () => Math.round((membersAffected() * SHUTDOWN.depositDrawdownPct) / 100);
export const membersDelayingPayment = () => Math.round((membersAffected() * SHUTDOWN.paymentDelayPct) / 100);

// ─── Step 5 · Capital and liquidity cushion ────────────────────────────────
/** spec (§7 KPI target): the net worth early-warning line. */
export const NW_EARLY_WARNING_PCT = 7.0;
/** fill: the funding-review trigger. Loan-to-share approaches it, and does not cross it. */
export const FUNDING_REVIEW_TRIGGER_LTS_PCT = 88;

/**
 * spec: net worth 7.50% → about 7.2%; roughly $35M of liquidity to spare for
 * the quarter; loan-to-share 84% "toward the funding-review trigger".
 * fill: the pre-shock liquidity surplus and the post-shock loan-to-share.
 */
export const CUSHION = {
  before: { nwRatioPct: PUBLIC_BACKDROP.netWorthRatioPct, liquiditySurplusM: 88, ltsPct: 84 },
  after: { nwRatioPct: 7.2, liquiditySurplusM: 35, ltsPct: 87 },
} as const;

/**
 * spec: "I reconciled the capital position across the core, the ledger, and
 * the ALM model." Each source carries the same net worth — derived from the
 * public backdrop — which is what makes the cushion provable.
 */
export const CAPITAL_RECONCILIATION = [
  { id: 'core', layer: 'Core', system: 'Jack Henry Symitar', netWorthM: NET_WORTH_M, nwRatioPct: PUBLIC_BACKDROP.netWorthRatioPct },
  { id: 'ledger', layer: 'Ledger', system: 'General Ledger and Cornerstone', netWorthM: NET_WORTH_M, nwRatioPct: PUBLIC_BACKDROP.netWorthRatioPct },
  { id: 'alm', layer: 'ALM model', system: 'UST Finex', netWorthM: NET_WORTH_M, nwRatioPct: PUBLIC_BACKDROP.netWorthRatioPct },
] as const;

// ─── Step 6 · Shutdown playbook ────────────────────────────────────────────
/**
 * spec: the board playbook maps actions to a shutdown trigger by severity,
 * each action "pulled as written". fill: the 30-day boundary between the two
 * bands. The modeled 30-day shutdown falls in the first band, which is the
 * recommended row.
 */
export const PLAYBOOK = {
  title: 'Board playbook · shutdown trigger',
  bands: [
    {
      id: 'short',
      band: 'Anticipated or short shutdown',
      range: 'Up to 30 days',
      actions: [
        'Proactive outreach and hardship-deferral offers to the affected payroll groups',
        'Pause Home Improvement Loan marketing to the most exposed segments',
      ],
      recommended: true,
    },
    {
      id: 'extended',
      band: 'Extended shutdown',
      range: 'Beyond 30 days',
      actions: [
        'Activate the emergency-liquidity line',
        'Tighten unsecured underwriting',
        'Stand up the member relief program the board pre-approved',
      ],
      recommended: false,
    },
  ],
} as const;

// ─── Step 7 · Deposit activity by SEG ──────────────────────────────────────
/** spec: the month-over-month outflow that raises an alert on a SEG group. */
export const SEG_OUTFLOW_TRIGGER_PCT = 3;

/**
 * spec: total balances up 0.6%; two payroll groups trending down; one off
 * 4.2%, crossing the 3% trigger. fill: the groups (anonymised Senate-community
 * payroll groups), their balances and account counts.
 */
export const SEG_GROUPS = [
  { id: 'payroll_a', label: 'Payroll group A', lastM: 118.0, thisM: 113.0, lastCount: 4120, thisCount: 4010 },
  { id: 'payroll_b', label: 'Payroll group B', lastM: 96.0, thisM: 94.8, lastCount: 3380, thisCount: 3360 },
  { id: 'payroll_c', label: 'Payroll group C', lastM: 84.0, thisM: 86.6, lastCount: 2950, thisCount: 2980 },
  { id: 'payroll_d', label: 'Payroll group D', lastM: 92.0, thisM: 95.0, lastCount: 3240, thisCount: 3275 },
  { id: 'payroll_e', label: 'Payroll group E', lastM: 58.0, thisM: 60.1, lastCount: 2010, thisCount: 2030 },
  { id: 'other', label: 'All other SEGs', lastM: 38.0, thisM: 39.4, lastCount: 1480, thisCount: 1495 },
] as const;

/** fill: the flagged group's outflow split — "mostly certificate closures". */
export const SEG_A_OUTFLOW_MIX = { certificateClosuresM: 4.05, otherM: 0.95 } as const;

export const segChangePct = (g: { lastM: number; thisM: number }) => ((g.thisM - g.lastM) / g.lastM) * 100;
export const segTotals = () => {
  const last = SEG_GROUPS.reduce((n, g) => n + g.lastM, 0);
  const now = SEG_GROUPS.reduce((n, g) => n + g.thisM, 0);
  return { lastM: last, thisM: now, changePct: ((now - last) / last) * 100 };
};

// ─── §7 · Dashboard KPIs ───────────────────────────────────────────────────
/** spec: YTD growth figures. */
export const LOAN_GROWTH_YTD_PCT = 11.4;
export const SHARE_GROWTH_YTD_PCT = 4.1;

/** §7, the eight KPIs, verbatim. `value` is the tile's figure. */
export const KPIS = [
  {
    id: 'net_worth',
    name: 'Net worth ratio',
    value: '7.50%',
    illustrative: false,
    trend: 'stable',
    target: 'Above 7.0% early-warning line',
    source: 'Call Report + GL',
    calc: 'Net worth divided by total assets',
  },
  {
    id: 'loan_to_share',
    name: 'Loan-to-share ratio',
    value: '84%',
    illustrative: true,
    trend: 'up',
    target: 'Below the funding-review trigger',
    source: 'Symitar + GL',
    calc: 'Total loans divided by total shares',
  },
  {
    id: 'first_mortgage_nw',
    name: 'First mortgage as percent of net worth',
    value: '571%',
    illustrative: true,
    trend: 'up',
    target: 'Below the 600% board cap',
    source: 'Symitar + Cornerstone + UST Finex',
    calc: 'First-mortgage balance divided by net worth',
  },
  {
    id: 'hil_dq',
    name: 'Home Improvement Loan (unsecured) 60-day delinquency',
    value: '1.8%',
    illustrative: true,
    trend: 'up',
    target: 'At or below the 1.5% parameter',
    source: 'Symitar',
    calc: '60-day delinquent balance divided by segment balance',
  },
  {
    id: 'loan_growth',
    name: 'Loan growth, YTD',
    value: '11.4%',
    illustrative: true,
    trend: 'up',
    target: 'Within risk-tolerance parameters',
    source: 'Symitar',
    calc: 'Year-to-date change in net loans',
  },
  {
    id: 'share_growth',
    name: 'Share (deposit) growth, YTD',
    value: '4.1%',
    illustrative: true,
    trend: 'stable',
    target: 'Keeping pace with loan growth',
    source: 'Symitar + GL',
    calc: 'Year-to-date change in total shares',
  },
  {
    id: 'shutdown_liquidity',
    name: 'Liquidity headroom under a 30-day shutdown',
    value: 'About $35M surplus',
    illustrative: true,
    trend: 'down',
    target: 'Positive coverage of quarter outflows',
    source: 'UST Finex',
    calc: 'On-hand liquidity less projected scenario outflows',
  },
  {
    id: 'seg_deposits',
    name: 'SEG deposit change, month over month',
    value: 'Plus 0.6% overall; one group off 4.2%',
    illustrative: true,
    trend: 'mixed',
    target: 'No group past the 3% outflow trigger',
    source: 'Symitar',
    calc: 'Deposit amount and count change by core SEG',
  },
] as const;

/** Spec §1 data posture, stated on screen at the start. */
export const ILLUSTRATIVE_NOTICE =
  'All portfolio, delinquency, scenario, capital, liquidity and deposit figures are illustrative sample data, not USS FCU data. The public backdrop is real and sourced.';

// ─── Display helpers ───────────────────────────────────────────────────────
export const fmtM = (m: number, digits = 0) => `$${Math.abs(m).toFixed(digits)}M`;
export const fmtPct = (p: number, digits = 1) => `${p.toFixed(digits)}%`;
export const fmtSignedPct = (p: number, digits = 1) => `${p < 0 ? '−' : '+'}${Math.abs(p).toFixed(digits)}%`;
export const fmtInt = (n: number) => n.toLocaleString('en-US');

/**
 * Every value above that the spec does not state — the minimum its
 * visualizations need. Kept here so the review list cannot drift from the data.
 */
export const FILLED_VALUES = [
  'Delinquency: HIL for Q3 2024–Q3 2025 (0.9, 0.9, 1.0, 1.0, 1.0%) — the spec gives Q4 2025 (1.1%) and Q2 2026 (1.8%); Q1 2026 1.4%.',
  'Delinquency: "Other unsecured consumer credit" aggregate, 1.3% easing to 1.2% — implied by "rises across unsecured consumer credit".',
  'Limits: HELOC $118M against a 150% cap; HIL $48M against a 75% cap — both under 85% of their cap.',
  'Limits: first-mortgage growth $17M a quarter (two quarters uses the $33M headroom).',
  'Shutdown: 27% of members affected (about 14,200 of 52,500); projected 60-day delinquency HIL 3.2%, other unsecured 1.7%, HELOC 0.7%, first mortgage 0.45%.',
  'Cushion: funding-review trigger at 88% loan-to-share; loan-to-share after the shutdown 87%; pre-shutdown liquidity surplus $88M.',
  'Playbook: the 30-day boundary between the short and the extended band.',
  'SEG: six anonymised groups (Payroll A–E, all other), their balances and account counts; Payroll B −1.3%; group A outflow $5.0M, $4.05M of it certificate closures.',
] as const;
