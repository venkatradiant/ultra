/**
 * The school-side validation rules.
 *
 * This is the only place in the AMISA build where a person types something the
 * platform has to judge, and two of the demo's claims rest entirely on it:
 * that narrative text in a numeric field is caught at the point of entry, and
 * that unambiguous formatting is standardised rather than bounced.
 *
 * The second one is easy to get subtly wrong, and did: stripping whitespace
 * before the unit words destroys the word boundary `\b` depends on, so
 * "1,100 students" was rejected by the very rule that exists to accept it.
 * These cases exist so that cannot come back.
 */
import { describe, it, expect } from 'vitest';
import {
  QUESTIONS,
  QUESTIONS_TOTAL,
  SHARE_CHOICES,
  formatValue,
  normaliseNumeric,
  validateAnswer,
} from './assignment';

const q = (id: string) => QUESTIONS.find((x) => x.id === id)!;

describe('normalising what a person actually types', () => {
  it.each([
    ['1,100 students', '1100'],
    ['1,100 Students', '1100'],
    ['~950', '950'],
    ['$34,800 USD', '34800'],
    ['34 800', '34800'],
    ['6.5%', '6.5'],
    ['approx. 1200', '1200'],
    ['about 1200', '1200'],
    ['24800 dollars', '24800'],
    ['$24,800 per year', '24800'],
  ])('reads %s as %s', (input, expected) => {
    expect(normaliseNumeric(input).text).toBe(expected);
  });

  it('leaves an already-clean number alone and says so', () => {
    const { text, changed } = normaliseNumeric('34800');
    expect(text).toBe('34800');
    expect(changed).toBe(false);
  });

  it('reports that it changed something, so the UI can show what it stored', () => {
    expect(normaliseNumeric('1,100 students').changed).toBe(true);
  });

  it('does not turn words into a number', () => {
    expect(normaliseNumeric('varies by contract').text).not.toMatch(/^\d+$/);
  });
});

describe('validating an answer', () => {
  /**
   * The case Dr. Rhoads raised by name. Catching it here rather than in the
   * association's sweep is the stronger version: the bad value never reaches
   * AMISA, because the school was told the moment they typed it.
   */
  it('refuses narrative text in a numeric field, and explains why', () => {
    const result = validateAnswer(q('q5'), 'varies by contract');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('needs a number');
    expect(result.message).toContain('cannot be averaged');
  });

  it('refuses an empty answer on a required question', () => {
    expect(validateAnswer(q('q5'), '').valid).toBe(false);
    expect(validateAnswer(q('q5'), '   ').valid).toBe(false);
  });

  /**
   * The context note calls itself optional in its own placeholder. Blocking on
   * it would make the form contradict its own copy, and would hold a submission
   * hostage to a question that never enters a benchmark.
   */
  it('lets an optional question be left blank', () => {
    expect(validateAnswer(q('q6'), '').valid).toBe(true);
    expect(validateAnswer(q('q6'), '   ').valid).toBe(true);
  });

  it('accepts a formatted number and reports what it stored', () => {
    const result = validateAnswer(q('q1'), '1,100 students');
    // 1100 is outside q1's plausible teaching-staff range, so it is questioned
    // rather than silently accepted — but it is NOT rejected, which is the point.
    expect(result.valid).toBe(true);
    expect(result.normalised).toBe('1100');
  });

  it('accepts a clean number with nothing to say about it', () => {
    const result = validateAnswer(q('q5'), '34800');
    expect(result.valid).toBe(true);
    expect(result.questioned).toBeFalsy();
    expect(result.normalised).toBe('34800');
    expect(result.message).toBeUndefined();
  });

  /**
   * An outlier is QUESTIONED, never blocked. The platform does not know which
   * currency was meant, and refusing the submission over a guess is how a
   * school stops participating.
   */
  it('questions an implausible figure without blocking it', () => {
    const result = validateAnswer(q('q5'), '348000');
    expect(result.valid).toBe(true);
    expect(result.questioned).toBe(true);
    expect(result.normalised).toBe('348000');
    expect(result.message).toContain('outside the range');
    expect(result.message).toContain('local-currency');
  });

  it('holds a percentage to 0–100', () => {
    expect(validateAnswer(q('q4'), '6.5').valid).toBe(true);
    expect(validateAnswer(q('q4'), '140').valid).toBe(false);
    expect(validateAnswer(q('q4'), '-3').valid).toBe(false);
  });

  it('lets free text be free text', () => {
    const result = validateAnswer(q('q6'), 'Our scale was renegotiated in March.');
    expect(result.valid).toBe(true);
    expect(result.normalised).toBe('Our scale was renegotiated in March.');
  });

  it('accepts a chosen option on a single-select', () => {
    expect(validateAnswer(q('q2'), 'Individually negotiated').valid).toBe(true);
  });
});

