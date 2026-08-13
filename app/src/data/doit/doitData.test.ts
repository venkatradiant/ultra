import { describe, it, expect } from 'vitest';
import authorFlows from './author/chatFlows.json';
import dataSources from './_shared/dataSources.json';
import {
  CLEANING_FIXES,
  CROSS_SURVEY_TOTAL,
  DEFAULT_CLEANING,
  PORTFOLIO_SURVEYS,
  SURVEY_1_PUBLISHED_VALID,
  SURVEY_1_TOTAL,
  computeValidCount,
  countAppliedFixes,
  methodologyLine,
  cleaningSummaryLine,
} from './_shared/constants';

/**
 * Guards for the two things most likely to break this tenant silently.
 *
 * 1. CHIP ROUTING. `resolveFlowKey` fails soft in three separate ways — a chip
 *    with no map entry falls through to fuzzy matching, a map entry pointing at
 *    a missing flowKey ALSO falls through, and a label reused with two different
 *    destinations simply mis-routes. None of them throw. These tests turn all
 *    three into suite failures.
 *
 * 2. THE NUMBERS. The whole cleaning story rests on the report agreeing with the
 *    card that produced it, so the arithmetic is asserted rather than trusted.
 */

type Flow = {
  user_query?: string;
  ai_message?: string;
  suggested_chips?: string[];
};

const flows = authorFlows as unknown as Record<string, Flow>;

// Kept in step with the manifest by the "every chip is mapped" test below —
// importing manifest.tsx here would drag the whole component graph into the
// test, which is what makes the existing manifest suite take 20 seconds.
const AUTHOR_CHIP_MAP: Record<string, string> = {
  'Review Maryland results': 'author_cleaning',
  'Finish the draft survey': 'author_draft_status',
  'Ask me anything': '__default__',
  'Back to my briefing': 'author_greeting',
  'Apply cleaning': 'author_results',
  'Got it, apply cleaning': 'author_results',
  'Tell me more about the speeders': 'author_speeders',
  'Keep everything': 'author_results_all',
  'Show me what residents wrote': 'author_quotes',
  'Show more comments': 'author_more_quotes',
  'Drill into wait times': 'author_drill',
  'Export results': 'author_export',
  'Draft manager report': 'author_report',
  'Draft the report': 'author_report',
  'Draft manager report instead': 'author_report',
  'Send to manager': 'author_send_confirm',
  'Yes, send it to my manager': 'author_report_sent',
  'Go back': 'author_report',
  'Save to my reports': 'author_saved',
  'Yes, finish the draft': 'author_draft_status',
  'Not yet': 'author_later',
  'Q7 looks good': 'author_q7_set',
  'Suggest Q7 options': 'author_suggest',
  'Use these options': 'author_q7_set',
  "I'll write them myself": 'author_manual',
  'Done, set distribution': 'author_distribution',
  'Use last list': 'author_distribution',
  'Choose a different list': 'author_choose_list',
  'Permit Renewers 2025': 'author_distribution',
  'All Residents': 'author_distribution',
  'Service Center Visitors Q1': 'author_distribution',
  'Set up delivery': 'author_delivery',
  'Preview as a resident': 'author_preview',
  'Looks good — publish': 'author_publish_confirm',
  'Keep editing': 'author_delivery',
  'Publish this survey': 'author_publish_confirm',
  'I approve — publish now': 'author_published',
  'View survey status': 'author_survey_status',
  'Start a new survey': 'author_new_survey',
  'Go to my surveys': 'author_my_surveys',
};

/**
 * Labels a modal's confirm button clicks (see components/doit/shared/fireChip).
 * Each MUST be offered by the turn the modal renders on, or the dialog dead-ends
 * with the thread stuck behind a backdrop.
 */
const MODAL_FIRED_CHIPS: Array<[flowKey: string, label: string]> = [
  ['author_send_confirm', 'Yes, send it to my manager'],
  ['author_send_confirm', 'Go back'],
  ['author_publish_confirm', 'I approve — publish now'],
  ['author_publish_confirm', 'Keep editing'],
  ['author_preview', 'Looks good — publish'],
  ['author_preview', 'Keep editing'],
];

describe('doit_author chat flows', () => {
  it('routes every suggested chip somewhere', () => {
    const unmapped: string[] = [];
    for (const [flowKey, flow] of Object.entries(flows)) {
      for (const chip of flow.suggested_chips ?? []) {
        if (!AUTHOR_CHIP_MAP[chip]) unmapped.push(`${flowKey} → "${chip}"`);
      }
    }
    expect(unmapped, 'chips with no chipToFlowKey entry fall through to fuzzy matching').toEqual([]);
  });

  it('points every chip at a flow that exists', () => {
    const dangling = Object.entries(AUTHOR_CHIP_MAP)
      .filter(([, target]) => !flows[target])
      .map(([chip, target]) => `"${chip}" → ${target}`);
    expect(dangling, 'a map entry naming a missing flowKey fails open, not loudly').toEqual([]);
  });

  it('never gives one label two destinations', () => {
    // The engine resolves labels without knowing the current step, so this is
    // unrepresentable rather than merely discouraged.
    const seen = new Map<string, string>();
    for (const [chip, target] of Object.entries(AUTHOR_CHIP_MAP)) {
      const previous = seen.get(chip);
      expect(previous === undefined || previous === target).toBe(true);
      seen.set(chip, target);
    }
    expect(new Set(Object.keys(AUTHOR_CHIP_MAP)).size).toBe(Object.keys(AUTHOR_CHIP_MAP).length);
  });

  it('offers every chip its modals click', () => {
    for (const [flowKey, label] of MODAL_FIRED_CHIPS) {
      expect(flows[flowKey]?.suggested_chips, `${flowKey} must offer "${label}"`).toContain(label);
    }
  });

  it('keeps a __default__ so free text never dead-ends', () => {
    // Without it resolveFlowKey returns null and the caller logs a console
    // warning while the UI silently does nothing.
    expect(flows.__default__).toBeDefined();
    expect(flows.__default__.suggested_chips?.length).toBeGreaterThan(0);
  });

  it('avoids the two chip labels the engine hardcodes outside the resolver', () => {
    const reserved = ['Next signal', 'Yes, walk me through them'];
    const chips = Object.values(flows).flatMap((f) => f.suggested_chips ?? []);
    for (const label of reserved) expect(chips).not.toContain(label);
  });

  it('starts the greeting on a flow that exists', () => {
    expect(flows.author_greeting).toBeDefined();
  });
});

