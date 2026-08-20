/**
 * Canonical numbers for the AMISA tenant.
 *
 * Two kinds of fact live in this file and they are kept apart on purpose.
 *
 * PUBLIC_FACTS are real and sourced to amisa.us, the RFP question-and-answer
 * document, or Dr. Rhoads on the August 6, 2026 call. Everything else is
 * ILLUSTRATIVE and must carry the `Illustrative data` chip wherever it renders.
 * The Data Sources screen states that division; this file is where it is
 * actually enforced, because a figure that is not in PUBLIC_FACTS has no claim
 * to being real no matter how confidently a card prints it.
 *
 * One rule governs the illustrative half: a number the viewer watches the UI
 * compute must agree with every number quoted about it afterwards. That is why
 * `computeValidCount` exists rather than a hardcoded 298 — the sweep card, the
 * benchmark's methodology line and the published summary all call it, so they
 * cannot drift no matter which fixes Dr. Rhoads accepts.
 */

// ─── Real, public backdrop ──────────────────────────────────────────

/**
 * Deliberately NO founding year.
 *
 * amisa.us dates the formal founding to 1977; Dr. Rhoads described 2026 as the
 * association's 50th anniversary year, which implies 1976, and the association
 * traces its origin to 1961. Those do not reconcile, and the intake asks that a
 * founding year stay off the screen until AMISA confirms which one it uses
 * publicly. Do not add one here to "complete" the record.
 */
export const PUBLIC_FACTS = {
  name: 'American International Schools in the Americas',
  shortName: 'AMISA',
  motto: 'Better Together',
  mission: 'To enhance the quality of education in American and international member schools.',
  vision: 'To be the most trusted network for the schools we serve in the Americas.',
  headquarters: 'Doral, Florida',
  status: '501(c)(3) nonprofit membership association',
  /** Renamed from the Association of American Schools in South America in 2021. */
  formerName: 'Association of American Schools in South America',
  renamedIn: 2021,
  /** PK–12 American international schools using an American curriculum. */
  memberProfile: 'PK–12 American international schools using an American curriculum',
  membershipConditions: [
    'Accredited by a recognised US or international accrediting agency',
    'Child protection policies in place',
  ],
  countries: 25,
  staff: 7,
} as const;

/**
 * Member schools. UNCONFIRMED, and held here as a single constant so it can be
 * changed in one place once Dr. Rhoads confirms it.
 *
 * Three numbers are in circulation: amisa.us says 65, the public school
 * membership listing shows 80+ entries (but schools appear in more than one
 * section, so it is not a clean count), and Dr. Rhoads gave 70 in the RFP
 * question-and-answer document and repeated it on the August 6 call. 70 wins
 * because it is the figure the selection committee will have in front of them
 * in their own document. "70, maybe 71" was a spoken hedge, not a figure.
 */
export const MEMBER_SCHOOLS = 70;

/** Projections from strategic planning. Not collected data — label as estimates. */
export const PARTICIPATION_OUTLOOK = {
  yearOneLow: 25,
  yearOneHigh: 35,
  laterYearsLow: 10,
  laterYearsHigh: 15,
  /** ~70 schools × 5–7 offices each, one lead coordinator per office. */
  namedUsersApprox: 500,
  officesPerSchoolLow: 5,
  officesPerSchoolHigh: 7,
} as const;

// ─── The cycle ──────────────────────────────────────────────────────

/**
 * One attempt per year, and the whole demo sits on the last day of it. The
 * survey opens August 1, collection runs two months, benchmarks must be live to
 * schools October 1.
 *
 * `TODAY` is the demo's fixed clock. Dr. Rhoads' briefing is September 30 — the
 * window closed overnight, which is why there is a completed sweep to review
 * and exactly one day before publication.
 */
export const SURVEY_WINDOW = {
  opens: 'August 1',
  closes: 'September 30',
  publishBy: 'October 1',
  collectionMonths: 2,
  today: 'September 30',
  daysRemaining: 1,
} as const;

// ─── Privacy ────────────────────────────────────────────────────────

/**
 * The minimum number of contributing schools before a benchmark renders.
 *
 * ILLUSTRATIVE DEFAULT, and it must be presented as one. AMISA confirmed that
 * real thresholds are set per survey and per office during governance design,
 * because HR, Finance and Academic data carry different identification risk —
 * HR may need 5 where Finance needs 8. Every surface that shows this number
 * also shows `MIN_PEER_GROUP_NOTE`.
 */
