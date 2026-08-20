/**
 * The AMISA conversations, walked end to end.
 *
 * `manifests.test.ts` already validates the manifest shape and asserts that
 * every `goldenPathChip` value appears verbatim in that turn's
 * `suggested_chips`. What it cannot see is whether the demo actually WALKS: a
 * chip pointing at a flow key that does not exist, a turn that offers a chip
 * nothing routes, or a golden path that dead-ends three turns in.
 *
 * Those are precisely the failures that only surface in front of a committee,
 * because every one of them looks fine in the editor.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import directorFlows from './director/chatFlows.json';
import hrFlows from './hr/chatFlows.json';
import directorManifest from '@/markets/sled/clients/amisa/personas/director/manifest';
import hrManifest from '@/markets/sled/clients/amisa/personas/hr/manifest';
import { resetDirectorState, getDirectorState } from '@/components/amisa/shared/directorState';
import { resetHrState, getHrState } from '@/components/amisa/hr/hrState';
import { computeValidCount, methodologyLine, HR_PUBLISHED_VALID, HR_SURVEY } from './_shared/constants';
import { resolveFlowKey } from '@core/engine/chatFlowEngine';

type Flow = { ai_message?: string; suggested_chips?: string[] };
const director = directorFlows as unknown as Record<string, Flow>;
const hr = hrFlows as unknown as Record<string, Flow>;

const PERSONAS = [
  { name: 'director', flows: director, manifest: directorManifest },
  { name: 'hr', flows: hr, manifest: hrManifest },
];

describe.each(PERSONAS)('$name conversation integrity', ({ flows, manifest }) => {
  const chipMap = manifest.flows.chipToFlowKey;

  it('routes every chip to a flow that exists', () => {
    for (const [chip, key] of Object.entries(chipMap)) {
      expect(flows[key], `chip "${chip}" routes to missing flow "${key}"`).toBeDefined();
    }
  });

  /**
   * The one that actually bites. A turn offering a chip nothing routes leaves
   * the user clicking a button that does nothing — and with `strictMatch` on,
   * the engine will not quietly find it a home either.
   */
  it('routes every chip any turn offers', () => {
    for (const [key, flow] of Object.entries(flows)) {
      for (const chip of flow.suggested_chips ?? []) {
        expect(chipMap[chip], `turn "${key}" offers unrouted chip "${chip}"`).toBeDefined();
      }
    }
  });

  it('gives every flow something to say', () => {
    for (const [key, flow] of Object.entries(flows)) {
      expect(flow.ai_message?.trim(), `flow "${key}" has no message`).toBeTruthy();
    }
  });

  it('lands every askTurnSequence entry on a real flow', () => {
    for (const key of manifest.flows.askTurnSequence) {
      expect(flows[key], `askTurnSequence names missing flow "${key}"`).toBeDefined();
    }
  });

  it('reaches every flow from somewhere', () => {
    const reachable = new Set<string>([
      manifest.ui.greetingFlowKey,
      ...Object.values(chipMap),
      // Variants are reached through resolveFlowKey rather than a chip.
      ...Object.keys(flows).filter((k) => k.startsWith('__') || k.includes('_greeting') || k.includes('_clear')),
    ]);
    const orphans = Object.keys(flows).filter((k) => !reachable.has(k));
    expect(orphans, 'flows nothing can reach').toEqual([]);
  });
});

