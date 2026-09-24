/**
 * USSFCU Finance Team persona — the canonical numbers.
 *
 * Spec: "Finance Persona: Demo Narrative for Validation" (Radiant Digital,
 * prepared for Lauren, 2026-09-23). The narrative is three overnight signals
 * and six approved finance questions, in one line: see what is moving, check
 * it against our limits, model a shock, test our cushion, decide, then watch
 * the funding side. Every visual, tile and card reads its figures from here;
 * the chat prose (chatFlows.json) cannot import them, so financeData.test.ts
 * pins every figure the prose quotes to the value below.
 *
 * REAL vs ILLUSTRATIVE. Only PUBLIC_FACTS are USS FCU's public profile (the
 * narrative's backdrop, and the same three figures Tim Anderson's CEO briefing
 * already shows). Everything else is illustrative sample data authored for
 * the demo — "All figures are made-up sample data for the demo" — and every
 * surface that shows it carries the Illustrative data chip.
 *
 * DEMO TODAY is 2026-07-24, the frame the Evelyn and Nadia personas use, so
 * the latest closed quarter is Q2 2026 and "two quarters ago" is Q4 2025.
 */

export const DEMO_TODAY = '2026-07-24';
export const SCAN_AT = '2026-07-24T06:00:00';

/** The six approved finance questions, as the narrative asks them. */
export const FINANCE_QUESTIONS = {
  delinquency: 'Show delinquency trends by loan segment, and flag any pool trending up or outside our aligned parameters.',
  limits: 'Which portfolios are approaching our board risk-tolerance limits, such as mortgages capped at 600% of net worth?',
  rateShock: 'Model a rate shock of plus or minus 25, 50, and 100 basis points. What happens to our portfolio?',
  dryPowder: 'For that scenario, do we have enough dry powder? What happens to our capital ratios and liquidity?',
  playbook: 'For each rate move, what is the pre-set playbook action, for example at a quarter point versus a half point?',
  segDeposits: 'Show deposit activity by SEG group, and trigger an alert if more than a set percentage leaves.',
} as const;

/**
 * The chip labels for those questions. The narrative's full wording read as a
 * wall of text in the chip row, so each chip carries a short, specific label;
 * the full question stays the flow's `user_query` (and is routed too), so
 * typing or pasting the narrative's exact question still lands on its answer.
 */
export const FINANCE_CHIPS = {
  delinquency: 'Show delinquency trends by loan segment',
  limits: 'Which portfolios are near their board limits?',
  rateShock: 'Model a ±25, 50 and 100 bp rate shock',
  dryPowder: 'Do we have enough dry powder?',
  playbook: 'What is the playbook action for each rate move?',
  segDeposits: 'Show deposit activity by SEG group',
} as const;

// ─── Public profile (real) ──────────────────────────────────────────────────
/** Narrative, "The persona": USS FCU's public profile. Matches the CEO persona. */
export const PUBLIC_FACTS = {
  totalAssetsM: 1530, // "about $1.53B in assets"
  netWorthRatioPct: 7.5, // "a 7.50% net worth ratio"
  loanToSharePct: 84, // "loan-to-share at 84%"
} as const;

/** Net worth in $M — 7.50% of $1.53B = $114.75M. */
export const NET_WORTH_M = (PUBLIC_FACTS.totalAssetsM * PUBLIC_FACTS.netWorthRatioPct) / 100;

// ─── Balance sheet (illustrative, reconciled to the CEO persona) ───────────
/** Net loans and member shares, as Tim Anderson's liquidity signal quotes them. */
export const NET_LOANS_M = 1290;
export const MEMBER_SHARES_M = 1540;

/** Loan portfolio mix; sums to NET_LOANS_M. */
export const LOAN_MIX = [
  { id: 'first_mortgage', label: 'First mortgage', balanceM: 655 },
  { id: 'indirect_auto', label: 'Indirect auto', balanceM: 212 },
  { id: 'heloc', label: 'HELOC', balanceM: 118 },
  { id: 'direct_auto', label: 'Direct auto', balanceM: 96 },
  { id: 'member_business', label: 'Member business', balanceM: 77 },
  { id: 'credit_card', label: 'Credit card', balanceM: 74 },
  { id: 'personal', label: 'Personal', balanceM: 58 },
] as const;

const balanceOf = (id: string) => LOAN_MIX.find((l) => l.id === id)!.balanceM;

// ─── Q1 · Delinquency by loan segment ──────────────────────────────────────
export const DQ_QUARTERS = ["Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"] as const;

/**
 * 60-day delinquency (%) per segment across DQ_QUARTERS, against each
 * segment's aligned parameter. Indirect auto is the only pool that rises and
 * the only one above its parameter; the rest are flat or improving.
 */
