/**
 * The Maryland Medical Assistance Application Survey — its definition and the
 * pure functions that drive it.
 *
 * Everything branching lives here rather than in a component, because the same
 * rules have to hold in two renderings: the conversational runtime and the
 * plain web form. A skip rule implemented twice is a skip rule that disagrees
 * with itself, and the accessibility claim on the intro card depends on the two
 * paths asking the same person the same questions.
 */

export type QuestionType = 'scale' | 'multiselect' | 'singleselect' | 'yesno' | 'open';

export interface Question {
  id: string;
  /** Displayed number. Not the position — q3 shows "2b". */
  label: string;
  type: QuestionType;
  text: string;
  options?: string[];
  /** Follow-up copy VOCE adds after the answer is recorded. */
  aiNote?: string;
  /** Personalises a follow-up with the previous answer. */
  usesPreviousAnswer?: boolean;
}

/**
 * The option that means "nothing applies". Selecting it clears everything else,
 * and selecting anything else clears it — in BOTH renderings.
 */
export const NONE_OPTION = 'None of these';

/**
 * Note the rename: the prototype's keys are q1, q2, q2-followup, q4, q5, q6 —
 * there is no q3. Renaming q2-followup to q3 while keeping its displayed label
 * at "2b" is deliberate. Do not go looking for a q3 in the source.
 */
export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    label: '1',
    type: 'scale',
    text: 'Overall, how satisfied were you with applying for Maryland Medical Assistance?',
    options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'],
  },
  {
    id: 'q2',
    label: '2',
    type: 'multiselect',
    text: 'Which parts of the application were difficult, if any?',
    options: [
      'Reporting my MAGI income',
      'Understanding categorical eligibility',
      'Uploading documents',
      NONE_OPTION,
    ],
  },
  {
    id: 'q3',
    label: '2b',
    type: 'open',
    text: 'Can you tell us what made that part difficult?',
    usesPreviousAnswer: true,
    aiNote: "We'll group this with other comments about that step for the eligibility team.",
  },
  {
    id: 'q4',
    label: '4',
    type: 'singleselect',
    text: 'How long did it take to complete your application?',
    options: ['Less than 15 minutes', '15 to 30 minutes', '30 to 60 minutes', 'More than 60 minutes'],
  },
  {
    id: 'q5',
    label: '5',
    type: 'yesno',
    text: 'Were you contacted for a redetermination during the application process?',
    options: ['Yes', 'No'],
  },
  {
    id: 'q6',
    label: '6',
    type: 'open',
    text: 'What is the one thing we could improve about the application?',
  },
];

export const TOTAL_QUESTIONS = 6;

/** Answers are a set for multiselect and a string everywhere else. */
export type Answer = string | string[];
export type Answers = Record<string, Answer>;

export const questionById = (id: string): Question | undefined => QUESTIONS.find((q) => q.id === id);

/**
 * Toggle an option in a multiselect, enforcing mutual exclusion.
 *
 * "None of these" and any real answer cannot both be true — a resident who says
 * one part was hard AND that nothing was hard has told us nothing.
 */
export function toggleMultiSelect(current: string[], option: string): string[] {
  if (option === NONE_OPTION) {
    return current.includes(NONE_OPTION) ? [] : [NONE_OPTION];
  }
  const withoutNone = current.filter((o) => o !== NONE_OPTION);
  return withoutNone.includes(option)
    ? withoutNone.filter((o) => o !== option)
    : [...withoutNone, option];
}

/**
 * Where to go after `stepId`.
 *
 * The q2 branch matches on SET MEMBERSHIP, not on a joined string. The prototype
 * did `nextAdaptive[answerText]` — an exact lookup against a serialised
 * multiselect — so an answer like "Uploading documents, None of these" missed
 * every key and fell silently to the default. Mutual exclusion makes that
 * particular combination unreachable, but the skip rule should not depend on
 * another rule holding.
 */
export function nextStepId(stepId: string, answer: Answer): string | null {
  if (stepId === 'q2') {
    const selected = Array.isArray(answer) ? answer : [answer];
    // Nothing was difficult → skip the "what made it difficult?" follow-up.
    return selected.includes(NONE_OPTION) || selected.length === 0 ? 'q4' : 'q3';
  }
  const order = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
  const idx = order.indexOf(stepId);
  if (idx === -1) return null;
  return idx === order.length - 1 ? 'review' : order[idx + 1];
}

/** Is q3 asked, given the answers so far? */
export const isFollowUpAsked = (answers: Answers): boolean =>
  nextStepId('q2', answers.q2 ?? []) === 'q3';

/**
 * The questions this particular resident is asked, in order.
 *
 * Progress is derived from this rather than from the displayed label. The
 * prototype ran `parseInt(questionNumber)` over "2b", got 2, and rotated the
 * ring by the same angle as q2 — so the follow-up showed no progress at all,
 * and the step after it announced "Question 4 of 6" as the third question asked.
 */
export function askedPath(answers: Answers): string[] {
  return QUESTIONS.filter((q) => q.id !== 'q3' || isFollowUpAsked(answers)).map((q) => q.id);
}

/** 1-based position of `stepId` in the path this resident is actually taking. */
export function positionOf(stepId: string, answers: Answers): number {
  const idx = askedPath(answers).indexOf(stepId);
  return idx === -1 ? 0 : idx + 1;
}

/**
 * How many questions this resident will be asked in total.
 *
 * Until q2 is answered the follow-up is genuinely undecided, so this reports the
 * declared six rather than guessing five. Announcing "Question 1 of 5" under an
 * intro card that just said "6 questions" reads as a system that has already
 * decided something about you.
 */
export const totalFor = (answers: Answers): number =>
  answers.q2 === undefined ? TOTAL_QUESTIONS : askedPath(answers).length;

/** Answer rendered for display. Skipped questions say so rather than inventing one. */
export function displayAnswer(answers: Answers, id: string): string {
  const value = answers[id];
  if (value === undefined || value === null) return 'Not answered';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Not answered';
  const text = String(value).trim();
  return text.length ? text : 'Not answered';
}

/**
 * The review table's rows — only the questions this resident was actually asked.
 *
 * The prototype's review card carried hardcoded fallbacks per row and rendered
 * `answers[stepKey] || row.fallback`, with fallbacks left over from an entirely
 * different survey. Choosing "None of these" made it fabricate both a difficulty
 * and a verbatim the resident never gave.
 */
export function reviewRows(answers: Answers): Array<{ id: string; label: string; question: string; answer: string }> {
  return askedPath(answers).map((id) => {
    const question = questionById(id)!;
    return {
      id,
      label: question.label,
      question: question.text,
      answer: displayAnswer(answers, id),
    };
  });
}

/** Is an answer substantive enough to move on? */
export function isAnswered(value: Answer | undefined): boolean {
  if (value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim().length > 0;
}
