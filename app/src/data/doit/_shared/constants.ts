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
  q7SuggestedOptions: ['Very easy', 'Somewhat easy', 'Somewhat difficult', 'Very difficult'],
  q5Rewrites: [
    'How long did it take to renew your permit?',
    'How much time did the renewal process take?',
  ],
} as const;

// ─── Survey 2's questions — the author's editable draft ─────────────

/**
 * The draft's questions live HERE rather than inside DraftSurveyPanel, and the
 * live copy lives in `authorState.draftQuestions`.
 *
 * Why it matters: the panel used to hold them in component-local `useState`, so
 * everything the author typed was thrown away the moment the conversation moved
 * past that turn. The resident preview and the publish receipt then had nothing
 * to read and quoted string literals instead — which is why the preview showed
 * one hardcoded question no matter what the author had just written.
 *
 * The administrator's approval queue reads the same array (see APPROVAL_QUEUE),
 * so the two personas cannot describe the same survey differently.
 */
export type DraftQuestionType =
  | 'Scale (1–5)'
  | 'Likert (5-point agreement)'
  | 'Yes / No'
  | 'Multi-select'
  | 'Multi-select (adaptive)'
  | 'Single-select'
  | 'Open text';

export interface DraftQuestion {
  id: string;
  text: string;
  type: DraftQuestionType;
  /** `null` for open text. `[]` means the question is not yet answerable. */
  options: string[] | null;
  /** VOCE's note about the question, e.g. an adaptive-display rule. */
  aiNote?: string;
}

/** Default answer options per question type. `null` = the resident types. */
export const TYPE_DEFAULTS: Record<DraftQuestionType, string[] | null> = {
  'Scale (1–5)': ['1 — Very dissatisfied', '2 — Dissatisfied', '3 — Neutral', '4 — Satisfied', '5 — Very satisfied'],
  'Likert (5-point agreement)': ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree'],
  'Yes / No': ['Yes', 'No'],
  'Multi-select': ['Option A', 'Option B', 'Option C'],
  'Multi-select (adaptive)': ['Option A', 'Option B', 'Option C'],
  'Single-select': ['Option A', 'Option B', 'Option C', 'Option D'],
  'Open text': null,
};

export const DRAFT_QUESTION_TYPES = Object.keys(TYPE_DEFAULTS) as DraftQuestionType[];

/** Q7 ships with no options. That is the one thing genuinely blocking the send. */
export const SURVEY_2_QUESTIONS: DraftQuestion[] = [
  { id: 'q1', text: 'Overall, how satisfied were you with the permit renewal process?', type: 'Scale (1–5)', options: TYPE_DEFAULTS['Scale (1–5)'] },
  { id: 'q2', text: 'How did you submit your renewal this time?', type: 'Single-select', options: ['Online portal', 'By mail', 'In person at a service center', 'By phone'] },
  { id: 'q3', text: 'Did you encounter any problems during the renewal?', type: 'Yes / No', options: ['Yes', 'No'] },
  { id: 'q4', text: 'If yes, what type of problem did you encounter?', type: 'Multi-select (adaptive)', aiNote: 'Shown only if Q3 = Yes', options: ['Website or portal issue', 'Long processing time', 'Missing or incorrect instructions', 'Payment problem', 'Other'] },
  { id: 'q5', text: 'About how long did the renewal process take from start to finish?', type: 'Single-select', options: ['Less than 30 minutes', '30 minutes to 2 hours', '2–8 hours', 'More than a day', 'Still in progress'] },
  { id: 'q6', text: 'Did you need to contact the office for help at any point?', type: 'Yes / No', options: ['Yes', 'No'] },
  { id: 'q7', text: 'How easy was the permit renewal process overall?', type: 'Single-select', options: [] },
  { id: 'q8', text: 'What is the one thing we could do to make permit renewal easier?', type: 'Open text', options: null },
  { id: 'q9', text: 'Would you recommend renewing online to others?', type: 'Yes / No', options: ['Yes', 'No', 'Not sure'] },
];

/** A question is answerable when it either takes free text or offers a choice. */
export const isQuestionComplete = (q: DraftQuestion): boolean =>
  q.options === null || q.options.length > 0;

/**
 * How the draft stands before the author touches it.
 *
 * DERIVED, and it replaces a hand-written `questionsComplete: 6` that no rule
 * produced. Three surfaces describe this one draft — the signal card, the AI's
 * opening line and the panel's own banner — and the panel has always counted
 * answerable questions, which is eight of nine. The prose said six. A test pins
 * the sentence to this number so they cannot drift again.
 */
export const SURVEY_2_COMPLETE = SURVEY_2_QUESTIONS.filter(isQuestionComplete).length;
export const SURVEY_2_TOTAL = SURVEY_2_QUESTIONS.length;
export const SURVEY_2_BLOCKING = SURVEY_2_TOTAL - SURVEY_2_COMPLETE;

// ─── Describing the options you want, rather than typing them ───────

/**
 * The author tells VOCE what KIND of options a question needs; VOCE returns a
 * set. Deterministic keyword matching rather than a model call: the demo has to
 * produce the same options every run, and the suite has to be able to assert it.
 *
 * Order matters — the first bucket whose triggers appear in the description
 * wins, so the more specific scales are listed before the generic ones.
 */