export const MIN_PEER_GROUP = 5;

export const MIN_PEER_GROUP_NOTE =
  `Illustrative default of ${MIN_PEER_GROUP}. AMISA sets real suppression thresholds per survey and per office during governance design.`;

/**
 * The axes a peer group may be built on.
 *
 * Country is absent and must stay absent. AMISA has exactly one member school
 * in Chile, so any cut by country identifies it — the single fact that shaped
 * every screen in this tenant. `suppression.ts` enforces this at runtime and
 * `amisaData.test.ts` asserts it; this constant exists so the rule is also
 * readable rather than only implied.
 */
export const PEER_GROUP_AXES = ['enrollment', 'tuition'] as const;
export type PeerGroupAxis = (typeof PEER_GROUP_AXES)[number];

// ─── The Human Resources survey wave (illustrative) ─────────────────

/**
 * A "response" here is one submitted salary record — a position × degree ×
 * years-of-experience row — not one school and not one person. A salary survey
 * collects several rows per school, which is why 29 schools produce 312
 * responses and why only 24 of them carry the master's-plus-three-years
 * combination the hero benchmark asks about.
 *
 * Saying this out loud matters: a committee of school IT directors will divide
 * 312 by 29, get 10.8, and want to know what a response actually is.
 */
export const HR_SURVEY = {
  name: 'Human Resources Salary and Benefits Survey',
  office: 'Human Resources',
  questions: 14,
  totalResponses: 312,
  schoolsSubmitted: 29,
  completionPct: 88,
} as const;

export type SweepKey = 'incomplete' | 'duplicates' | 'narrative' | 'outliers' | 'strayChars' | 'fast';

export interface SweepFinding {
  key: SweepKey;
  /** What was found, stated as a count of records. */
  label: string;
  /** WHY it was flagged. The intake asks for a reason on every item. */
  reason: string;
  /** The disposition, not a generic verb. */
  action: string;
  /** Records this finding removes from the analysis set. */
  excludes: number;
  /**
   * `true` when the platform will not decide for him. Answering quickly is a
   * judgement call, not a rule, so it is handed back rather than proposed.
   */
  judgement?: boolean;
}

/**
 * The sweep. Every finding is a PROPOSAL with a checkbox, never an action
 * already taken — that distinction is the point of the whole screen.
 *
 * The arithmetic is load-bearing. 8 + 3 + 1 + 2 = 14 excluded by default, and
 * 312 − 14 = 298, which is the figure every downstream card quotes. The stray
 * characters are standardised in place and cost nothing; the 14 fast responses
 * start unchecked and are his call.
 */
export const SWEEP_FINDINGS: SweepFinding[] = [
  {
    key: 'incomplete',
    label: '8 incomplete records',
    reason: 'Opened and abandoned before the salary section — no usable figures in them.',
    action: 'Exclude 8',
    excludes: 8,
  },
  {
    key: 'duplicates',
    label: '3 duplicate submissions',
    reason: 'Three schools submitted the same position record twice, most likely a double-send. Keeps the most recent of each and drops the earlier copy.',
    action: 'Exclude 3',
    excludes: 3,
  },
  {
    key: 'narrative',
    label: '1 narrative entry in a numeric field',
    reason: 'A salary field reading "varies by contract". This is the case Dr. Rhoads raised directly: text where a number belongs cannot be averaged, and guessing at it would be worse than dropping it.',
    action: 'Exclude 1 from the salary benchmark',
    excludes: 1,
  },
  {
    key: 'outliers',
    label: '2 figures far outside the range',
    reason: 'Two salaries roughly ten times the group median — consistent with a local-currency amount entered in a field defined as USD. Flagged rather than corrected, because the platform does not know which currency was meant.',
    action: 'Exclude 2, return to the school',
    excludes: 2,
  },
  {
    key: 'strayChars',
    label: '6 enrolment figures with stray characters',
    reason: 'Values like "1,100 students" and "~950" in a numeric field. Unambiguous, so they are standardised in place and no record is lost.',
    action: 'Standardise 6',
    excludes: 0,
  },
  {
    key: 'fast',
    label: '14 records completed unusually fast',
    reason: 'Submitted faster than the section can realistically be read. That may mean a coordinator pasting from a spreadsheet they had already prepared, which is legitimate. The platform will not decide this one.',
    action: 'Exclude 14',
    excludes: 14,
    judgement: true,
  },
];

export type SweepSelection = Record<SweepKey, boolean>;