describe('formatting a stored value back', () => {
  it('renders currency, percent and counts the way the field describes them', () => {
    expect(formatValue(q('q5'), '34800')).toBe('$34,800');
    expect(formatValue(q('q4'), '6.5')).toBe('6.5%');
    expect(formatValue(q('q1'), '1100')).toBe('1,100');
  });

  it('passes text through rather than rendering NaN', () => {
    expect(formatValue(q('q5'), 'varies')).toBe('varies');
  });
});

describe('what leaves the school', () => {
  /**
   * "Not shared by default, shared by decision" — with one exception that is
   * not a default at all. Individual staff records are a boundary, not a
   * setting, and no code path may offer to turn them on.
   */
  it('makes individual staff records impossible to share', () => {
    const records = SHARE_CHOICES.find((c) => c.key === 'records')!;
    expect(records.shareable).toBe(false);
    expect(records.defaultShared).toBe(false);
    expect(records.detail).toContain('stay at the school');
  });

  it('keeps every other choice the school\'s own to make', () => {
    for (const choice of SHARE_CHOICES.filter((c) => c.key !== 'records')) {
      expect(choice.shareable, `${choice.key} should be the school's choice`).toBe(true);
    }
  });

  it('never publishes the context note', () => {
    const notes = SHARE_CHOICES.find((c) => c.key === 'notes')!;
    expect(notes.detail).toContain('Never published');
  });
});

describe('the assignment itself', () => {
  it('renders fewer questions than it claims, and claims the right number', () => {
    // A demo-fidelity decision, asserted so it stays a decision rather than
    // drifting into a progress bar that reads "6 of 6" above a card saying 14.
    expect(QUESTIONS_TOTAL).toBe(14);
    expect(QUESTIONS.length).toBeLessThan(QUESTIONS_TOTAL);
  });

  it('ships a definition with every question that needs one', () => {
    for (const question of QUESTIONS) {
      if (question.type === 'singleselect') continue;
      expect(question.definition, `${question.id} has no definition`).toBeTruthy();
    }
  });

  it('defines the salary questions identically, so schools answer alike', () => {
    expect(q('q3').definition).toBe(q('q5').definition);
    expect(q('q5').definition).toContain('Base salary only');
    expect(q('q5').definition).toContain('Excludes housing');
  });

  it('gives every numeric question a plausible range to check against', () => {
    for (const question of QUESTIONS.filter((x) => x.type !== 'open' && x.type !== 'singleselect')) {
      expect(question.plausible, `${question.id} has no range`).toBeDefined();
    }
  });

  it('leaves the hero question unanswered, so the demo can answer it live', () => {
    expect(q('q5').seeded).toBeUndefined();
    expect(q('q5').optional).toBeFalsy();
  });

  it('marks only the context note optional', () => {
    const optional = QUESTIONS.filter((x) => x.optional).map((x) => x.id);
    expect(optional).toEqual(['q6']);
  });
});
