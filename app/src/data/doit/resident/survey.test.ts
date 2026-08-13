import { describe, it, expect } from 'vitest';
import clarifications from './clarifications.json';
import {
  NONE_OPTION,
  QUESTIONS,
  TOTAL_QUESTIONS,
  askedPath,
  displayAnswer,
  isFollowUpAsked,
  nextStepId,
  positionOf,
  reviewRows,
  toggleMultiSelect,
  totalFor,
} from './surveyLogic';

/**
 * These functions are the contract between the conversational runtime and the
 * web form. Both call them rather than reimplementing the rules, so a skip rule
 * that changes here changes in both renderings at once — which is what makes
 * "one definition, many delivery channels" true rather than merely claimed.
 *
 * Each block below also pins a defect the prototype shipped, so a future port
 * cannot quietly reintroduce it.
 */

describe('the adaptive Q2 skip', () => {
  it('asks the follow-up when something was difficult', () => {
    expect(nextStepId('q2', ['Uploading documents'])).toBe('q3');
    expect(isFollowUpAsked({ q2: ['Uploading documents'] })).toBe(true);
  });

  it('skips it when nothing was', () => {
    expect(nextStepId('q2', [NONE_OPTION])).toBe('q4');
    expect(isFollowUpAsked({ q2: [NONE_OPTION] })).toBe(false);
  });

  it('matches on the selection set, not a joined string', () => {
    // The prototype did nextAdaptive[answerText] — an exact lookup against a
    // serialised multiselect — so this combination missed every key and fell
    // silently to the default. Mutual exclusion makes it unreachable in the UI,
    // but the skip rule should not depend on another rule holding.
    expect(nextStepId('q2', ['Uploading documents', NONE_OPTION])).toBe('q4');
    expect(nextStepId('q2', [NONE_OPTION, 'Reporting my MAGI income'])).toBe('q4');
  });

  it('treats an empty selection as nothing difficult', () => {
    expect(nextStepId('q2', [])).toBe('q4');
  });

  it('walks the rest of the survey in order and ends at review', () => {
    expect(nextStepId('q1', 'Satisfied')).toBe('q2');
    expect(nextStepId('q3', 'the upload kept failing')).toBe('q4');
    expect(nextStepId('q4', '15 to 30 minutes')).toBe('q5');
    expect(nextStepId('q5', 'No')).toBe('q6');
    expect(nextStepId('q6', 'clearer instructions')).toBe('review');
  });
});

describe('"None of these" mutual exclusion', () => {
  it('clears every other option when chosen', () => {
    const before = ['Uploading documents', 'Reporting my MAGI income'];
    expect(toggleMultiSelect(before, NONE_OPTION)).toEqual([NONE_OPTION]);
  });

  it('is cleared when a real option is chosen', () => {
    expect(toggleMultiSelect([NONE_OPTION], 'Uploading documents')).toEqual(['Uploading documents']);
  });

  it('toggles off cleanly', () => {
    expect(toggleMultiSelect([NONE_OPTION], NONE_OPTION)).toEqual([]);
    expect(toggleMultiSelect(['Uploading documents'], 'Uploading documents')).toEqual([]);
  });

  it('accumulates real options without ever admitting the none option', () => {
    let sel: string[] = [];
    sel = toggleMultiSelect(sel, 'Uploading documents');
    sel = toggleMultiSelect(sel, 'Reporting my MAGI income');
    expect(sel).toHaveLength(2);
    expect(sel).not.toContain(NONE_OPTION);
  });
});