describe('the Executive Director golden path', () => {
  beforeEach(() => resetDirectorState());

  /**
   * Walk the demo exactly as the presenter will: start at the greeting, and at
   * every turn take the chip `goldenPathChip` highlights. It has to reach the
   * end without stalling.
   */
  it('walks from the briefing to a published summary', () => {
    const { goldenPathChip, greetingFlowKey } = directorManifest.ui;
    const { chipToFlowKey, resolveFlowKey, onFlowEnter } = directorManifest.flows;

    const visited: string[] = [];
    let key = resolveFlowKey ? resolveFlowKey(greetingFlowKey) : greetingFlowKey;

    for (let step = 0; step < 40; step += 1) {
      visited.push(key);
      onFlowEnter?.(key);
      if (key === 'director_saved') break;

      const chip = goldenPathChip[key];
      expect(chip, `no golden chip out of "${key}"`).toBeDefined();
      expect(
        director[key].suggested_chips,
        `golden chip "${chip}" is not offered on "${key}"`,
      ).toContain(chip);

      const next = chipToFlowKey[chip];
      expect(next, `golden chip "${chip}" routes nowhere`).toBeDefined();
      key = resolveFlowKey ? resolveFlowKey(next) : next;
    }

    expect(visited).toContain('director_participation');
    expect(visited).toContain('director_quality');
    expect(visited).toContain('director_benchmark');
    expect(visited).toContain('director_peers');
    expect(visited).toContain('director_published');
    expect(visited[visited.length - 1]).toBe('director_saved');
  });

  /**
   * "Keep everything" has to mean it.
   *
   * The turn says out loud "Nothing excluded. All 312 records stay in the
   * analysis set", and the receipt, the benchmark's methodology line and the
   * published summary all read the same store. Freezing the DEFAULT selection
   * here left the card computing 298 under a message promising 312.
   */
  it('excludes nothing when he keeps everything', () => {
    directorManifest.flows.onFlowEnter?.('director_quality_kept');
    const state = getDirectorState();
    expect(state.sweepApplied).toBe(true);
    expect(state.done.quality).toBe(true);
    expect(Object.values(state.sweep).every((v) => v === false)).toBe(true);
    expect(computeValidCount(state.sweep)).toBe(HR_SURVEY.totalResponses); // 312
    expect(methodologyLine(state.sweep)).toContain('312 valid records of 312');
  });

  it('freezes the sweep and records who applied it', () => {
    directorManifest.flows.onFlowEnter?.('director_quality_applied');
    const state = getDirectorState();
    expect(state.sweepApplied).toBe(true);
    expect(state.done.quality).toBe(true);
    expect(computeValidCount(state.sweep)).toBe(HR_PUBLISHED_VALID);
  });

  /**
   * The briefing has to describe the day he is actually having. Replaying the
   * 6 a.m. message after he has cleared everything is the bug this guards.
   */
  it('rewrites the briefing as the day is cleared', () => {
    const resolve = directorManifest.flows.resolveFlowKey!;
    expect(resolve('director_greeting')).toBe('director_greeting');

    directorManifest.flows.onFlowEnter?.('director_quality_applied');
    expect(resolve('director_greeting')).toBe('director_greeting_quality_done');
    expect(resolve('__default__')).toBe('__default_quality_done__');

    directorManifest.flows.onFlowEnter?.('director_approved');
    directorManifest.flows.onFlowEnter?.('director_published');
    expect(resolve('director_greeting')).toBe('director_greeting_clear');
  });

  it('leaves an unknown flow key alone', () => {
    const resolve = directorManifest.flows.resolveFlowKey!;
    expect(resolve('director_benchmark')).toBe('director_benchmark');
  });

  /**
   * `strictMatch` is what makes free text that matches nothing say so, rather
   * than landing on whatever turn is nearest and reading as the assistant
   * repeating itself.
   */
  it('refuses to guess at free text', () => {
    expect(directorManifest.flows.strictMatch).toBe(true);
    expect(hrManifest.flows.strictMatch).toBe(true);
  });
});

