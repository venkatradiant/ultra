/**
 * Ana Lucía's Human Resources assignment — its definition and the pure
 * functions that validate it.
 *
 * TWO THINGS LIVE HERE THAT USUALLY LIVE IN A COMPONENT, and both are
 * deliberate.
 *
 * THE DEFINITIONS travel with the questions. That is the demo's argument about
 * comparability: today the same question is answered four different ways
 * because no definition ships with it, and the fix is at the point of entry
 * rather than in the analysis. A definition stored beside the question is a
 * definition every school sees.
 *
 * THE VALIDATION is pure and lives outside the form, because the same rules
 * have to hold in two places — the question-by-question runtime and the
 * spreadsheet upload path. A rule implemented twice is a rule that eventually
 * disagrees with itself, and the whole claim of the upload path is that "the
 * same validation runs on every row".
 *
 * The 14-question section is modelled with 6 questions rendered. That is a
 * demo-fidelity decision rather than a gap: the assignment reports 14 because
 * that is what the talk track says, and `QUESTIONS_TOTAL` is the single place
 * to change it if AMISA confirms a different count.
 */

/** What the assignment claims to be, as shown to the coordinator. */
export const QUESTIONS_TOTAL = 14;
export const ASSIGNMENT = {
  office: 'Human Resources',
  section: 'Salary and Benefits',
  dueDate: 'September 30',
  school: 'Cordillera International School',
} as const;

export type FieldType = 'currency' | 'integer' | 'percent' | 'singleselect' | 'open';

export interface AssignmentQuestion {
  id: string;
  /** Displayed number. */
  label: string;
  type: FieldType;
  text: string;
  /** The definition that travels with the question. Rendered beside the field. */
  definition?: string;
  options?: string[];
  unit?: string;
  /** A plausible range. Outside it the value is questioned, not rejected. */
  plausible?: [number, number];
  /** Seeded so the demo can open a partly-finished assignment. */
  seeded?: string;
  /**
   * Answering is not required. Only the context note is: it is offered to help
   * AMISA read a school's numbers, and a coordinator with nothing to add must
   * not be blocked by a question whose own placeholder calls it optional.
   */
  optional?: boolean;
}

export const QUESTIONS: AssignmentQuestion[] = [
  {
    id: 'q1',
    label: '1',
    type: 'integer',
    text: 'How many full-time teaching staff did you employ on the October census date?',
    definition: 'Full-time equivalent teaching staff only. Excludes administrators, aides and contracted specialists.',
    plausible: [5, 400],
    seeded: '86',
  },
  {
    id: 'q2',
    label: '2',
    type: 'singleselect',
    text: 'Which salary structure does your school use?',
    options: ['Published scale by degree and experience', 'Individually negotiated', 'Bands with negotiated placement', 'Other'],
    seeded: 'Published scale by degree and experience',
  },
  {
    id: 'q3',
    label: '3',
    type: 'currency',
    text: "Starting salary — bachelor's degree, no prior experience.",
    definition: 'Base salary only. Excludes housing, benefits, allowances and bonuses. Full-time equivalent annual amount in USD.',
    unit: 'USD',
    plausible: [6000, 90000],
    seeded: '24800',
  },
  {
    id: 'q4',
    label: '4',
    type: 'percent',
    text: 'What across-the-board increase did you apply this year?',
    definition: 'The percentage applied to the whole scale, before individual adjustments or promotions.',
    unit: '%',
    plausible: [0, 40],
    seeded: '6.5',
  },
  {
    id: 'q5',
    label: '5',
    type: 'currency',
    text: "Average salary — master's degree, 3 years of experience.",
    definition: 'Base salary only. Excludes housing, benefits, allowances and bonuses. Full-time equivalent annual amount in USD.',
    unit: 'USD',
    plausible: [6000, 120000],
  },
  {
    id: 'q6',
    label: '6',
    type: 'open',
    text: 'Anything about your salary structure the association should know when comparing?',
    definition: 'Free text. This answer is never published and never enters a benchmark — it goes to AMISA staff as context only.',
    optional: true,
  },
];

/** How many of the 14 arrive already answered, so the demo opens mid-task. */
export const SEEDED_ANSWERED = 9;

export interface ValidationResult {
  /** `false` blocks submission. A questioned value does not block. */
  valid: boolean;
  /** `true` when the value is usable but worth a second look. */
  questioned?: boolean;
  message?: string;
  /** What the platform would store, once normalised. */
  normalised?: string;
}

const NUMERIC: FieldType[] = ['currency', 'integer', 'percent'];

/**
 * Strip the formatting a person naturally types — thousands separators, a
 * currency symbol, a stray "students", a leading tilde.
 *
 * This is the same normalisation the sweep describes as "standardised in
 * place": unambiguous formatting is fixed rather than rejected, because
 * bouncing a coordinator for typing "1,100 students" is how you lose the
 * submission entirely.
 */
