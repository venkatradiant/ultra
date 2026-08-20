/**
 * The AMISA tenant's data rules, asserted.
 *
 * Two things are being protected here.
 *
 * ARITHMETIC. Every figure the demo speaks aloud has to agree with every other
 * figure derived from it. A committee of school IT directors will divide 312 by
 * 29 and will notice if 8 + 3 + 1 + 2 does not make 14.
 *
 * PRIVACY. The suppression rules are the condition on which schools take part
 * at all. They are not a feature that can regress quietly — a country cut or a
 * group of four rendering once is enough to end participation, so each rule has
 * a test that fails loudly.
 */
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SWEEP,
  HERO_BENCHMARK,
  HR_PUBLISHED_VALID,
  HR_SURVEY,
  MEMBER_SCHOOLS,
  MIN_PEER_GROUP,
  PEER_GROUP_AXES,
  SWEEP_FINDINGS,
  computeValidCount,
  countAppliedFindings,
  methodologyLine,
  sweepSummaryLine,
} from './_shared/constants';
import {
  MEMBER_SCHOOL_ROSTER,
  businessOfficeMissing,
  homeSchool,
  hrSubmitters,
  participatingSchools,
  salaryContributors,
} from './_shared/schools';
import {
  aggregate,
  contributorsFor,
  entitlement,
  peerGroupFor,
} from './_shared/suppression';

