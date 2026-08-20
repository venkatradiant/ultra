import { ImageIcon, Lock } from 'lucide-react';
import AmisaCard from '../shared/AmisaCard';
import { PeerBasisLine } from '../shared/AmisaTrustBits';
import { useDirectorState, setDirectorState } from '../shared/directorState';
import {
  BENCHMARK_DEFINITIONS,
  HERO_BENCHMARK,
  ILLUSTRATIVE_LINE,
  PUBLIC_FACTS,
  computeValidCount,
  methodologyLine,
} from '../../../data/amisa/_shared/constants';
import { MEMBER_SCHOOL_ROSTER, businessOfficeMissing, homeSchool, participatingSchools } from '../../../data/amisa/_shared/schools';
import { contributorsFor, peerGroupFor } from '../../../data/amisa/_shared/suppression';

/**
 * The association summary, as a school will receive it.
 *
 * TWO HEADERS, and the difference is the point. The outer card is AMISA's own
 * console. The inner bordered block is the school-facing document, and it
 * carries a NEUTRAL header with an empty logo slot — school-level branding is
 * explicitly undecided and AMISA said it will settle that with the selected
 * vendor. Designing a school branding system now would be inventing a decision
 * that has not been made, so the slot is visibly empty and labelled.
 *
 * The entitlement line is generated from the roster rather than asserted: the
 * six schools that never opened the Business Office receive the Human Resources
 * sections only, and the document says which sections the reader is getting.
 */
export default function SchoolSummaryCard({ variant = 'draft' }) {
  const { summaryTitle, summaryHeadline, sweep } = useDirectorState();
  const published = variant === 'published';
  const participating = participatingSchools();
  const contributors = contributorsFor(MEMBER_SCHOOL_ROSTER, 'salaryCell');
  const group = peerGroupFor(homeSchool(), contributors);
  const partial = businessOfficeMissing().length;

  return (
    <AmisaCard
      eyebrow={published ? 'Published to participating schools' : 'Draft · association summary'}
      title={published ? 'Sent to 31 schools' : 'Ready to publish'}
      intro={
        published
          ? `Each school received only the sections it is entitled to. Nothing went to the ${MEMBER_SCHOOL_ROSTER.length - participating.length} schools not participating this year.`
          : 'Edit the title or the headline, then publish. Every figure below is sourced.'
      }
      illustrativeNote="A fictional summary over a fictional wave."
      source="AMISA Survey Platform · AMISA Data Dictionary"
      freshness="2026 wave"
      footer={<PeerBasisLine group={group} />}
    >
      {/* ── The school-facing document ── */}
      <div className="rounded-lg border border-border bg-surface-2 p-4">
        {/* Neutral header. The logo slot is deliberately, visibly empty. */}
        <div className="mb-3 flex items-center gap-3 border-b border-border-subtle pb-3">
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-surface"
            title="Swappable logo slot — school-level branding is undecided"
          >
            <ImageIcon className="h-4 w-4 text-text-subtle" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-text">
              {PUBLIC_FACTS.shortName} Benchmark Summary
            </p>
            <p className="text-[10.5px] text-text-muted">
              Prepared for participating member schools · {PUBLIC_FACTS.motto}
            </p>
          </div>
        </div>

        {published ? (
          <>
            <p className="text-[14px] font-semibold leading-snug text-text">{summaryTitle}</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-text-muted">{summaryHeadline}</p>
          </>
        ) : (
          <div className="space-y-2">
            <Field
              label="Title"
              value={summaryTitle}
              onChange={(v) => setDirectorState({ summaryTitle: v })}
            />
            <Field
              label="Headline"
              value={summaryHeadline}
              onChange={(v) => setDirectorState({ summaryHeadline: v })}
              multiline
            />
          </div>
        )}

        <dl className="mt-3 space-y-1.5 border-t border-border-subtle pt-3 text-[13px]">
          <Row term="Average, master's + 3 years" def={`$${HERO_BENCHMARK.value.toLocaleString()} USD`} />
          <Row term="Schools contributing" def={`${HERO_BENCHMARK.contributingSchools} of ${participating.length} participating`} />
          <Row term="Peer group" def={`${group.size} schools, minimum ${group.threshold} · by enrollment and tuition`} />
          <Row term="Records in the answer" def={`${computeValidCount(sweep)} after the data-quality sweep`} />
          <Row term="Definition" def={BENCHMARK_DEFINITIONS['teacher-salary'].definition} />
        </dl>

        <p className="mt-3 border-t border-border-subtle pt-2 text-[10.5px] italic text-text-muted">
          {methodologyLine(sweep)} {ILLUSTRATIVE_LINE}
        </p>
      </div>

      {/* ── What each audience actually receives ── */}
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-info/25 bg-info/[0.06] px-3 py-2">
        <Lock className="mt-px h-4 w-4 flex-shrink-0 text-info" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-text">
          Each school sees its own figure against a group it belongs to, and nothing else. No other
          school is named anywhere in this document. {partial} schools that never opened the
          Business Office section receive the Human Resources sections only — office data is visible
          only to schools that entered it.
        </p>
      </div>
    </AmisaCard>
  );
}

function Row({ term, def }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="font-medium text-text-muted">{term}:</dt>
      <dd className="min-w-0 flex-1 text-text">{def}</dd>
    </div>
  );
}

function Field({ label, value, onChange, multiline }) {
  const id = `amisa-summary-${label.toLowerCase()}`;
  const shared =
    'w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12.5px] text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand';
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-muted">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} rows={2} value={value} onChange={(e) => onChange(e.target.value)} className={shared} />
      ) : (
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} className={shared} />
      )}
    </div>
  );
}
