import { Users, ClipboardCheck } from 'lucide-react';
import AmisaCard from '../shared/AmisaCard';
import { BoundaryNote } from '../shared/AmisaTrustBits';
import ConfidenceBadge from '../../common/ConfidenceBadge';
import {
  MEMBER_SCHOOL_ROSTER,
  hrSubmitters,
  participatingSchools,
} from '../../../data/amisa/_shared/schools';
import {
  HR_SURVEY,
  MEMBER_SCHOOLS,
  PARTICIPATION_OUTLOOK,
  SURVEY_WINDOW,
} from '../../../data/amisa/_shared/constants';

/**
 * Where participation stands, by office.
 *
 * Every count here is a count of SUBMISSION STATUS. Not one figure a school
 * entered appears on this card, and the boundary note says so — because a
 * screen headed "Human Resources" on the association's console is exactly the
 * screen Dr. Rhoads warned would fail in front of him if it showed a school's
 * detail.
 */

const OFFICES = [
  { key: 'submittedHr', label: 'Human Resources', note: 'Salary and benefits' },
  { key: 'submittedBusinessOffice', label: 'Business Office', note: 'Enrolment and tuition' },
];

export default function ParticipationCard() {
  const participating = participatingSchools();
  const total = participating.length;

  return (
    <AmisaCard
      eyebrow="Survey window · closes tonight"
      title={`${HR_SURVEY.totalResponses} responses from ${HR_SURVEY.schoolsSubmitted} schools`}
      intro={`${SURVEY_WINDOW.opens} to ${SURVEY_WINDOW.closes}. ${SURVEY_WINDOW.daysRemaining} day remaining before benchmarks go live on ${SURVEY_WINDOW.publishBy}.`}
      source="AMISA Survey Platform · submission status only"
      freshness="This morning, 6:00 AM"
      footer={
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-text">
              <span className="font-semibold">{total}</span> of {MEMBER_SCHOOLS} member schools are
              enrolled in the data system this year
            </p>
            <ConfidenceBadge score={97} note="Submission status is a platform record, not an inference." />
          </div>
          {/*
            A PROJECTION, and labelled as one. These figures come from AMISA's
            strategic planning rather than from anything collected — the intake
            is explicit that year-one participation and the named-user count are
            estimates. Printing them beside measured figures without saying so
            is how an estimate becomes a number somebody later quotes back.
          */}
          <p className="text-[11.5px] italic leading-relaxed text-text-muted">
            Projection, not collected data: {PARTICIPATION_OUTLOOK.yearOneLow}–
            {PARTICIPATION_OUTLOOK.yearOneHigh} schools expected in year one, another{' '}
            {PARTICIPATION_OUTLOOK.laterYearsLow}–{PARTICIPATION_OUTLOOK.laterYearsHigh} over
            following years, and up to about {PARTICIPATION_OUTLOOK.namedUsersApprox} named users
            once {MEMBER_SCHOOLS} schools each staff {PARTICIPATION_OUTLOOK.officesPerSchoolLow}–
            {PARTICIPATION_OUTLOOK.officesPerSchoolHigh} offices.
          </p>
        </div>
      }
    >
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={Users} label="Schools submitted" value={hrSubmitters().length} of={total} />
        <Stat icon={ClipboardCheck} label="Completion" value={`${HR_SURVEY.completionPct}%`} />
        <Stat label="Responses in" value={HR_SURVEY.totalResponses} />
        <Stat label="Days remaining" value={SURVEY_WINDOW.daysRemaining} tone="warning" />
      </div>

      <ul className="mb-3 space-y-2">
        {OFFICES.map((office) => {
          const done = participating.filter((s) => s[office.key]).length;
          const pct = Math.round((done / total) * 100);
          return (
            <li key={office.key}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-text">{office.label}</span>
                <span className="text-[11.5px] text-text-muted">
                  {done} of {total} submitted · {office.note}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${office.label} submissions`}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <BoundaryNote>
        This is submission status across {MEMBER_SCHOOL_ROSTER.length} member schools — who has
        answered, not what they answered. No school's salary, enrolment or tuition figures are
        visible to the association at this level, and no screen here drills into one.
      </BoundaryNote>
    </AmisaCard>
  );
}

function Stat({ icon: Icon, label, value, of, tone }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 px-3 py-2">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />}
        <span className="truncate text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-muted">
          {label}
        </span>
      </div>
      <p className={`mt-0.5 text-[19px] font-bold leading-none ${tone === 'warning' ? 'text-warning' : 'text-text'}`}>
        {value}
        {of != null && <span className="text-[13px] font-medium text-text-muted"> / {of}</span>}
      </p>
    </div>
  );
}
