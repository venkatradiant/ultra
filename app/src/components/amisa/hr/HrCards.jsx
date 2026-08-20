import { ClipboardList, TrendingUp, Lock, Send, CheckCircle2, Clock } from 'lucide-react';
import AmisaCard from '../shared/AmisaCard';
import { BoundaryNote } from '../shared/AmisaTrustBits';
import { useHrState, answeredCount, markRequestSent } from './hrState';
import { ASSIGNMENT, QUESTIONS, QUESTIONS_TOTAL, formatValue } from '../../../data/amisa/hr/assignment';
import { REQUESTED_SURVEY } from '../../../data/amisa/_shared/requestedSurvey';
import { homeSchool } from '../../../data/amisa/_shared/schools';
import { MIN_PEER_GROUP, SURVEY_WINDOW } from '../../../data/amisa/_shared/constants';

/**
 * Ana Lucía's inline cards.
 *
 * Four small components rather than four files: none is more than a screenful,
 * they share the same imports, and they are only ever mounted by one manifest.
 * The DoIT tenant splits its cards per file because several are reused across
 * two personas; these are not.
 */

/**
 * The landing card. One assignment, and the absence of everything else.
 *
 * What is NOT on this card is the point: no inbox, no attachment, no other
 * office, no other school. Progressive disclosure — only what she owns, at the
 * moment she needs it.
 */
export function AssignmentCard() {
  const { submitted } = useHrState();
  const answered = answeredCount();
  const progress = Math.round((answered / QUESTIONS_TOTAL) * 100);

  return (
    <AmisaCard
      eyebrow="Your assignment"
      title={`${ASSIGNMENT.office} · ${ASSIGNMENT.section}`}
      intro={`${QUESTIONS_TOTAL} questions. Due ${ASSIGNMENT.dueDate}.`}
      illustrativeNote="A fictional assignment at a fictional school."
      source={`${ASSIGNMENT.school} · AMISA Survey Platform`}
      freshness={submitted ? 'Submitted just now' : 'In progress'}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${submitted ? 100 : progress}%` }}
            role="progressbar"
            aria-valuenow={submitted ? 100 : progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Assignment progress"
          />
        </div>
        <span className="flex-shrink-0 text-[11.5px] font-medium text-text-muted">
          {submitted ? `${QUESTIONS_TOTAL} of ${QUESTIONS_TOTAL}` : `${answered} of ${QUESTIONS_TOTAL}`}
        </span>
      </div>

      <ul className="mb-3 space-y-1.5 text-[13px] leading-relaxed text-text-muted">
        <li className="flex items-start gap-2">
          <ClipboardList className="mt-px h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
          You are the Human Resources coordinator, so this is the only section assigned to you.
        </li>
        <li className="flex items-start gap-2">
          <Lock className="mt-px h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
          You cannot see the Business Office section, Admissions, or any other school.
        </li>
        <li className="flex items-start gap-2">
          <Clock className="mt-px h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
          Stop halfway and come back. Nothing is lost, and nothing is sent until you review it.
        </li>
      </ul>

      <BoundaryNote>
        Half-finished forms are the single biggest reason a benchmark comes back thin. This is one
        assignment with a progress bar, not an email with an attachment.
      </BoundaryNote>
    </AmisaCard>
  );
}

/**
 * Her own school's data, charted — and, as importantly, without a benchmark.
 *
 * The absence is deliberate and stated on the card. The window is still open;
 * nothing compares until the association says it can. For a school with no
 * warehouse and no analyst, seeing its own structure charted for the first time
 * is the value even before any benchmark exists.
 */
export function MySchoolCard() {
  const { answers, submitted } = useHrState();
  const school = homeSchool();
  const scale = [
    { label: "Bachelor's, starting", key: 'q3' },
    { label: "Master's, 3 years", key: 'q5' },
  ];
  const max = Math.max(
    ...scale.map((s) => Number(answers[s.key] || 0)),
    1,
  );

  return (
    <AmisaCard
      eyebrow="My school"
      title={school.name}
      intro={`${school.enrollment.toLocaleString()} students · your submission, as AMISA received it.`}
      illustrativeNote="Fictional school, fictional figures."
      source="Your own submission"
      freshness={submitted ? 'Submitted 90 seconds ago' : 'Not yet submitted'}
    >
      <ul className="mb-3 space-y-2">
        {scale.map((row) => {
          const raw = answers[row.key];
          const question = QUESTIONS.find((q) => q.id === row.key);
          const value = Number(raw || 0);
          return (
            <li key={row.key}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-[12.5px] text-text">{row.label}</span>
                <span className="text-[12.5px] font-semibold tabular-nums text-text">
                  {raw ? formatValue(question, String(raw)) : '—'}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-brand" style={{ width: `${(value / max) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Mini label="Teaching staff" value={answers.q1 ? Number(answers.q1).toLocaleString() : '—'} />
        <Mini label="Across-the-board increase" value={answers.q4 ? `${answers.q4}%` : '—'} />
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-info/25 bg-info/[0.06] px-3 py-2">
        <TrendingUp className="mt-px h-4 w-4 flex-shrink-0 text-info" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-text">
          <span className="font-semibold">No benchmark here yet, and no peer group.</span> The window
          is open until {SURVEY_WINDOW.closes}. Nothing compares until the association closes the
          wave and publishes — and when it does, you will see your figure against a group of at
          least {MIN_PEER_GROUP} schools, never against a named one.
        </p>
      </div>
    </AmisaCard>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 px-3 py-2">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-muted">{label}</p>
      <p className="mt-0.5 text-[17px] font-bold leading-none text-text">{value}</p>
    </div>
  );
}

/**
 * The survey her head of school wants to send — and where it actually goes.
 *
 * She does not email 70 people. It goes to the association first, which is the
 * control AMISA said it wanted to keep. Reads `REQUESTED_SURVEY`, the same
 * object Dr. Rhoads' approval queue reads.
 */
export function NewRequestCard({ variant = 'draft' }) {
  const { requestSent } = useHrState();
  const sent = variant === 'sent' || requestSent;

  return (
    <AmisaCard
      eyebrow={sent ? 'Sent to AMISA for approval' : 'New survey request'}
      title={REQUESTED_SURVEY.name}
      intro={
        sent
          ? 'It is with the association now. Nothing reaches the other schools until they approve it.'
          : 'Your head of school wants to ask the membership four questions.'
      }
      illustrativeNote="A fictional request from a fictional school."
      source="AMISA Survey Platform"
      freshness={sent ? 'Just now' : 'Draft'}
    >
      <ol className="mb-3 space-y-1.5">
        {REQUESTED_SURVEY.questions.map((q, i) => (
          <li key={q.id} className="flex gap-2 text-[12.5px] leading-relaxed text-text">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10.5px] font-semibold text-brand">
              {i + 1}
            </span>
            <span className="min-w-0">
              {q.text}
              <span className="ml-1.5 text-[11px] text-text-muted">· {q.type}</span>
            </span>
          </li>
        ))}
      </ol>

      {sent ? (
        <div className="flex items-start gap-2 rounded-lg border border-success/25 bg-success/[0.07] px-3 py-2">
          <CheckCircle2 className="mt-px h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-text">
            Waiting on the Executive Director. If approved it goes out with a window, reminders and
            a completion rate — instead of living in an inbox where half the membership never sees
            it.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={markRequestSent}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          Send to AMISA for approval
        </button>
      )}
    </AmisaCard>
  );
}