describe('the school-side golden path', () => {
  beforeEach(() => resetHrState());

  it('walks from the assignment to a request with the association', () => {
    const { goldenPathChip, greetingFlowKey } = hrManifest.ui;
    const { chipToFlowKey, onFlowEnter } = hrManifest.flows;

    const visited: string[] = [];
    let key = greetingFlowKey;

    for (let step = 0; step < 12; step += 1) {
      visited.push(key);
      onFlowEnter?.(key);
      if (key === 'hr_request_sent') break;
      const chip = goldenPathChip[key];
      expect(chip, `no golden chip out of "${key}"`).toBeDefined();
      expect(hr[key].suggested_chips, `golden chip "${chip}" not offered on "${key}"`).toContain(chip);
      key = chipToFlowKey[chip];
    }

    expect(visited[visited.length - 1]).toBe('hr_request_sent');
    expect(getHrState().requestSent).toBe(true);
  });

  /**
   * She is a school employee, not an association one. Empty signals and data
   * sources are the assertion, not an oversight — a coordinator has no business
   * reading AMISA's priority signals or its system inventory.
   */
  it('shows a school coordinator nothing of the association', () => {
    expect(hrManifest.signals).toEqual([]);
    expect(hrManifest.dataSources).toEqual([]);
    expect(hrManifest.features?.navSlots).toEqual(['ask']);
    expect(hrManifest.ui.stats).toEqual([]);
  });

  /**
   * The assignment overlay finishes by clicking a chip on the turn underneath
   * it (`closeThenFireChip`), and fireChip matches on exact visible text. So
   * that label MUST be offered on every turn the overlay can be opened from,
   * or she submits her assignment and the conversation behind it never moves —
   * which is precisely what happened before this test existed.
   */
  it("offers the overlay's exit chip on every turn that can open it", () => {
    const EXIT = "See my school's data";
    for (const key of ['hr_greeting', 'hr_reopen']) {
      expect(hr[key].suggested_chips, `${key} cannot receive the overlay's exit`).toContain(EXIT);
    }
    expect(hrManifest.flows.chipToFlowKey[EXIT]).toBe('hr_submitted');
  });

  it('declares both halves of the overlay wiring', () => {
    // Declare one without the other and no listener registers, silently.
    expect(hrManifest.features?.overlayOpenEvent).toBeTruthy();
    expect(hrManifest.overlayComponent).toBeTruthy();
  });
});

/**
 * The boundary probes.
 *
 * The engine's keyword rung scores a query against each flow's ANSWER text as
 * well as its question, and `strictMatch` only raises the bar to two matching
 * words. That is enough for a probe about student data to land on the peer
 * comparison purely because both mention "school" and "Chile" — which is the
 * single worst thing this demo could do in front of a committee, since it looks
 * like the association happily answered a question about student-level data for
 * a named country.
 *
 * `director_boundary` exists to win that match, and these cases pin it. Any of
 * them routing to a data view is a regression that has to fail here rather than
 * on stage.
 */
describe('questions that probe the boundary', () => {
  const DATA_VIEWS = [
    'director_peers',
    'director_suppressed',
    'director_benchmark',
    'director_participation',
    'director_completion',
  ];

  it.each([
    'show me student test scores for the school in Chile',
    'can I see one school\'s own data?',
    'show me the individual staff records for a school',
    'what are the AP and IB results by school?',
    'break the salary benchmark down by country',
    'drill into a named school\'s detail',
    'show me student level data',
  ])('answers %s with the boundary, not with data', (query) => {
    const { flowKey } = resolveFlowKey(directorManifest.flows, query);
    expect(
      DATA_VIEWS,
      `"${query}" routed to "${flowKey}", which shows data instead of stating the boundary`,
    ).not.toContain(flowKey);
    expect(flowKey === 'director_boundary' || flowKey === '__default__').toBe(true);
  });

  it('still routes the hero question to the benchmark', () => {
    const { flowKey } = resolveFlowKey(
      directorManifest.flows,
      "What is the average teacher salary for a master's degree with 3 years of experience?",
    );
    expect(flowKey).toBe('director_benchmark');
  });

  it('still routes an ordinary participation question to participation', () => {
    const { flowKey } = resolveFlowKey(directorManifest.flows, 'Show me who is missing');
    expect(flowKey).toBe('director_participation');
  });

  /** The refusal has to name what it will not do, or it is just a shrug. */
  it('names student data, staff records and the country cut in its answer', () => {
    const msg = director.director_boundary.ai_message!.toLowerCase();
    for (const term of ['student', 'staff records', 'country', 'test scores']) {
      expect(msg, `the boundary answer never mentions "${term}"`).toContain(term);
    }
  });
});

describe('the Executive Director sees no dashboard', () => {
  /**
   * The RFP asks AMISA to avoid the complexity and long-term maintenance of a
   * persistent dashboard. A route added later "just for participation" would
   * quietly undo the argument the demo makes out loud, so it fails here first.
   */
  it('exposes only Ask, My Reports and Data Sources', () => {
    expect(directorManifest.features?.navSlots).toEqual(['ask', 'myReports', 'dataSources']);
  });

  it('pins the salutation, because the demo clock is fixed', () => {
    expect(directorManifest.ui.greetingLabel).toBe('Good morning');
    expect(hrManifest.ui.greetingLabel).toBe('Good morning');
  });
});
