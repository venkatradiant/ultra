/**
 * Canonical numbers for the Maryland DoIT (VOCE) tenant.
 *
 * Every figure here is ILLUSTRATIVE. Nothing describes real Maryland program
 * data — the Data Sources screen carries that statement.
 *
 * One rule governs this file: a number the viewer watches the UI compute must
 * agree with every number quoted about it afterwards. That is why
 * `computeValidCount` exists rather than a hardcoded total — the cleaning card,
 * the cleaning receipt and the report's methodology line all call it, so they
 * cannot drift from each other no matter which fixes the author accepts.
 */

// ─── Survey 1 — Maryland Resident Experience Survey (closed) ────────

export const SURVEY_1_TOTAL = 212;

export interface CleaningFix {
  key: CleaningKey;
  /** What the row excludes, stated as what it actually removes. */
  label: string;
  description: string;
  /** The disposition, not a generic verb. */
  action: string;
  /** Responses this fix removes from the analysis set. */
  excludes: number;
}

export type CleaningKey = 'incomplete' | 'duplicates' | 'speeders' | 'junk' | 'zipcodes';

export const CLEANING_FIXES: CleaningFix[] = [
  {
    key: 'incomplete',
    label: '8 incomplete responses',
    description: 'Stopped after the first question — likely abandoned.',
    action: 'Exclude 8',
    excludes: 8,
  },
  {
    key: 'duplicates',
    label: '3 duplicate submissions',
    description: 'Same respondent ID three times. Keeps the most recent, drops the two earlier ones.',
    action: 'Exclude 2',
    excludes: 2,
  },
  {
    key: 'speeders',
    label: '14 speeders',
    description:
      'Completed in under 25 seconds, below a realistic reading time. Often someone clicking through without reading — but that is a judgement call, so this one is yours.',
    action: 'Exclude 14',
    excludes: 14,
  },
  {
    key: 'junk',
    label: '1 junk open-text entry',
    description: '"asdf jkl" in the comments field. The response itself still counts — only the comment is dropped from theme analysis.',
    action: 'Drop the comment, keep the response',
    excludes: 0,
  },
  {
    key: 'zipcodes',
    label: '6 ZIP codes with stray characters',
    description: 'Non-standard formatting. Standardised in place, so no response is lost.',
    action: 'Standardise 6',
    excludes: 0,
  },
];

export type CleaningSelection = Record<CleaningKey, boolean>;

/**
 * Speeders start UNCHECKED and the other four checked.
 *
 * That is a content decision, not an accident: it makes the golden path compute
 * 212 − 8 − 2 = 202 on screen, which is the figure every downstream card and the
 * cross-survey total quote. A viewer who just watched the card derive 202 will
 * believe a report footnote that says 202. Checking the speeders row instead
 * yields 188, and the methodology line follows it there.
 */
export const DEFAULT_CLEANING: CleaningSelection = {
  incomplete: true,
  duplicates: true,
  speeders: false,
  junk: true,
  zipcodes: true,
};

/** Valid responses remaining once the selected fixes are applied. */
export function computeValidCount(checked: Partial<CleaningSelection>): number {
  return CLEANING_FIXES.reduce(
    (remaining, fix) => remaining - (checked[fix.key] ? fix.excludes : 0),
    SURVEY_1_TOTAL,
  );
}

/** How many of the five fixes are selected. */
export function countAppliedFixes(checked: Partial<CleaningSelection>): number {
  return CLEANING_FIXES.filter((fix) => checked[fix.key]).length;
}

/**
 * The methodology sentence, templated so it can never contradict the card above
 * it. The prototype hardcoded "199 valid responses" under a card that computed
 * something else; this is the fix.
 */
export function methodologyLine(checked: Partial<CleaningSelection>): string {
  const valid = computeValidCount(checked);
  const kept = !checked.speeders;
  const retention = kept ? ' (14 fast responses retained per author review)' : '';
  return `${valid} valid responses after data cleaning${retention}. Maryland Resident Experience Survey.`;
}

/** The AI's own account of what it just did — same source, so it agrees. */
export function cleaningSummaryLine(checked: Partial<CleaningSelection>): string {
  const applied = countAppliedFixes(checked);
  const keptClause = checked.speeders ? '' : ' and kept the 14 fast responses per your call';
  return `Done. I applied ${applied} of the ${CLEANING_FIXES.length} fixes${keptClause}.`;
}

/** The published figure for this survey — the golden path's result. */
export const SURVEY_1_PUBLISHED_VALID = computeValidCount(DEFAULT_CLEANING); // 202

// ─── Survey 1 findings ──────────────────────────────────────────────

export const SURVEY_1_FINDINGS = {
  satisfactionPct: 72,
  satisfactionDeltaPts: -6,
  waitTimesSharePct: 38,
  staffCourtesy: '4.4 / 5',
  completionPct: 88,
} as const;

// ─── Survey 2 — Permit Renewal Feedback (draft) ─────────────────────