describe('the roster', () => {
  it('holds exactly the member-school count the demo quotes', () => {
    expect(MEMBER_SCHOOL_ROSTER).toHaveLength(MEMBER_SCHOOLS);
  });

  it('gives every school a unique id', () => {
    const ids = MEMBER_SCHOOL_ROSTER.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  /**
   * The single most important assertion in this file.
   *
   * One school in Chile is the fact the entire privacy design answers to. If a
   * later edit adds a second, the "nobody at this table can find it" beat stops
   * being true of the roster it is spoken over.
   */
  it('keeps exactly one school in Chile', () => {
    const chile = MEMBER_SCHOOL_ROSTER.filter((s) => s.country === 'Chile');
    expect(chile).toHaveLength(1);
  });

  it('spans roughly the 25 countries AMISA describes', () => {
    const countries = new Set(MEMBER_SCHOOL_ROSTER.map((s) => s.country));
    expect(countries.size).toBe(25);
  });

  it('matches the participation figures the briefing states', () => {
    expect(participatingSchools()).toHaveLength(31);
    expect(hrSubmitters()).toHaveLength(HR_SURVEY.schoolsSubmitted); // 29
    expect(salaryContributors()).toHaveLength(HERO_BENCHMARK.contributingSchools); // 24
    expect(businessOfficeMissing()).toHaveLength(6);
  });

  it('keeps the year-1 cohort inside the projected 25–35 range', () => {
    expect(participatingSchools().length).toBeGreaterThanOrEqual(25);
    expect(participatingSchools().length).toBeLessThanOrEqual(35);
  });

  it('never counts a non-participating school as a submitter', () => {
    const ghosts = MEMBER_SCHOOL_ROSTER.filter(
      (s) => !s.participating && (s.submittedHr || s.submittedBusinessOffice || s.contributesSalaryCell),
    );
    expect(ghosts).toEqual([]);
  });

  it('models most schools under 1,000 students and none above 2,500', () => {
    const small = MEMBER_SCHOOL_ROSTER.filter((s) => s.enrollment < 1000);
    expect(small.length).toBeGreaterThan(MEMBER_SCHOOLS / 2);
    expect(Math.max(...MEMBER_SCHOOL_ROSTER.map((s) => s.enrollment))).toBeLessThanOrEqual(2500);
  });
});

describe('the data-quality sweep', () => {
  it('derives 298 valid records on the golden path', () => {
    expect(HR_PUBLISHED_VALID).toBe(298);
    expect(computeValidCount(DEFAULT_SWEEP)).toBe(298);
  });

  /** 8 + 3 + 1 + 2 = 14, and 312 − 14 = 298. The arithmetic said out loud. */
  it('excludes exactly the records its own findings account for', () => {
    const excluded = SWEEP_FINDINGS.filter((f) => DEFAULT_SWEEP[f.key]).reduce((n, f) => n + f.excludes, 0);
    expect(excluded).toBe(14);
    expect(HR_SURVEY.totalResponses - excluded).toBe(HR_PUBLISHED_VALID);
  });

  it('leaves the judgement call unchecked, so the human makes it', () => {
    const judgement = SWEEP_FINDINGS.filter((f) => f.judgement);
    expect(judgement).toHaveLength(1);
    expect(judgement[0].key).toBe('fast');
    expect(DEFAULT_SWEEP.fast).toBe(false);
  });

  it('gives every finding a stated reason', () => {
    for (const f of SWEEP_FINDINGS) {
      expect(f.reason.length, `${f.key} has no reason`).toBeGreaterThan(20);
    }
  });

  it('loses no records to a fix that only standardises values', () => {
    const stray = SWEEP_FINDINGS.find((f) => f.key === 'strayChars')!;
    expect(stray.excludes).toBe(0);
  });

  it('keeps the methodology line in step with whatever was applied', () => {
    expect(methodologyLine(DEFAULT_SWEEP)).toContain('298');
    expect(methodologyLine(DEFAULT_SWEEP)).toContain('retained');
    const withFast = { ...DEFAULT_SWEEP, fast: true };
    expect(computeValidCount(withFast)).toBe(284);
    expect(methodologyLine(withFast)).toContain('284');
    expect(methodologyLine(withFast)).not.toContain('retained');
  });

  it('reports the number of fixes it actually applied', () => {
    expect(countAppliedFindings(DEFAULT_SWEEP)).toBe(5);
    expect(sweepSummaryLine(DEFAULT_SWEEP)).toContain('5 of the 6');
    expect(sweepSummaryLine(DEFAULT_SWEEP)).toContain('kept the 14');
  });

  it('keeps nothing when every fix is declined', () => {
    expect(computeValidCount({})).toBe(HR_SURVEY.totalResponses);
  });
});

describe('peer grouping', () => {
  const contributors = () => contributorsFor(MEMBER_SCHOOL_ROSTER, 'salaryCell');

  it('offers no geographic axis at all', () => {
    expect([...PEER_GROUP_AXES]).toEqual(['enrollment', 'tuition']);
    expect(PEER_GROUP_AXES as readonly string[]).not.toContain('country');
    expect(PEER_GROUP_AXES as readonly string[]).not.toContain('region');
  });

  /**
   * The demo's headline group. 18 is spoken on stage, so it is pinned here —
   * a tolerance change that moves it has to be a deliberate edit to this test.
   */
  it('builds the home school a group of 18', () => {
    const group = peerGroupFor(homeSchool(), contributors());
    expect(group.size).toBe(18);
    expect(group.suppressed).toBe(false);
    expect(group.members).toHaveLength(18);
  });

  it('puts the school in Chile inside that group without naming it', () => {
    const group = peerGroupFor(homeSchool(), contributors());
    const chile = MEMBER_SCHOOL_ROSTER.find((s) => s.country === 'Chile')!;
    expect(group.members.map((s) => s.id)).toContain(chile.id);
    // The rendered reason is the only thing a viewer sees about composition,
    // and it must not leak a country, a name or an id.
    expect(group.reason).not.toContain('Chile');
    expect(group.reason).not.toContain(chile.name);
    expect(group.reason).not.toContain(chile.id);
  });

  it('never reads the subject\'s country when forming a group', () => {
    const subject = { ...homeSchool(), country: 'Atlantis' };
    const a = peerGroupFor(homeSchool(), contributors());
    const b = peerGroupFor(subject, contributors());
    expect(b.size).toBe(a.size);
    expect(b.members.map((s) => s.id)).toEqual(a.members.map((s) => s.id));
  });

  it('suppresses a group below the threshold and says why', () => {
    // The smallest contributing school has almost no true peers.
    const smallest = contributors().reduce((a, b) => (a.enrollment <= b.enrollment ? a : b));
    const group = peerGroupFor(smallest, contributors());
    expect(group.size).toBeLessThan(MIN_PEER_GROUP);
    expect(group.suppressed).toBe(true);
    expect(group.members).toEqual([]);
    expect(group.reason).toContain('Suppressed');
    expect(group.reason).toContain(String(MIN_PEER_GROUP));
  });

  it('renders at exactly the threshold, and suppresses one below it', () => {
    const pool = contributors();
    const atFloor = pool.find((s) => peerGroupFor(s, pool).size === MIN_PEER_GROUP);
    expect(atFloor, 'the roster should contain a school whose group sits exactly on the floor').toBeDefined();
    expect(peerGroupFor(atFloor!, pool).suppressed).toBe(false);
    // Raise the bar by one and the same group must disappear.
    expect(peerGroupFor(atFloor!, pool, { threshold: MIN_PEER_GROUP + 1 }).suppressed).toBe(true);
  });

  it('honours a per-office threshold, since AMISA sets those per survey', () => {
    const group = peerGroupFor(homeSchool(), contributors(), { threshold: 25 });
    expect(group.size).toBe(18);
    expect(group.suppressed).toBe(true);
    expect(group.reason).toContain('25');
  });

  it('excludes non-participants from the candidate pool entirely', () => {
    const pool = contributors();
    expect(pool.every((s) => s.participating)).toBe(true);
    expect(pool.every((s) => s.contributesSalaryCell)).toBe(true);
    expect(pool.length).toBe(HERO_BENCHMARK.contributingSchools);
  });

  it('drops the six missing schools from the Business Office pool', () => {
    const pool = contributorsFor(MEMBER_SCHOOL_ROSTER, 'businessOffice');
    expect(pool).toHaveLength(25);
    for (const missing of businessOfficeMissing()) {
      expect(pool.map((s) => s.id)).not.toContain(missing.id);
    }
  });
});

describe('aggregation', () => {
  const contributors = () => contributorsFor(MEMBER_SCHOOL_ROSTER, 'salaryCell');

  it('returns a value for a group above the floor', () => {
    const group = peerGroupFor(homeSchool(), contributors());
    const { value, contributors: n } = aggregate(group, (s) => s.tuition);
    expect(value).not.toBeNull();
    expect(n).toBe(18);
  });

  /**
   * The failure mode worth engineering against: a caller that forgets to check
   * `suppressed` must get nothing printable, not a plausible number.
   */
  it('returns null rather than a number when the group is suppressed', () => {
    const smallest = contributors().reduce((a, b) => (a.enrollment <= b.enrollment ? a : b));
    const group = peerGroupFor(smallest, contributors());
    const { value } = aggregate(group, (s) => s.tuition);
    expect(value).toBeNull();
    expect(Number.isNaN(value as unknown as number)).toBe(false);
  });
});

describe('entitlement', () => {
  it('gives a submitting school its own office benchmark', () => {
    const school = MEMBER_SCHOOL_ROSTER.find((s) => s.submittedBusinessOffice)!;
    expect(entitlement(school, 'businessOffice').allowed).toBe(true);
  });

  it('withholds an office a participating school did not submit', () => {
    const school = businessOfficeMissing()[0];
    const result = entitlement(school, 'businessOffice');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('only to schools that entered it');
  });

  it('withholds everything from a school that is not participating', () => {
    const school = MEMBER_SCHOOL_ROSTER.find((s) => !s.participating)!;
    expect(entitlement(school, 'hr').allowed).toBe(false);
    expect(entitlement(school, 'businessOffice').allowed).toBe(false);
    expect(entitlement(school, 'hr').reason).toContain('voluntary');
  });

  it('still gives the six missing schools their Human Resources benchmark', () => {
    // Missing one office does not cost a school the office it did submit.
    for (const school of businessOfficeMissing()) {
      if (school.submittedHr) expect(entitlement(school, 'hr').allowed).toBe(true);
    }
  });
});
