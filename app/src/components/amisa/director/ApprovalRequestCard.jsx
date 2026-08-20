import { CalendarClock, Users, CheckCircle2 } from 'lucide-react';
import AmisaCard from '../shared/AmisaCard';
import { AppliedByRow } from '../shared/AmisaTrustBits';
import { REQUESTED_SURVEY } from '../../../data/amisa/_shared/requestedSurvey';
import { homeSchool } from '../../../data/amisa/_shared/schools';

/**
 * The survey a member school asked to send, waiting on the Executive Director.
 *
 * This is the control AMISA said it wanted to keep: a head of school does not
 * email 70 people, the request comes to the association first. It is also the
 * one place the two personas meet — Ana Lucía submits this request, and it
 * appears here. Both read `REQUESTED_SURVEY`, so they cannot describe the same
 * four questions differently.
 *
 * `variant="approved"` is the receipt after he schedules it.
 */
export default function ApprovalRequestCard({ variant = 'pending' }) {
  const school = homeSchool();
  const approved = variant === 'approved';

  return (
    <AmisaCard
      eyebrow={approved ? 'Approved and scheduled' : 'Approval queue · 1 pending'}
      title={REQUESTED_SURVEY.name}
      intro={`Requested by ${REQUESTED_SURVEY.requestedBy}, ${REQUESTED_SURVEY.requestedByRole} at ${school.name}.`}
      illustrativeNote="A fictional request from a fictional school."
      source="AMISA Survey Platform"
      freshness="Submitted yesterday, 3:20 PM"
      footer={approved ? <AppliedByRow action="Approved" at="September 30, 2026 at 7:26 AM" /> : null}
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Meta icon={Users} label="Goes to" value={REQUESTED_SURVEY.audience} />
        <Meta icon={CalendarClock} label="Window" value={approved ? REQUESTED_SURVEY.scheduledWindow : REQUESTED_SURVEY.requestedWindow} />
        <Meta
          icon={CheckCircle2}
          label={approved ? 'Reminders' : 'Status'}
          value={approved ? REQUESTED_SURVEY.reminders : 'Waiting on you'}
        />
      </div>

      {!approved && (
        <p className="mt-3 text-[11.5px] leading-relaxed text-text-muted">
          Approve it, send it back with a comment, or decline it. Nothing reaches the membership
          until you do — and once it does, it carries a window, reminders and a completion rate
          instead of living in an inbox.
        </p>
      )}
    </AmisaCard>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
        <span className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-muted">
          {label}
        </span>
      </div>
      <p className="mt-0.5 text-[12.5px] font-semibold leading-snug text-text">{value}</p>
    </div>
  );
}