export function normaliseNumeric(raw: string): { text: string; changed: boolean } {
  const original = String(raw ?? '').trim();
  const text = original
    .replace(/[$€£]/g, '')
    // Hedging prefixes are stripped with their own trailing punctuation. Folding
    // "approx." into the word list below does not work: the list is anchored on
    // both sides by `\b`, and a `\b` after the dot needs a word character that a
    // following space does not provide — so the regex backtracks, keeps the dot,
    // and leaves ".1200" behind.
    .replace(/^(approx\.?|about|around|circa|ca\.?)\s*/i, '')
    // Unit words go BEFORE whitespace is stripped. `\b` needs a non-word
    // character on one side, and collapsing "1,100 students" to "1,100students"
    // first destroys the boundary — so the strip silently misses and a value the
    // platform claims to standardise gets rejected instead. Order is the fix.
    .replace(/\b(students?|usd|dollars?|per\s*year|annual(?:ly)?)\b/gi, '')
    .replace(/[~≈]/g, '')
    .replace(/,/g, '')
    .replace(/%/g, '')
    .replace(/\s/g, '')
    .trim();
  return { text, changed: text !== original };
}

/**
 * Validate one answer.
 *
 * The case that matters most: narrative text in a numeric field. Dr. Rhoads
 * raised it directly, and catching it HERE rather than in the sweep is the
 * stronger version — the association never receives the bad value at all,
 * because the school was told at the moment they typed it.
 */
export function validateAnswer(question: AssignmentQuestion, raw: string): ValidationResult {
  const value = String(raw ?? '').trim();
  if (!value) {
    return question.optional
      ? { valid: true, normalised: '' }
      : { valid: false, message: 'This question has not been answered yet.' };
  }

  if (!NUMERIC.includes(question.type)) return { valid: true, normalised: value };

  const { text, changed } = normaliseNumeric(value);

  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return {
      valid: false,
      message:
        'This question needs a number. Text here cannot be averaged with the other schools, so it would be dropped from the benchmark rather than counted. If the answer genuinely varies, give the midpoint and explain it in the final question.',
    };
  }

  const n = Number(text);
  if (question.type === 'percent' && (n < 0 || n > 100)) {
    return { valid: false, message: 'A percentage between 0 and 100.' };
  }

  if (question.plausible) {
    const [low, high] = question.plausible;
    if (n < low || n > high) {
      return {
        valid: true,
        questioned: true,
        normalised: text,
        message: `${formatValue(question, text)} is outside the range other schools report for this question (${formatValue(question, String(low))}–${formatValue(question, String(high))}). It is accepted, and it will be flagged for review rather than silently averaged. A common cause is entering a local-currency amount in a field defined as USD.`,
      };
    }
  }

  return {
    valid: true,
    normalised: text,
    message: changed ? `Recorded as ${formatValue(question, text)}.` : undefined,
  };
}

/** Render a stored value the way the field describes it. */
export function formatValue(question: AssignmentQuestion, text: string): string {
  const n = Number(text);
  if (Number.isNaN(n)) return text;
  if (question.type === 'currency') return `$${n.toLocaleString()}`;
  if (question.type === 'percent') return `${n}%`;
  return n.toLocaleString();
}

/**
 * What the school shares, decided by the school.
 *
 * "Not shared by default, shared by decision" is the whole architecture in one
 * screen. The individual-records row is deliberately not togglable: it is not a
 * setting AMISA can ask a school to change, it is a boundary.
 */
export interface ShareChoice {
  key: string;
  label: string;
  detail: string;
  /** `false` when the school cannot turn it on — it never leaves the school. */
  shareable: boolean;
  defaultShared: boolean;
}

export const SHARE_CHOICES: ShareChoice[] = [
  {
    key: 'bands',
    label: 'Salary bands by degree and experience',
    detail: 'Aggregated figures only. These are what the benchmark is built from.',
    shareable: true,
    defaultShared: true,
  },
  {
    key: 'increase',
    label: 'This year’s across-the-board increase',
    detail: 'A single percentage. Contributes to the tuition and compensation planning benchmark.',
    shareable: true,
    defaultShared: true,
  },
  {
    key: 'headcount',
    label: 'Teaching headcount',
    detail: 'Used to weight the averages so a large school does not distort a small one.',
    shareable: true,
    defaultShared: true,
  },
  {
    key: 'records',
    label: 'Individual staff records',
    detail: 'Names, contracts and individual salaries. These stay at the school. The association never receives them and cannot request them.',
    shareable: false,
    defaultShared: false,
  },
  {
    key: 'notes',
    label: 'Your context note',
    detail: 'Goes to AMISA staff so they can interpret your submission. Never published and never entered into a benchmark.',
    shareable: true,
    defaultShared: true,
  },
];

/** The spreadsheet path: the columns a school maps once. */
export const UPLOAD_COLUMNS = [
  { source: 'Position / Grade', maps: 'Salary band', status: 'matched' },
  { source: 'Highest Qualification', maps: 'Degree', status: 'matched' },
  { source: 'Yrs Service', maps: 'Years of experience', status: 'matched' },
  { source: 'Annual Gross (COP)', maps: 'Base salary — needs currency confirmation', status: 'review' },
] as const;