export const OPTION_RECIPES: Array<{ id: string; label: string; triggers: string[]; options: string[] }> = [
  { id: 'ease', label: 'A 4-point ease scale', triggers: ['easy', 'ease', 'difficult', 'difficulty', 'simple'], options: ['Very easy', 'Somewhat easy', 'Somewhat difficult', 'Very difficult'] },
  { id: 'satisfaction', label: 'A 5-point satisfaction scale', triggers: ['satisf', 'happy', 'pleased'], options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'] },
  { id: 'agreement', label: 'A 5-point agreement scale', triggers: ['agree', 'likert', 'disagree'], options: ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree'] },
  { id: 'frequency', label: 'A 5-point frequency scale', triggers: ['often', 'frequen', 'how many times', 'regular'], options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'] },
  { id: 'duration', label: 'A duration range', triggers: ['how long', 'time', 'duration', 'minutes', 'hours', 'wait'], options: ['Less than 15 minutes', '15 to 30 minutes', '30 to 60 minutes', 'More than an hour'] },
  { id: 'yesno', label: 'Yes / No, with an out', triggers: ['yes or no', 'yes/no', 'yes no', 'binary'], options: ['Yes', 'No', 'Not sure'] },
  { id: 'likelihood', label: 'A 5-point likelihood scale', triggers: ['likely', 'recommend', 'would you'], options: ['Very likely', 'Likely', 'Neither likely nor unlikely', 'Unlikely', 'Very unlikely'] },
];

/** The bucket used when nothing in the description matches. */
export const DEFAULT_OPTION_RECIPE = OPTION_RECIPES[0];

/**
 * Turn a plain-English description into answer options.
 *
 * Never returns an empty set: an author who describes something VOCE has no
 * recipe for still gets a usable scale plus the label saying which one, rather
 * than a question that is still blocking the send.
 */
export function generateOptions(description: string): { recipe: (typeof OPTION_RECIPES)[number]; options: string[] } {
  const lower = (description || '').toLowerCase();
  const recipe = OPTION_RECIPES.find((r) => r.triggers.some((t) => lower.includes(t))) ?? DEFAULT_OPTION_RECIPE;
  return { recipe, options: [...recipe.options] };
}

/**
 * Who signs a survey off before it reaches a resident.
 *
 * The author does not publish. Publishing is a two-name act in this
 * organisation: the author submits, the manager approves. Named here once so
 * the confirm dialog, the receipt and the notification panel agree.
 */
export const APPROVER = {
  name: 'Dana Whitfield',
  role: 'Research Manager',
  turnaround: 'usually within a business day',
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

export interface ApprovalItem {
  id: string;
  name: string;
  author: string;
  questions: number;
  launch: string;
  recipients: number;
  /**
   * The full question list the approver reviews.
   *
   * Deliberately the SAME shape as the author's draft, and for ap-1 literally
   * the same array. An approver signing off on wording alone cannot see what a
   * resident will actually be able to answer — a five-point scale and a yes/no
   * are different surveys — so the type and the options travel with the text.
   */
  preview: DraftQuestion[];
}

/** Q7's options are filled in from the author's suggestion, since the survey
 *  reaching the approval queue at all means the author unblocked it. */
const SURVEY_2_FOR_APPROVAL: DraftQuestion[] = SURVEY_2_QUESTIONS.map((q) =>
  q.id === 'q7' && q.options?.length === 0 ? { ...q, options: [...SURVEY_2.q7SuggestedOptions] } : q,
);

export const APPROVAL_QUEUE: ApprovalItem[] = [
  {
    id: 'ap-1',
    name: SURVEY_2.name,
    author: 'Sarah Chen',
    questions: SURVEY_2_FOR_APPROVAL.length,
    launch: 'Tomorrow',
    recipients: 1800,
    preview: SURVEY_2_FOR_APPROVAL,
  },
  {
    id: 'ap-2',
    name: 'Service Center Exit Survey',
    author: 'James Okafor',
    questions: 6,
    launch: 'Thursday',
    recipients: 420,
    preview: [
      { id: 'sc1', text: 'Which service center did you visit today?', type: 'Single-select', options: ['Baltimore City', 'Annapolis', 'Frederick', 'Salisbury', 'Hagerstown'] },
      { id: 'sc2', text: 'About how long did you wait before being seen?', type: 'Single-select', options: ['Under 10 minutes', '10 to 30 minutes', '30 to 60 minutes', 'Over an hour'] },
      { id: 'sc3', text: 'Was your issue resolved during this visit?', type: 'Yes / No', options: ['Yes', 'No', 'Partly'] },
      { id: 'sc4', text: 'How would you rate the courtesy of the staff who helped you?', type: 'Scale (1–5)', options: TYPE_DEFAULTS['Scale (1–5)'] },
      { id: 'sc5', text: 'Did you have to visit more than once for this issue?', type: 'Yes / No', options: ['Yes', 'No'] },
      { id: 'sc6', text: 'What would have made today’s visit easier?', type: 'Open text', options: null },
    ],
  },
];

/**
 * The flagged responses, and the survey they came from.
 *
 * The denominator is LOOKED UP rather than typed. The card used to say "22 of
 * 201" while PORTFOLIO_SURVEYS put the same survey at 178 — two numbers for one
 * dataset, in a tenant whose whole argument is that its figures agree.
 */
const FLAGGED_SURVEY = PORTFOLIO_SURVEYS.find((s) => s.name === 'Permit Satisfaction Survey')!;

export const DATA_QUALITY_FLAG = {
  survey: FLAGGED_SURVEY.name,
  responses: 22,
  total: FLAGGED_SURVEY.responses,
  reason: 'submitted from a single IP range within 40 minutes',
} as const;

/** Share of the survey the flagged responses represent, rounded. */
export const DATA_QUALITY_FLAG_PCT = Math.round(
  (DATA_QUALITY_FLAG.responses / DATA_QUALITY_FLAG.total) * 100,
);