describe('progress', () => {
  it('counts position in the path actually taken, not the printed label', () => {
    // The prototype ran parseInt over the label "2b", got 2, and rotated the
    // ring by the same angle as Q2 — so the follow-up showed no progress, and
    // the step after it announced "Question 4 of 6" as the third asked.
    const withFollowUp = { q2: ['Uploading documents'] };
    expect(positionOf('q1', withFollowUp)).toBe(1);
    expect(positionOf('q2', withFollowUp)).toBe(2);
    expect(positionOf('q3', withFollowUp)).toBe(3);
    expect(positionOf('q4', withFollowUp)).toBe(4);
    expect(positionOf('q6', withFollowUp)).toBe(6);
  });

  it('renumbers when the follow-up is skipped', () => {
    const skipped = { q2: [NONE_OPTION] };
    expect(askedPath(skipped)).not.toContain('q3');
    expect(positionOf('q4', skipped)).toBe(3);
    expect(totalFor(skipped)).toBe(5);
  });

  it('reports the declared six until the skip is actually decided', () => {
    // The intro card promises "6 questions". Announcing "Question 1 of 5"
    // underneath it reads as a system that has already decided something about
    // you — and at that point nothing has decided anything.
    expect(totalFor({})).toBe(TOTAL_QUESTIONS);
    expect(totalFor({ q1: 'Satisfied' })).toBe(TOTAL_QUESTIONS);
    expect(totalFor({ q2: ['Uploading documents'] })).toBe(6);
    expect(totalFor({ q2: [NONE_OPTION] })).toBe(5);
  });

  it('never exceeds its own total', () => {
    for (const answers of [{ q2: ['Uploading documents'] }, { q2: [NONE_OPTION] }]) {
      for (const id of askedPath(answers)) {
        expect(positionOf(id, answers)).toBeLessThanOrEqual(totalFor(answers));
      }
    }
  });

  it('declares six questions, and the labels run 1 · 2 · 2b · 4 · 5 · 6', () => {
    expect(QUESTIONS).toHaveLength(TOTAL_QUESTIONS);
    expect(QUESTIONS.map((q) => q.label)).toEqual(['1', '2', '2b', '4', '5', '6']);
  });
});

describe('the review table', () => {
  it('lists only the questions this resident was asked', () => {
    const rows = reviewRows({ q1: 'Satisfied', q2: [NONE_OPTION], q4: 'Less than 15 minutes', q5: 'No', q6: 'nothing' });
    expect(rows.map((r) => r.id)).toEqual(['q1', 'q2', 'q4', 'q5', 'q6']);
  });

  it('says "Not answered" rather than inventing one', () => {
    // The prototype carried hardcoded per-row fallbacks from a DIFFERENT survey,
    // so choosing "None of these" made the review card show a difficulty and a
    // verbatim the resident never gave — including a duration that was not even
    // one of Q4's options.
    expect(displayAnswer({}, 'q3')).toBe('Not answered');
    expect(displayAnswer({ q3: '   ' }, 'q3')).toBe('Not answered');
    expect(displayAnswer({ q2: [] }, 'q2')).toBe('Not answered');

    const rows = reviewRows({ q1: 'Satisfied', q2: ['Uploading documents'] });
    expect(rows.find((r) => r.id === 'q3')?.answer).toBe('Not answered');
    for (const row of rows) {
      expect(row.answer).not.toContain('20 to 40 minutes');
    }
  });

  it('joins a multiselect for display', () => {
    expect(displayAnswer({ q2: ['Uploading documents', 'Reporting my MAGI income'] }, 'q2')).toBe(
      'Uploading documents, Reporting my MAGI income',
    );
  });
});

describe('mid-survey clarifications', () => {
  const match = (text: string) =>
    clarifications.entries.find((e) => e.triggers.some((t) => text.toLowerCase().includes(t)));

  it('answers the five things residents actually ask', () => {
    expect(match('what is magi?')?.id).toBe('magi');
    expect(match('what does categorical eligibility mean')?.id).toBe('categorical');
    expect(match('what is a redetermination')?.id).toBe('redetermination');
    expect(match('how do I verify my identity')?.id).toBe('identity');
    expect(match('which documents do I need')?.id).toBe('documents');
  });

  it('drops the triggers that could never fire or fired too widely', () => {
    const all = clarifications.entries.flatMap((e) => e.triggers);
    // A bare "income" swallowed any question containing the word.
    expect(all).not.toContain('income');
    // "renewal" hijacked permit-renewal phrasing; "redetermination" covers the intent.
    expect(all).not.toContain('renewal');
  });

  it('orders triggers longest-first so the specific one wins', () => {
    for (const entry of clarifications.entries) {
      const lengths = entry.triggers.map((t) => t.length);
      expect([...lengths].sort((a, b) => b - a)).toEqual(lengths);
    }
  });

  it('gives every matched entry a source, and the fallback none', () => {
    // The contrast IS the point: a grounded answer carries Verified and
    // Reference badges plus a citation, and the fallback carries neither.
    for (const entry of clarifications.entries) {
      expect(entry.source, `${entry.id} needs a source`).toBeTruthy();
      expect(Boolean(entry.card) || Boolean(entry.response)).toBe(true);
    }
    expect(clarifications.fallback).toBeTruthy();
    expect(clarifications.fallback).not.toContain('Source:');
  });
});