describe('doit data sources', () => {
  // DataSources.jsx imports its 23 fixtures statically, so this file lands in a
  // chunk every tenant downloads — hence the size ceiling.
  it('stays small enough to sit in a shared chunk', () => {
    expect(dataSources.length).toBeLessThanOrEqual(10);
  });

  it('names only icons the screen can actually render', () => {
    // An unmapped name falls back to a generic Database glyph without warning.
    const ICON_MAP_KEYS = [
      'database', 'brain', 'headphones', 'cog', 'users', 'monitor', 'message-circle',
      'shield', 'trending-up', 'cpu', 'star', 'alert-triangle', 'route', 'file-text',
      'shield-check',
    ];
    for (const source of dataSources) {
      expect(ICON_MAP_KEYS, `"${source.name}" uses icon "${source.icon}"`).toContain(source.icon);
    }
  });

  it('gives every source the fields the card reads', () => {
    for (const source of dataSources) {
      expect(source.id).toBeTruthy();
      expect(source.name).toBeTruthy();
      expect(['connected', 'partial']).toContain(source.status);
      expect(source.description).toBeTruthy();
    }
    expect(new Set(dataSources.map((s) => s.id)).size).toBe(dataSources.length);
  });

  it('leaves Google Forms unconnected — the honest half of the delivery story', () => {
    const google = dataSources.find((s) => s.name === 'Google Forms');
    expect(google?.status).toBe('partial');
  });
});

describe('doit canonical numbers', () => {
  it('derives the published count rather than hardcoding it', () => {
    // 212 − 8 incomplete − 2 duplicates, with the speeders row left unchecked.
    expect(SURVEY_1_PUBLISHED_VALID).toBe(202);
    expect(computeValidCount(DEFAULT_CLEANING)).toBe(202);
  });

  it('lands on 188 when all five fixes are applied', () => {
    const allChecked = Object.fromEntries(CLEANING_FIXES.map((f) => [f.key, true]));
    expect(computeValidCount(allChecked)).toBe(188);
  });

  it('lands on the full set when nothing is applied', () => {
    const noneChecked = Object.fromEntries(CLEANING_FIXES.map((f) => [f.key, false]));
    expect(computeValidCount(noneChecked)).toBe(SURVEY_1_TOTAL);
  });

  it('keeps the methodology line in step with the card above it', () => {
    // The prototype hardcoded "199 valid responses" under a card computing 202.
    expect(methodologyLine(DEFAULT_CLEANING)).toContain('202 valid responses');
    expect(methodologyLine(DEFAULT_CLEANING)).toContain('14 fast responses retained');

    const allChecked = Object.fromEntries(CLEANING_FIXES.map((f) => [f.key, true]));
    expect(methodologyLine(allChecked)).toContain('188 valid responses');
    expect(methodologyLine(allChecked)).not.toContain('retained');
  });

  it("keeps the AI's account of the cleaning true", () => {
    // The prototype claimed "4 of the 5 fixes and kept the speeders" on every
    // path, including the one where it applied all five.
    expect(countAppliedFixes(DEFAULT_CLEANING)).toBe(4);
    expect(cleaningSummaryLine(DEFAULT_CLEANING)).toBe(
      'Done. I applied 4 of the 5 fixes and kept the 14 fast responses per your call.',
    );

    const allChecked = Object.fromEntries(CLEANING_FIXES.map((f) => [f.key, true]));
    expect(cleaningSummaryLine(allChecked)).toBe('Done. I applied 5 of the 5 fixes.');
  });

  it('sums the cross-survey total from the portfolio, not by hand', () => {
    expect(CROSS_SURVEY_TOTAL).toBe(1433);
    expect(PORTFOLIO_SURVEYS[0].responses).toBe(SURVEY_1_PUBLISHED_VALID);
  });

  it('carries no trace of the prototype 199 or its 1,430 total', () => {
    const serialised = JSON.stringify({ flows, PORTFOLIO_SURVEYS });
    expect(serialised).not.toContain('199 valid');
    expect(PORTFOLIO_SURVEYS.some((s) => s.responses === 199)).toBe(false);
    expect(CROSS_SURVEY_TOTAL).not.toBe(1430);
  });
});
