import { describe, it, expect } from 'vitest';
import { matchSpokenAnswer } from './useSpeech';

/**
 * Matching what a resident SAID against the options they were offered.
 *
 * This is the only interpretation the survey performs, and therefore the only
 * place a confidence score means anything. Everything else is a tap — a choice,
 * not a judgement — which is why the receipt used to be claiming "AI Confidence:
 * 93%" over a radio button nobody had disagreed with.
 *
 * The bar these tests hold: a natural sentence should find the option it plainly
 * means, and something unrelated should return `null` so the UI can say it did
 * not understand rather than record a guess.
 */
const SATISFACTION = ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'];
const DURATION = ['Less than 15 minutes', '15 to 30 minutes', '30 to 60 minutes', 'More than 60 minutes'];

describe('matchSpokenAnswer', () => {
  it('matches an option said outright, with full confidence', () => {
    const match = matchSpokenAnswer('Very satisfied', SATISFACTION);
    expect(match?.option).toBe('Very satisfied');
    expect(match?.confidence).toBe(99);
  });

  it('reads through the words around the answer', () => {
    expect(matchSpokenAnswer('I was very satisfied with all of it', SATISFACTION)?.option)
      .toBe('Very satisfied');
    expect(matchSpokenAnswer('it took about 15 to 30 minutes I think', DURATION)?.option)
      .toBe('15 to 30 minutes');
  });

  it('is not thrown by punctuation or casing', () => {
    expect(matchSpokenAnswer('DISSATISFIED.', SATISFACTION)?.option).toBe('Dissatisfied');
  });

  it('returns null rather than guessing when nothing is close', () => {
    expect(matchSpokenAnswer('my dog ate the paperwork', SATISFACTION)).toBeNull();
    expect(matchSpokenAnswer('', SATISFACTION)).toBeNull();
  });

  it('returns null when there is nothing to match against', () => {
    expect(matchSpokenAnswer('very satisfied', [])).toBeNull();
    expect(matchSpokenAnswer('very satisfied', undefined)).toBeNull();
  });

  it('reports lower confidence for a partial match than an exact one', () => {
    // "less than 15" covers three of the option's four words, so it is genuinely
    // more ambiguous — and the receipt says so instead of rounding up.
    const partial = matchSpokenAnswer('less than 15', DURATION);
    const exact = matchSpokenAnswer('Less than 15 minutes', DURATION);
    expect(partial?.option).toBe('Less than 15 minutes');
    expect(exact.confidence).toBeGreaterThan(partial.confidence);
    expect(partial.confidence).toBeLessThan(90);
  });

  it('prefers the more specific option when both could match', () => {
    // The naive version scored against the transcript's length, so a long
    // sentence diluted every candidate equally and short options always won.
    expect(matchSpokenAnswer('I was very dissatisfied', SATISFACTION)?.option)
      .toBe('Very dissatisfied');
  });
});
