import { ShieldCheck, Lock, FileLock2, BookOpen } from 'lucide-react';
import { MIN_PEER_GROUP_NOTE } from '../../../data/amisa/_shared/constants';

/**
 * The trust affordances AMISA's cards carry.
 *
 * The genuinely generic pieces live in `components/common` — the confidence
 * pill and the illustrative-data chip, both shared with other tenants. What is
 * here is what only this tenant needs: the privacy statements.
 *
 * They are components rather than strings because each appears on several cards
 * and must read identically every time. A suppression rule described two
 * different ways is a suppression rule a head of school does not trust.
 */

/**
 * The suppression state of a benchmark, stated plainly.
 *
 * Renders whether or not the group is suppressed. A benchmark that only
 * mentions the floor when it trips is a benchmark that looks like it has
 * something to hide the rest of the time.
 */
export function SuppressionNote({ group }) {
  const tone = group.suppressed
    ? 'border-warning/35 bg-warning/[0.08]'
    : 'border-success/25 bg-success/[0.07]';
  const iconColor = group.suppressed ? 'text-warning' : 'text-success';
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${tone}`}>
      <Lock className={`mt-px h-4 w-4 flex-shrink-0 ${iconColor}`} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[13px] leading-relaxed text-text">{group.reason}</p>
        <p className="mt-1 text-[11.5px] italic leading-relaxed text-text-muted">
          {MIN_PEER_GROUP_NOTE}
        </p>
      </div>
    </div>
  );
}

/**
 * How a peer group was built — and, as importantly, how it was not.
 *
 * The "never by country" half is the point. AMISA has one member school in
 * Chile, so a country cut names it, and saying so on the card is what turns a
 * privacy claim into something a committee can check.
 */
export function PeerBasisLine({ group }) {
  return (
    <div className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted">
      <ShieldCheck className="mt-px h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
      <span>
        Grouped by enrollment ({group.bands.enrollment[0].toLocaleString()}–
        {group.bands.enrollment[1].toLocaleString()} students) and tuition ($
        {group.bands.tuition[0].toLocaleString()}–${group.bands.tuition[1].toLocaleString()}).{' '}
        <span className="font-semibold text-text">Never by country</span> — the association has
        member countries with a single school in them.
      </span>
    </div>
  );
}

/** The definition that travelled with the question, shown where the answer is. */
export function DefinitionNote({ definition }) {
  return (
    <div className="rounded-lg border border-info/25 bg-info/[0.06] px-3 py-2">
      <div className="mb-0.5 flex items-center gap-1.5">
        <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-info" aria-hidden="true" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-info">
          Definition used — {definition.term}
        </p>
      </div>
      <p className="text-[13px] leading-relaxed text-text">{definition.definition}</p>
      <p className="mt-1 text-[10.5px] text-text-muted">{definition.appliesTo}</p>
    </div>
  );
}

/**
 * "Applied by … · timestamp · Audit trail recorded".
 *
 * The demo's clock is fixed, so the timestamp is a string. What matters is that
 * a human name sits in front of the action: the AI swept, the Executive
 * Director decided.
 */
export function AppliedByRow({ who = 'Dereck Rhoads', action = 'Applied', at = 'September 30, 2026 at 7:12 AM' }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-muted">
      <FileLock2 className="h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
      <span>
        {action} by <span className="font-semibold text-text">{who}</span>
      </span>
      <span className="text-text-subtle" aria-hidden="true">·</span>
      <span>{at}</span>
      <span className="text-text-subtle" aria-hidden="true">·</span>
      <span>Audit trail recorded</span>
    </div>
  );
}

/**
 * The boundary, stated once per screen that could be mistaken for crossing it.
 *
 * Dr. Rhoads corrected Radiant on this directly: the association does not want
 * student-level data or school-level insight. Any screen that looks like AMISA
 * inspecting a school's detail needs to say what it is actually showing.
 */
export function BoundaryNote({ children }) {
  return (
    <div className="rounded-lg border border-brand/20 bg-brand/[0.05] px-3 py-2.5">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">
        The school owns the data. The association sees the answer.
      </p>
      <p className="text-[13px] leading-relaxed text-text">{children}</p>
    </div>
  );
}

/**
 * The blanket disclaimer under generated findings.
 *
 * AMISA's own wording rather than a reused VOCE line: the audience here is a
 * head of school deciding whether to hand over salary data, and the tone across
 * amisa.us is plain and relationship-led rather than institutional.
 */
export function AiDisclaimer() {
  return (
    <p className="text-[11px] italic text-text-muted">
      AI-assisted. Review findings before sharing them with member schools.
    </p>
  );
}
