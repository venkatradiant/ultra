import { describe, it, expect } from 'vitest';
import authorFlows from './author/chatFlows.json';
import adminFlowsJson from './admin/chatFlows.json';
import adminSignals from './admin/signals.json';
import authorSignals from './author/signals.json';
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
  APPROVAL_QUEUE,
  DATA_QUALITY_FLAG,
  DATA_QUALITY_FLAG_PCT,
  OPTION_RECIPES,
  SURVEY_2_BLOCKING,
  SURVEY_2_COMPLETE,
  SURVEY_2_QUESTIONS,
  SURVEY_2_TOTAL,
  generateOptions,
  isQuestionComplete,
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
  'Let me describe what I want': 'author_manual',
  'Done, set distribution': 'author_distribution',
  'Use last list': 'author_distribution',
  'Choose a different list': 'author_choose_list',
  'Permit Renewers 2025': 'author_distribution',
  'All Residents': 'author_distribution',
  'Service Center Visitors Q1': 'author_distribution',
  'Set up delivery': 'author_delivery',
  'Preview as a resident': 'author_preview',
  'Looks good — send for approval': 'author_publish_confirm',
  'Keep editing': 'author_delivery',
  'Send for approval': 'author_publish_confirm',
  'Yes, send for approval': 'author_published',
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
  ['author_publish_confirm', 'Yes, send for approval'],
  ['author_publish_confirm', 'Keep editing'],
  ['author_preview', 'Looks good — send for approval'],
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

const adminFlows = adminFlowsJson as unknown as Record<string, Flow>;

/**
 * The Administrator's map. The renames it encodes are the whole reason the
 * approval queue is representable: the prototype used a bare "Approve" on both
 * surveys and a bare "Send back to author" on both, each of which is one label
 * with two destinations.
 */
const ADMIN_CHIP_MAP: Record<string, string> = {
  'Ask across surveys': 'admin_picker',
  'Ask another question': 'admin_picker',
  'Review approvals (2)': 'admin_queue',
  'Show me the data-quality flag': 'admin_flag',
  'Back to my briefing': 'admin_greeting',
  "That's all for now": 'admin_done',
  'What are the top complaints about wait times?': 'admin_results',
  'How has satisfaction changed over time?': 'admin_trend',
  "I'll type my own question": 'admin_custom',
  'Break down by region': 'admin_regional',
  'Break down by region instead': 'admin_regional',
  'Break down by survey': 'admin_by_survey',
  'Show verbatims from the Western region': 'admin_verbatims',
  'Keep and flag in results': 'admin_flag_kept',
  'Exclude these responses': 'admin_flag_excluded',
  'Draft brief for leadership': 'admin_brief',
  'Send the brief': 'admin_send_confirm',
  'Yes, send it to leadership': 'admin_brief_sent',
  'Go back to the brief': 'admin_brief',
  'Save to reports': 'admin_saved',
  'Review each': 'admin_survey_1',
  'Approve both': 'admin_approve_both_confirm',
  'Yes, approve both surveys': 'admin_both_approved',
  'Approve Permit Renewal Feedback': 'admin_approve_1_confirm',
  'Yes, approve Permit Renewal': 'admin_survey_2',
  'Send Permit Renewal back to Sarah': 'admin_send_back_1_confirm',
  'Yes, return it to Sarah': 'admin_sent_back_1',
  'Continue to Survey 2': 'admin_survey_2_after_return',
  'Approve Service Center Exit Survey': 'admin_approve_2_confirm',
  'Yes, approve Service Center': 'admin_both_approved',
  'Send Service Center back to James': 'admin_send_back_2_confirm',
  'Yes, return it to James': 'admin_sent_back_2',
  'Back to the queue': 'admin_queue',
};

const ADMIN_MODAL_CHIPS: Array<[string, string]> = [
  ['admin_send_confirm', 'Yes, send it to leadership'],
  ['admin_send_confirm', 'Go back to the brief'],
  ['admin_approve_1_confirm', 'Yes, approve Permit Renewal'],
  ['admin_approve_1_confirm', 'Back to the queue'],
  ['admin_approve_2_confirm', 'Yes, approve Service Center'],
  ['admin_approve_2_confirm', 'Back to the queue'],
  ['admin_approve_both_confirm', 'Yes, approve both surveys'],
  ['admin_approve_both_confirm', 'Back to the queue'],
  ['admin_send_back_1_confirm', 'Yes, return it to Sarah'],
  ['admin_send_back_1_confirm', 'Back to the queue'],
  ['admin_send_back_2_confirm', 'Yes, return it to James'],
  ['admin_send_back_2_confirm', 'Back to the queue'],
];