export const DQ_SEGMENTS = [
  { id: 'indirect_auto', label: 'Indirect auto', parameterPct: 1.5, series: [1.0, 1.05, 1.1, 1.4, 1.8] },
  { id: 'first_mortgage', label: 'First mortgage', parameterPct: 0.75, series: [0.42, 0.41, 0.4, 0.4, 0.4] },
  { id: 'heloc', label: 'HELOC', parameterPct: 1.0, series: [0.62, 0.61, 0.6, 0.6, 0.6] },
  { id: 'direct_auto', label: 'Direct auto', parameterPct: 1.25, series: [0.74, 0.72, 0.7, 0.68, 0.66] },
  { id: 'credit_card', label: 'Credit card', parameterPct: 2.0, series: [1.32, 1.3, 1.28, 1.25, 1.22] },
  { id: 'personal', label: 'Personal', parameterPct: 1.75, series: [1.05, 1.02, 1.0, 0.98, 0.96] },
  { id: 'member_business', label: 'Member business', parameterPct: 1.0, series: [0.3, 0.3, 0.3, 0.3, 0.3] },
] as const;

/**
 * Indirect auto split by origination vintage: "The rise is concentrated in
 * loans originated in the last 18 months." Blends to the pool's 1.8%.
 */
export const INDIRECT_AUTO_VINTAGE = {
  recent: { label: 'Originated in the last 18 months', shareOfBalance: 0.45, dqPct: 2.6 },
  seasoned: { label: 'Originated earlier', shareOfBalance: 0.55, dqPct: 1.15 },
} as const;

export function blendedIndirectAutoDq(): number {
  const { recent, seasoned } = INDIRECT_AUTO_VINTAGE;
  return recent.shareOfBalance * recent.dqPct + seasoned.shareOfBalance * seasoned.dqPct;
}

// ─── Q2 · Board risk-tolerance limits ──────────────────────────────────────
/**
 * Concentration limits, as % of net worth. "No other portfolio is within
 * fifteen points of its limit" is read as share of the cap used: first
 * mortgage uses 95% of its cap, the next-closest 74%. Direct auto carries no
 * separate concentration limit in this illustrative policy.
 */
export const CONCENTRATION_LIMITS = [
  { id: 'first_mortgage', label: 'First mortgage', balanceM: balanceOf('first_mortgage'), capPctOfNw: 600 },
  { id: 'indirect_auto', label: 'Indirect auto', balanceM: balanceOf('indirect_auto'), capPctOfNw: 250 },
  { id: 'heloc', label: 'HELOC', balanceM: balanceOf('heloc'), capPctOfNw: 150 },
  {
    id: 'consumer_unsecured',
    label: 'Credit card + personal',
    balanceM: balanceOf('credit_card') + balanceOf('personal'),
    capPctOfNw: 200,
  },
  { id: 'member_business', label: 'Member business', balanceM: balanceOf('member_business'), capPctOfNw: 175 },
] as const;

/** First-mortgage growth pace used for "you reach the cap in roughly two quarters". */
export const MORTGAGE_GROWTH_PER_QUARTER_M = 17;

export const pctOfNetWorth = (balanceM: number) => (balanceM / NET_WORTH_M) * 100;
export const capUsePct = (balanceM: number, capPctOfNw: number) => (pctOfNetWorth(balanceM) / capPctOfNw) * 100;
export const capDollarsM = (capPctOfNw: number) => (NET_WORTH_M * capPctOfNw) / 100;
export const headroomM = (balanceM: number, capPctOfNw: number) => capDollarsM(capPctOfNw) - balanceM;

// ─── Q3 · Rate shock ───────────────────────────────────────────────────────
/** Early-warning line for the net worth ratio (also NCUA's well-capitalized floor). */
export const NW_EARLY_WARNING_PCT = 7.0;

/**
 * Balance-sheet effect of each parallel shock. Proportional across the
 * increments; minus mirrors plus. Loan income is 12-month, $M.
 */
export const RATE_SHOCKS = [
  { bps: -100, loanIncomeM: -10.0, nimBps: 16, investmentMarkM: 18, nwRatioPct: 7.9 },
  { bps: -50, loanIncomeM: -5.0, nimBps: 8, investmentMarkM: 9, nwRatioPct: 7.7 },
  { bps: -25, loanIncomeM: -2.5, nimBps: 4, investmentMarkM: 4.5, nwRatioPct: 7.6 },
  { bps: 25, loanIncomeM: 2.5, nimBps: -4, investmentMarkM: -4.5, nwRatioPct: 7.4 },
  { bps: 50, loanIncomeM: 5.0, nimBps: -8, investmentMarkM: -9, nwRatioPct: 7.3 },
  { bps: 100, loanIncomeM: 10.0, nimBps: -16, investmentMarkM: -18, nwRatioPct: 7.1 },
] as const;

