/**
 * Peer grouping and privacy suppression — the rules that decide whether a
 * benchmark is allowed to render at all.
 *
 * This module is pure and has no React in it on purpose. It is the one place
 * the association's promise to its schools is actually implemented, so it has
 * to be readable on its own and assertable in a test rather than spread across
 * cards that each remember to check a threshold.
 *
 * THREE RULES, in the order they apply:
 *
 *   1. Only participating schools that actually submitted the office in
 *      question are in scope. A school that did not submit is excluded from
 *      both the answer and the access — not as a penalty, as the entitlement
 *      rule the RFP wrote.
 *   2. Peer groups are built from enrollment and tuition. NEVER from country.
 *      AMISA has exactly one member school in Chile; a country cut names it.
 *      There is deliberately no code path here that accepts a geographic axis,
 *      so this cannot be enabled by passing an option.
 *   3. A group smaller than the threshold does not render. The caller gets a
 *      suppressed result carrying the reason, not a number it might print
 *      anyway.
 *
 * The threshold is a parameter with an illustrative default, never a hardcoded
 * 5. AMISA sets the real ones per survey and per office during governance
 * design — HR may need 5 where Finance needs 8.
 */

import { MIN_PEER_GROUP } from './constants';
import type { MemberSchool } from './schools';

/**
 * How wide a peer group reaches, as a fraction of the subject school's own
 * figures. ILLUSTRATIVE: ±45% enrollment and ±40% tuition. Real tolerances are
 * a governance decision, which is why they are parameters rather than
 * constants baked into the comparison.
 */
export const PEER_TOLERANCE = { enrollment: 0.45, tuition: 0.4 } as const;

export interface PeerGroupOptions {
  /** Minimum contributing schools before the group may render. */
  threshold?: number;
  enrollmentTolerance?: number;
  tuitionTolerance?: number;
}

export interface PeerGroupResult {
  /** The schools in the group, including the subject. Empty when suppressed. */
  members: MemberSchool[];
  /** Group size BEFORE suppression — safe to show, it names nobody. */
  size: number;
  threshold: number;
  suppressed: boolean;
  /** Why it was suppressed, or why it was allowed. Rendered verbatim. */
  reason: string;
  /** The bands the group was built from, for the "how was this built" line. */
  bands: {
    enrollment: [number, number];
    tuition: [number, number];
  };
}

const round = (n: number) => Math.round(n);

/**
 * Schools in scope for an office's benchmark: participating AND submitted.
 *
 * Both conditions matter and they are different. A school can be enrolled in
 * the data system for the year and still not have opened a given office — those
 * six schools are exactly the follow-up list, and they are out of scope for the
 * Business Office benchmark while remaining in scope for Human Resources.
 */
export function contributorsFor(
  schools: MemberSchool[],
  office: 'hr' | 'businessOffice' | 'salaryCell',
): MemberSchool[] {
  return schools.filter((s) => {
    if (!s.participating) return false;
    if (office === 'hr') return s.submittedHr;
    if (office === 'businessOffice') return s.submittedBusinessOffice;
    return s.contributesSalaryCell;
  });
}

/**
 * Build a peer group around one school from enrollment and tuition.
 *
 * Note what this function cannot do: there is no country parameter, no region
 * parameter, and the subject's own country is never read. That is the design,
 * not an omission — see rule 2 above.
 */
export function peerGroupFor(
  subject: MemberSchool,
  candidates: MemberSchool[],
  options: PeerGroupOptions = {},
): PeerGroupResult {
  const threshold = options.threshold ?? MIN_PEER_GROUP;
  const tE = options.enrollmentTolerance ?? PEER_TOLERANCE.enrollment;
  const tT = options.tuitionTolerance ?? PEER_TOLERANCE.tuition;

  const bands = {
    enrollment: [round(subject.enrollment * (1 - tE)), round(subject.enrollment * (1 + tE))] as [number, number],
    tuition: [round(subject.tuition * (1 - tT)), round(subject.tuition * (1 + tT))] as [number, number],
  };

  const members = candidates.filter(
    (s) =>
      s.enrollment >= bands.enrollment[0] &&
      s.enrollment <= bands.enrollment[1] &&
      s.tuition >= bands.tuition[0] &&
      s.tuition <= bands.tuition[1],
  );

  const size = members.length;
  const suppressed = size < threshold;

  return {
    members: suppressed ? [] : members,
    size,
    threshold,
    suppressed,
    reason: suppressed
      ? `Suppressed. ${size} ${size === 1 ? 'school' : 'schools'} match this peer group and the minimum is ${threshold}. Showing a result this small could identify a school.`
      : `${size} schools in this peer group, above the minimum of ${threshold}. Grouped by enrollment and tuition — never by country.`,
    bands,
  };
}

/**
 * Aggregate a figure over a peer group, refusing when the group is suppressed.
 *
 * Returns `null` for the value rather than 0 or NaN. A caller that forgets to
 * check `suppressed` gets nothing to print instead of a plausible-looking
 * number, which is the failure mode worth engineering against.
 */
export function aggregate(
  group: PeerGroupResult,
  valueOf: (school: MemberSchool) => number,
): { value: number | null; contributors: number } {
  if (group.suppressed || group.members.length === 0) {
    return { value: null, contributors: group.size };
  }
  const total = group.members.reduce((sum, s) => sum + valueOf(s), 0);
  return { value: total / group.members.length, contributors: group.members.length };
}

/**
 * What a given school is entitled to see for a given office.
 *
 * The whole entitlement model in one function: you see an office's benchmark
 * only if you entered that office's data. Used by the published summary so each
 * audience sees only what it is allowed to, and by the copy that explains to a
 * school why a section is closed to it.
 */
export function entitlement(
  school: MemberSchool,
  office: 'hr' | 'businessOffice',
): { allowed: boolean; reason: string } {
  if (!school.participating) {
    return {
      allowed: false,
      reason: 'This school is not enrolled in the data system this year, so it does not receive benchmarks. Participation is voluntary.',
    };
  }
  const submitted = office === 'hr' ? school.submittedHr : school.submittedBusinessOffice;
  const label = office === 'hr' ? 'Human Resources' : 'Business Office';
  return submitted
    ? { allowed: true, reason: `Submitted the ${label} section, so the ${label} benchmark is available to this school.` }
    : { allowed: false, reason: `Has not submitted the ${label} section. Office data is visible only to schools that entered it.` };
}