/**
 * Everything checked EXCEPT the judgement call.
 *
 * That is a content decision, not an accident: it makes the card compute
 * 312 − 14 = 298 on screen, which is the figure the benchmark, the peer
 * comparison and the published summary all quote. A viewer who just watched the
 * card derive 298 will believe a footnote that says 298. Checking the fast
 * records too yields 284, and the methodology line follows it there.
 */
export const DEFAULT_SWEEP: SweepSelection = {
  incomplete: true,
  duplicates: true,
  narrative: true,
  outliers: true,
  strayChars: true,
  fast: false,
};

/** Valid records remaining once the selected findings are applied. */
export function computeValidCount(checked: Partial<SweepSelection>): number {
  // Explicit <number>: HR_SURVEY is `as const`, so the seed's literal type 312
  // would otherwise be inferred as the accumulator type and reject the subtraction.
  return SWEEP_FINDINGS.reduce<number>(
    (remaining, f) => remaining - (checked[f.key] ? f.excludes : 0),
    HR_SURVEY.totalResponses,
  );
}

/** How many of the findings are selected. */
export function countAppliedFindings(checked: Partial<SweepSelection>): number {
  return SWEEP_FINDINGS.filter((f) => checked[f.key]).length;
}

/**
 * The methodology sentence, templated so it can never contradict the card above
 * it or the benchmark below it.
 */
export function methodologyLine(checked: Partial<SweepSelection>): string {
  const valid = computeValidCount(checked);
  const retention = checked.fast ? '' : ' (14 fast records retained per Executive Director review)';
  return `${valid} valid records of ${HR_SURVEY.totalResponses} after the data-quality sweep${retention}. ${HR_SURVEY.name}.`;
}

/** The AI's own account of what it just did — same source, so it agrees. */
export function sweepSummaryLine(checked: Partial<SweepSelection>): string {
  const applied = countAppliedFindings(checked);
  const keptClause = checked.fast ? '' : ' and kept the 14 fast records per your call';
  return `Done. I applied ${applied} of the ${SWEEP_FINDINGS.length} proposed fixes${keptClause}.`;
}

/** The published figure for this wave — the golden path's result. 298. */
export const HR_PUBLISHED_VALID = computeValidCount(DEFAULT_SWEEP);

// ─── The hero benchmark (illustrative) ──────────────────────────────

/**
 * "What is the average teacher salary for a master's degree with 3 years of
 * experience?" — Dr. Rhoads' own words on the August 6 call, which is why it is
 * the question the demo answers.
 *
 * `contributingSchools` is smaller than the 29 that submitted because not every
 * school employs a teacher at that exact degree-and-experience combination, and
 * because the sweep removed records. It is quoted on screen for exactly that
 * reason: a benchmark that does not say how many schools stand behind it is a
 * number without a claim.
 */
export const HERO_BENCHMARK = {
  question: "What is the average teacher salary for a master's degree with 3 years of experience?",
  value: 34800,
  currency: 'USD',
  contributingSchools: 24,
  confidence: 94,
  degree: "Master's",
  yearsExperience: 3,
} as const;

/**
 * The definition that travels with the question.
 *
 * Publishing this at the point of entry rather than at the point of analysis is
 * what makes the answers comparable at all — today the same question is
 * answered four different ways because no definition ships with it.
 */
export const BENCHMARK_DEFINITIONS = {
  'teacher-salary': {
    term: 'Average teacher salary',
    definition: 'Base salary only. Excludes housing, benefits, allowances and bonuses. Expressed as a full-time equivalent (FTE) annual amount in USD.',
    appliesTo: 'Human Resources · Salary and benefits',
  },
  enrollment: {
    term: 'Enrollment',
    definition: 'Total students enrolled PK–12 on the October census date of the current school year.',
    appliesTo: 'Business Office · Enrolment and tuition',
  },
  tuition: {
    term: 'Published tuition',
    definition: 'Published annual tuition for the grade band, before discounts, scholarships or sibling remission. USD.',
    appliesTo: 'Business Office · Enrolment and tuition',
  },
} as const;

export type DefinitionKey = keyof typeof BENCHMARK_DEFINITIONS;

// ─── The standing disclosure ────────────────────────────────────────

/**
 * The line the Maryland VOCE screens carry and the intake asks AMISA to carry
 * too. Rendered by the shared IllustrativeDataChip / page furniture, not
 * retyped per card.
 */
export const ILLUSTRATIVE_LINE = 'Interface shown with illustrative data.';