// ─── Q4 · Dry powder under +100 bp ─────────────────────────────────────────
/** Loan-to-share level at which the funding review is triggered. */
export const FUNDING_REVIEW_TRIGGER_LTS_PCT = 88;

/** Quarter liquidity: on-hand vs projected outflows. +100 on-hand carries the $18M mark. */
export const LIQUIDITY = {
  base: { onHandM: 186, projectedOutflowsM: 98 },
  plus100: { onHandM: 168, projectedOutflowsM: 128 },
} as const;

export const liquiditySpareM = (s: { onHandM: number; projectedOutflowsM: number }) => s.onHandM - s.projectedOutflowsM;

export const STRESS = {
  base: { nwRatioPct: PUBLIC_FACTS.netWorthRatioPct, ltsPct: PUBLIC_FACTS.loanToSharePct },
  plus100: { nwRatioPct: 7.1, ltsPct: 88 },
} as const;

/** Member shares implied by +100's 88% loan-to-share on the same loan book. */
export const PLUS100_SHARES_M = Math.round(NET_LOANS_M / (STRESS.plus100.ltsPct / 100));

// ─── Q5 · Board playbook ───────────────────────────────────────────────────
export const PLAYBOOK = {
  title: 'ALCO Rate Response Playbook',
  approval: 'Board-approved · Jun 2026',
  tiers: [
    { bps: 25, label: '+25 bp', action: 'Hold deposit rates and monitor.' },
    {
      bps: 50,
      label: '+50 bp',
      action: 'Selectively raise certificate rates on the 12- and 18-month terms to defend balances.',
    },
    {
      bps: 100,
      label: '+100 bp',
      action:
        'Launch the deposit-gathering campaign and slow indirect-auto funding to protect the margin and the mortgage concentration.',
    },
  ],
} as const;

// ─── Q6 · Deposit activity by SEG ──────────────────────────────────────────
/** Month-over-month outflow that raises an alert on a SEG group. */
export const SEG_OUTFLOW_TRIGGER_PCT = 3;

/**
 * Core SEG groups, balances in $M, last month → this month. Anonymised on
 * purpose: the data is illustrative, so it is not attached to a real group.
 * Two payroll groups trend down; A crosses the 3% trigger.
 */
export const SEG_GROUPS = [
  { id: 'payroll_a', label: 'Payroll group A', kind: 'payroll', lastM: 118.0, thisM: 113.0, priorMonthPct: -1.1 },
  { id: 'payroll_b', label: 'Payroll group B', kind: 'payroll', lastM: 96.0, thisM: 94.5, priorMonthPct: -0.9 },
  { id: 'payroll_c', label: 'Payroll group C', kind: 'payroll', lastM: 84.0, thisM: 86.9, priorMonthPct: 0.8 },
  { id: 'retirees', label: 'Retirees & alumni', kind: 'member', lastM: 92.0, thisM: 95.0, priorMonthPct: 1.2 },
  { id: 'family', label: 'Family members', kind: 'member', lastM: 58.0, thisM: 60.1, priorMonthPct: 1.4 },
  { id: 'other', label: 'Other SEGs', kind: 'member', lastM: 38.0, thisM: 39.4, priorMonthPct: 0.9 },
] as const;

/** Of Payroll group A's outflow, the share that is certificate closures. */
export const SEG_A_OUTFLOW_MIX = { certificateClosuresM: 4.05, otherM: 0.95 } as const;

export const segChangePct = (g: { lastM: number; thisM: number }) => ((g.thisM - g.lastM) / g.lastM) * 100;
export const segTotals = () => {
  const last = SEG_GROUPS.reduce((n, g) => n + g.lastM, 0);
  const now = SEG_GROUPS.reduce((n, g) => n + g.thisM, 0);
  return { lastM: last, thisM: now, changePct: ((now - last) / last) * 100 };
};

// ─── Display helpers ───────────────────────────────────────────────────────
export const fmtM = (m: number, digits = 0) => `$${Math.abs(m).toFixed(digits)}M`;
export const fmtSignedM = (m: number, digits = 0) => `${m < 0 ? '−' : '+'}${fmtM(m, digits)}`;
export const fmtPct = (p: number, digits = 1) => `${p.toFixed(digits)}%`;
export const fmtSignedPct = (p: number, digits = 1) => `${p < 0 ? '−' : '+'}${Math.abs(p).toFixed(digits)}%`;
export const fmtBps = (b: number) => `${b > 0 ? '+' : b < 0 ? '−' : ''}${Math.abs(b)} bp`;