export const SURVEY_2 = {
  name: 'Permit Renewal Feedback',
  questionsComplete: 6,
  questionsTotal: 9,
  q7SuggestedOptions: ['Very easy', 'Somewhat easy', 'Somewhat difficult', 'Very difficult'],
  q5Rewrites: [
    'How long did it take to renew your permit?',
    'How much time did the renewal process take?',
  ],
} as const;

export const DISTRIBUTION_LISTS = [
  { id: 'permit-renewers-2025', name: 'Permit Renewers 2025', contacts: 1800 },
  { id: 'all-residents', name: 'All Residents', contacts: 12400 },
  { id: 'service-center-q1', name: 'Service Center Visitors Q1', contacts: 340 },
] as const;

// ─── The survey portfolio (admin) ───────────────────────────────────

export interface PortfolioSurvey {
  id: string;
  name: string;
  platform: PlatformName;
  period: string;
  responses: number;
  author: string;
}

export type PlatformName = 'VOCE' | 'Qualtrics' | 'Microsoft Forms' | 'Google Forms';

/**
 * Survey 1 carries 202 — the number the author's cleaning card derives on the
 * golden path. The prototype had 199 here and 202 on the card, which is the one
 * inconsistency its own notes waved through.
 */
export const PORTFOLIO_SURVEYS: PortfolioSurvey[] = [
  { id: 's1', name: 'Maryland Resident Experience Survey', platform: 'VOCE', period: 'Q2 2025', responses: SURVEY_1_PUBLISHED_VALID, author: 'Sarah Chen' },
  { id: 's2', name: 'Service Center Satisfaction Survey', platform: 'Qualtrics', period: 'Q2 2025', responses: 312, author: 'Marcus Johnson' },
  { id: 's3', name: 'Resident Pulse Q2', platform: 'Microsoft Forms', period: 'Q2 2025', responses: 287, author: 'Lisa Park' },
  { id: 's4', name: 'Permit Satisfaction Survey', platform: 'VOCE', period: 'Q1 2025', responses: 178, author: 'Sarah Chen' },
  { id: 's5', name: 'Agency Feedback Survey Q1', platform: 'Google Forms', period: 'Q1 2025', responses: 241, author: 'James Okafor' },
  { id: 's6', name: 'New Resident Onboarding Survey', platform: 'Qualtrics', period: 'Q4 2024', responses: 213, author: 'Marcus Johnson' },
];

/** Derived, never typed by hand — 1,433 with survey 1 at 202. */
export const CROSS_SURVEY_TOTAL = PORTFOLIO_SURVEYS.reduce((sum, s) => sum + s.responses, 0);

export const ACTIVE_SURVEYS = 18;

/** Brand chips for the platform a survey lives on. Consistent in four places. */
export const PLATFORM_COLORS: Record<PlatformName, string> = {
  VOCE: '#1a4480',
  Qualtrics: '#0066cc',
  'Microsoft Forms': '#107c10',
  'Google Forms': '#c5221f',
};

// ─── Cross-survey findings ──────────────────────────────────────────

export const CROSS_SURVEY = {
  surveysInScope: 6,
  waitTimesSharePct: 41,
  waitTimesDeltaPct: 9,
  topThemeIn: 4,
  topThemeOf: 6,
  satisfactionStart: 80,
  satisfactionEnd: 72,
} as const;

export const REGIONAL_BREAKDOWN = [
  { region: 'Western', pct: 58, outlier: true },
  { region: 'Central', pct: 39, outlier: false },
  { region: 'Eastern', pct: 31, outlier: false },
  { region: 'Northern', pct: 28, outlier: false },
] as const;

// ─── Approval queue ─────────────────────────────────────────────────

export const APPROVAL_QUEUE = [
  {
    id: 'ap-1',
    name: 'Permit Renewal Feedback',
    author: 'Sarah Chen',
    questions: 9,
    launch: 'Tomorrow',
    recipients: 1800,
    preview: [
      'Overall, how satisfied were you with the permit renewal process?',
      'How did you submit your renewal this time?',
      'Did you encounter any problems during the renewal?',
      'If yes, what type of problem did you encounter?',
      'About how long did the renewal process take from start to finish?',
      'Did you need to contact the office for help at any point?',
      'How easy was the permit renewal process overall?',
      'What is the one thing we could do to make permit renewal easier?',
      'Would you recommend renewing online to others?',
    ],
  },
  {
    id: 'ap-2',
    name: 'Service Center Exit Survey',
    author: 'James Okafor',
    questions: 6,
    launch: 'Thursday',
    recipients: 420,
    preview: [
      'Which service center did you visit today?',
      'About how long did you wait before being seen?',
      'Was your issue resolved during this visit?',
      'How would you rate the courtesy of the staff who helped you?',
      'Did you have to visit more than once for this issue?',
      'What would have made today’s visit easier?',
    ],
  },
] as const;

export const DATA_QUALITY_FLAG = {
  survey: 'Permit Satisfaction Survey',
  responses: 22,
  reason: 'submitted from a single IP range within 40 minutes',
} as const;
