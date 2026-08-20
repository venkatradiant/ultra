import { EyeOff } from 'lucide-react';
import AmisaCard from '../shared/AmisaCard';
import { PeerBasisLine, SuppressionNote, BoundaryNote } from '../shared/AmisaTrustBits';
import { MEMBER_SCHOOL_ROSTER, homeSchool } from '../../../data/amisa/_shared/schools';
import { contributorsFor, peerGroupFor } from '../../../data/amisa/_shared/suppression';
import { HERO_BENCHMARK } from '../../../data/amisa/_shared/constants';

/**
 * How one school compares with a privacy-safe peer group.
 *
 * `variant="suppressed"` renders the same card for a school too small to have a
 * peer group. That case is not an error state and is not hidden behind a toggle
 * — it is the demonstration. A committee of school IT directors will believe a
 * suppression rule they have watched refuse to produce a number far more
 * readily than one described in a sentence.
 *
 * WHAT THIS CARD CANNOT DO, by construction: name another school. The group is
 * rendered as a distribution and a count, never as a list. `peerGroupFor` is
 * given no country and returns no identifiers a reader could resolve, and the
 * salary figures shown per band are derived positions rather than any school's
 * submitted value.
 */

/** Where the subject sits against the group, as a coarse band. Never a rank. */
const BANDS = [
  { key: 'lower', label: 'Lower quartile', offset: -0.14 },
  { key: 'median', label: 'Group median', offset: 0 },
  { key: 'upper', label: 'Upper quartile', offset: 0.15 },
];

export default function PeerComparisonCard({ variant = 'group' }) {
  const contributors = contributorsFor(MEMBER_SCHOOL_ROSTER, 'salaryCell');

  // The suppressed variant uses the smallest contributing school — the one with
  // almost no true peers. Found rather than hardcoded, so a roster edit cannot
  // leave this card pointing at a school that now has plenty of peers.
  const subject =
    variant === 'suppressed'
      ? contributors.reduce((a, b) => (a.enrollment <= b.enrollment ? a : b))
      : homeSchool();

  const group = peerGroupFor(subject, contributors);
  const base = HERO_BENCHMARK.value;

  return (
    <AmisaCard
      eyebrow={variant === 'suppressed' ? 'Peer comparison · suppressed' : 'Peer comparison'}
      title={
        variant === 'suppressed'
          ? 'This school does not have enough peers to compare'
          : `${subject.name} against schools like it`
      }
      intro={
        variant === 'suppressed'
          ? 'The floor is not advisory. When a group is too small, no figure renders at all.'
          : `${subject.enrollment.toLocaleString()} students · $${subject.tuition.toLocaleString()} published tuition.`
      }
      illustrativeNote="Fictional school, fictional peer group, fictional salaries."
      source="AMISA Survey Platform · aggregated across the peer group"
      freshness="2026 wave"
      footer={<PeerBasisLine group={group} />}
    >
      <div className="mb-3">
        <SuppressionNote group={group} />
      </div>

      {group.suppressed ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-2 px-4 py-8 text-center">
          <EyeOff className="mb-2 h-6 w-6 text-text-subtle" aria-hidden="true" />
          <p className="text-[13px] font-semibold text-text">No comparison shown</p>
          <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-text-muted">
            Not a rounded figure, not an approximate one, and not one with a warning beside it.
            The school is told the group was too small and nothing else is disclosed.
          </p>
        </div>
      ) : (
        <>
          <ul className="mb-3 space-y-2">
            {BANDS.map((band) => {
              const value = Math.round((base * (1 + band.offset)) / 100) * 100;
              const pct = 12 + (band.offset + 0.14) * 240;
              const isMedian = band.key === 'median';
              return (
                <li key={band.key}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span
                      className={`text-[12.5px] ${isMedian ? 'font-semibold text-text' : 'text-text-muted'}`}
                    >
                      {band.label}
                    </span>
                    <span
                      className={`text-[12.5px] tabular-nums ${isMedian ? 'font-semibold text-text' : 'text-text-muted'}`}
                    >
                      ${value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full ${isMedian ? 'bg-brand' : 'bg-brand/35'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="rounded-lg border border-brand/25 bg-brand/[0.06] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">
              This school
            </p>
            <p className="mt-0.5 text-[13.5px] leading-relaxed text-text">
              Sits just above the group median for a master's degree at three years. Its own figure
              is visible to this school because it submitted the section.
            </p>
          </div>

          <div className="mt-3">
            <BoundaryNote>
              {group.size} schools stand behind these bands and not one of them is named here. The
              group is a distribution and a count, never a list — and it is never cut by country,
              because a country with a single member school in it is a country that names that
              school.
            </BoundaryNote>
          </div>
        </>
      )}
    </AmisaCard>
  );
}