describe('doit_admin chat flows', () => {
  it('routes every suggested chip somewhere', () => {
    const unmapped: string[] = [];
    for (const [flowKey, flow] of Object.entries(adminFlows)) {
      for (const chip of flow.suggested_chips ?? []) {
        if (!ADMIN_CHIP_MAP[chip]) unmapped.push(`${flowKey} → "${chip}"`);
      }
    }
    expect(unmapped).toEqual([]);
  });

  it('points every chip at a flow that exists', () => {
    const dangling = Object.entries(ADMIN_CHIP_MAP)
      .filter(([, target]) => !adminFlows[target])
      .map(([chip, target]) => `"${chip}" → ${target}`);
    expect(dangling).toEqual([]);
  });

  it('offers every chip its modals click', () => {
    for (const [flowKey, label] of ADMIN_MODAL_CHIPS) {
      expect(adminFlows[flowKey]?.suggested_chips, `${flowKey} must offer "${label}"`).toContain(label);
    }
  });

  it('keeps a __default__ so free text never dead-ends', () => {
    expect(adminFlows.__default__).toBeDefined();
    expect(adminFlows.__default__.suggested_chips?.length).toBeGreaterThan(0);
  });

  it('carries no bare Approve, Send or Publish label', () => {
    // Each of these was a two-destination label in the prototype, and "Send" is
    // additionally a four-character token the substring rung matches against any
    // user_query containing it.
    const banned = ['Approve', 'Send', 'Publish', 'Send back to author', 'Start over'];
    const labels = Object.keys(ADMIN_CHIP_MAP);
    for (const bad of banned) expect(labels).not.toContain(bad);
  });

  it('avoids the two chip labels the engine hardcodes outside the resolver', () => {
    const reserved = ['Next signal', 'Yes, walk me through them'];
    const chips = Object.values(adminFlows).flatMap((f) => f.suggested_chips ?? []);
    for (const label of reserved) expect(chips).not.toContain(label);
  });

  it('maps every signal to a chip that resolves', () => {
    const signalChips = [
      'Review approvals (2)',
      'What are the top complaints about wait times?',
      'Break down by region',
      'Show me the data-quality flag',
    ];
    for (const chip of signalChips) expect(ADMIN_CHIP_MAP[chip]).toBeDefined();
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

/**
 * The briefing is regenerated per session, so it has more than one shape.
 *
 * Each persona picks a variant in its manifest's `resolveFlowKey`. A variant
 * whose chips are unrouted, or a variant name the manifest reaches for that does
 * not exist, both fail silently at runtime — the thread simply stops.
 */
describe('doit briefing variants', () => {
  const AUTHOR_VARIANTS = [
    'author_greeting_results_done',
    'author_greeting_draft_done',
    'author_greeting_clear',
    'author_report_sent_clear',
    'author_published_clear',
    'author_saved_draft_done',
    '__default_results_done__',
    '__default_draft_done__',
    '__default_clear__',
  ];
  /**
   * Marcus has three items and can settle them in any order, so his briefing is
   * one node per REACHABLE COMBINATION rather than a single "some of it is done"
   * message — which still handed back a chip for whichever item had just been
   * finished. Built the same way the manifest builds the key, so a combination
   * the resolver can produce and the data cannot answer fails here.
   */
  // Every non-empty, non-full subset, in the order the manifest filters them —
  // the key it builds is `admin_greeting_${settled.join('_')}_done`.
  const SETTLED_SUBSETS = [
    ['approvals'],
    ['flag'],
    ['brief'],
    ['approvals', 'flag'],
    ['approvals', 'brief'],
    ['flag', 'brief'],
  ];

  const ADMIN_VARIANTS = [
    ...SETTLED_SUBSETS.map((s) => `admin_greeting_${s.join('_')}_done`),
    'admin_greeting_clear',
    'admin_queue_clear',
    'admin_survey_2_after_return',
    'admin_send_back_1_confirm',
    'admin_send_back_2_confirm',
    'admin_both_approved_flag_done',
    'admin_sent_back_2_flag_done',
    '__default_clear__',
  ];

  it('defines every variant the author manifest can resolve to', () => {
    for (const key of AUTHOR_VARIANTS) expect(flows[key], `${key} is missing`).toBeDefined();
  });

  it('defines every variant the admin manifest can resolve to', () => {
    for (const key of ADMIN_VARIANTS) expect(adminFlows[key], `${key} is missing`).toBeDefined();
  });

  it('routes every chip the variants offer', () => {
    for (const key of AUTHOR_VARIANTS) {
      for (const chip of flows[key]?.suggested_chips ?? []) {
        expect(AUTHOR_CHIP_MAP[chip], `author ${key} → "${chip}"`).toBeDefined();
      }
    }
    for (const key of ADMIN_VARIANTS) {
      for (const chip of adminFlows[key]?.suggested_chips ?? []) {
        expect(ADMIN_CHIP_MAP[chip], `admin ${key} → "${chip}"`).toBeDefined();
      }
    }
  });

  it('never offers work the variant has just declared finished', () => {
    // The whole point of the "clear" variants: a briefing that says nothing needs
    // you cannot hand back a chip that reopens one of the finished tracks.
    const clearChips = flows.author_greeting_clear?.suggested_chips ?? [];
    expect(clearChips).not.toContain('Review Maryland results');
    expect(clearChips).not.toContain('Finish the draft survey');

    expect(flows.author_greeting_results_done?.suggested_chips).not.toContain('Review Maryland results');
    expect(flows.author_greeting_draft_done?.suggested_chips).not.toContain('Finish the draft survey');
    expect(flows.author_saved_draft_done?.suggested_chips).not.toContain('Finish the draft survey');
    expect(adminFlows.admin_greeting_clear?.suggested_chips).not.toContain('Review approvals (2)');
    expect(adminFlows.admin_greeting_clear?.suggested_chips).not.toContain('Draft brief for leadership');
    expect(adminFlows.admin_both_approved_flag_done?.suggested_chips)
      .not.toContain('Show me the data-quality flag');
    expect(adminFlows.admin_sent_back_2_flag_done?.suggested_chips)
      .not.toContain('Show me the data-quality flag');
  });

  it('never lets an admin briefing reopen an item it just called settled', () => {
    // The chip that reopens each of Marcus's three items, by item.
    const REOPENS: Record<string, string[]> = {
      approvals: ['Review approvals (2)'],
      flag: ['Show me the data-quality flag'],
      brief: ['Draft brief for leadership'],
    };
    for (const settled of SETTLED_SUBSETS) {
      const key = `admin_greeting_${settled.join('_')}_done`;
      const chips = adminFlows[key]?.suggested_chips ?? [];
      for (const item of settled) {
        for (const chip of REOPENS[item]) {
          expect(chips, `${key} must not offer "${chip}"`).not.toContain(chip);
        }
      }
    }
  });

  it('drops the chip that only ever reached the generic fallback', () => {
    // "Ask me anything" posted itself as a user message and answered with
    // __default__. It named no capability and led nowhere.
    const chips = Object.values(flows).flatMap((f) => f.suggested_chips ?? []);
    expect(chips).not.toContain('Ask me anything');
  });

  it('promises no results on a survey that has only been submitted', () => {
    // An author submits; their manager publishes. Until then there is no live
    // survey, no URL and by definition not one response to review.
    const submitted = `${flows.author_published?.ai_message} ${flows.author_published_clear?.ai_message}`;
    expect(submitted).toContain('approval');
    expect(submitted.toLowerCase()).not.toContain('is live');
    const chips = [
      ...(flows.author_published?.suggested_chips ?? []),
      ...(flows.author_published_clear?.suggested_chips ?? []),
    ];
    expect(chips).not.toContain('View the results');
  });
});

/**
 * The three cards on the Administrator's briefing are `signals.slice(0, 3)`, and
 * the three items in his greeting are hand-written prose. Nothing in the app
 * couples them, so they drifted: the third card was the regional outlier while
 * the third item was the data-quality flag.
 */
describe('doit_admin briefing alignment', () => {
  const visible = (adminSignals as Array<{ id: string }>).slice(0, 3).map((s) => s.id);

  it('shows the three signals the greeting narrates, in that order', () => {
    expect(visible).toEqual(['SIG-DOIT-ADM-001', 'SIG-DOIT-ADM-002', 'SIG-DOIT-ADM-004']);
  });

  it('still keeps the regional outlier reachable, just not as a card', () => {
    const all = (adminSignals as Array<{ id: string }>).map((s) => s.id);
    expect(all).toContain('SIG-DOIT-ADM-003');
    expect(ADMIN_CHIP_MAP['Break down by region']).toBe('admin_regional');
  });

  it('derives the flagged share rather than asserting it', () => {
    // The card said "22 of 201" while the portfolio put the survey at 178.
    expect(DATA_QUALITY_FLAG.total).toBe(178);
    expect(DATA_QUALITY_FLAG_PCT).toBe(12);
    expect(JSON.stringify(adminSignals)).not.toContain('11% of');
  });
});

type DraftSignal = {
  metric_text: string;
  description: string;
  metrics: { blockers: number; questions_complete: number };
};

/** The Permit Renewal draft's signal, typed once rather than cast per assertion. */
const draftSignalOf = (signals: unknown): DraftSignal =>
  (signals as Array<{ id: string }>).find((s) => s.id === 'SIG-DOIT-AUTH-002') as unknown as DraftSignal;

/**
 * The author's draft is real state now, and the approver reads the same array.
 */
describe('doit survey draft', () => {
  it('ships exactly one blocking question', () => {
    const blocking = SURVEY_2_QUESTIONS.filter((q) => !isQuestionComplete(q));
    expect(blocking.map((q) => q.id)).toEqual(['q7']);
  });

  it('gives the approver the type and options, not only the wording', () => {
    for (const item of APPROVAL_QUEUE) {
      expect(item.preview.length).toBe(item.questions);
      for (const q of item.preview) {
        expect(typeof q.text).toBe('string');
        expect(typeof q.type).toBe('string');
        // Open text is `null`; everything else must be answerable.
        expect(q.options === null || q.options.length > 0).toBe(true);
      }
    }
  });

  it('counts the same blockers on the signal card and in the draft', () => {
    // These are three separate hand-maintained surfaces describing one draft:
    // the signal card, the AI's opening line, and the panel's own banner. The
    // card used to say "2 blockers" (counting the unconfirmed distribution list)
    // directly above a message calling Q7 "the one thing genuinely blocking".
    const blocking = SURVEY_2_QUESTIONS.filter((q) => !isQuestionComplete(q)).length;
    const draftSignal = draftSignalOf(authorSignals);

    expect(draftSignal.metrics.blockers).toBe(blocking);
    expect(draftSignal.metric_text).toContain(`${blocking} blocker`);
    expect(draftSignal.metric_text).not.toContain('blockers');
  });

  it('quotes one completion figure across the card, the message and the panel', () => {
    // Three hand-maintained surfaces, one draft. The prose said "six of nine"
    // while the panel — which has always counted answerable questions — computed
    // eight, and the card carried a third number of its own.
    expect(SURVEY_2_COMPLETE).toBe(8);
    expect(SURVEY_2_TOTAL).toBe(9);
    expect(SURVEY_2_BLOCKING).toBe(1);

    const draftSignal = draftSignalOf(authorSignals);
    expect(draftSignal.metric_text).toContain(`${SURVEY_2_COMPLETE} of ${SURVEY_2_TOTAL} questions`);
    expect(draftSignal.metrics.questions_complete).toBe(SURVEY_2_COMPLETE);

    // The AI's opening line spells the number, so the numeral must not appear
    // and the old "Six of nine" must be gone.
    const opener = flows.author_draft_status?.ai_message ?? '';
    expect(opener).toContain('Eight of the nine questions');
    expect(opener).not.toContain('Six of nine');
  });

  it('calls distribution a step to confirm, not a thing blocking the send', () => {
    // A distribution list IS preselected — authorState defaults it — so calling
    // its absence a blocker contradicted the store as well as the panel.
    const draftSignal = draftSignalOf(authorSignals);
    expect(draftSignal.description).not.toContain('no distribution list has been selected');
    expect(draftSignal.description).not.toContain('Two blockers');
  });

  it('sends the approver a survey with nothing left blocking', () => {
    // A draft only reaches the queue because its author unblocked it.
    expect(APPROVAL_QUEUE[0].preview.every(isQuestionComplete)).toBe(true);
  });
});

/**
 * Describing the options you want, rather than typing them.
 *
 * Deterministic on purpose: the demo must produce the same options every run.
 */
describe('doit Q7 option generation', () => {
  it('returns a usable set for every recipe it advertises', () => {
    for (const recipe of OPTION_RECIPES) {
      for (const trigger of recipe.triggers) {
        const { options } = generateOptions(`I want ${trigger} options`);
        expect(options.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('reads a plain-English description as the right scale', () => {
    expect(generateOptions('a four-point ease scale').recipe.id).toBe('ease');
    expect(generateOptions('how often did this happen').recipe.id).toBe('frequency');
    expect(generateOptions('how satisfied were they').recipe.id).toBe('satisfaction');
  });

  it('never leaves the question unanswerable, whatever it is asked for', () => {
    // An author who describes something with no recipe still gets a scale, plus
    // the label saying which one — not a question that still blocks the send.
    const { options, recipe } = generateOptions('something nobody has a word for');
    expect(options.length).toBeGreaterThan(0);
    expect(recipe.label).toBeTruthy();
    expect(generateOptions('').options.length).toBeGreaterThan(0);
  });
});
