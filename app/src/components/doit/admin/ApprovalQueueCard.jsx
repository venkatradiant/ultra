import { useState } from 'react';
import { CalendarClock, ChevronDown, FileQuestion, Users } from 'lucide-react';
import DoitCard from '../shared/DoitCard';
import { GovernanceRow, StandardsStatusBar, StatusBadge } from '../shared/TrustBits';
import { useAdminState } from '../shared/adminState';
import { APPROVAL_QUEUE } from '../../../data/doit/_shared/constants';

/**
 * Two surveys waiting on a signature.
 *
 * Every row expands to the actual questions, because approving a survey you have
 * not read is the failure mode this queue exists to prevent — a queue that only
 * shows titles is a rubber stamp with extra steps.
 *
 * `ApprovalCard` renders one row and `ApprovalQueueCard` renders the pair. The
 * prototype had two near-identical inline copies plus an abandoned
 * `ApprovalCardShell({ title, rows })` that nothing called; this is that
 * parameterised component, finished.
 */
export function ApprovalCard({ item, showGovernance = false }) {
  const [open, setOpen] = useState(false);
  const { approved, sentBack } = useAdminState();
  const state = approved.includes(item.id) ? 'approved' : sentBack.includes(item.id) ? 'sentBack' : 'pending';

  return (
    <div
      className={`rounded-lg border p-3 ${
        state === 'approved'
          ? 'border-success/30 bg-success/[0.05]'
          : state === 'sentBack'
            ? 'border-border bg-surface-2'
            : 'border-border-subtle bg-surface'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-text">{item.name}</p>
          <p className="text-[11.5px] text-text-muted">Authored by {item.author}</p>
        </div>
        <StatusBadge
          label={state === 'approved' ? 'Approved' : state === 'sentBack' ? 'Sent back' : 'Awaiting sign-off'}
          variant={state === 'approved' ? 'live' : state === 'sentBack' ? 'disconnected' : 'blocked'}
        />
      </div>

      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <Fact icon={FileQuestion} label={`${item.questions} questions`} />
        <Fact icon={CalendarClock} label={item.launch} />
        <Fact icon={Users} label={`~${item.recipients.toLocaleString()} recipients`} />
      </dl>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 inline-flex min-h-[32px] items-center gap-1 rounded-md px-1.5 text-[11.5px] font-semibold text-brand hover:bg-brand/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        {open ? 'Hide survey questions' : 'View survey questions'}
      </button>

      {open && (
        <ol className="mt-2 list-decimal space-y-1 rounded-md border border-border-subtle bg-surface-2 py-2 pl-7 pr-3">
          {item.preview.map((question) => (
            <li key={question} className="text-[12px] leading-relaxed text-text">
              {question}
            </li>
          ))}
        </ol>
      )}

      {showGovernance && state === 'approved' && (
        <div className="mt-2.5 border-t border-success/20 pt-2">
          <GovernanceRow action="Approved" approvedBy="Marcus Johnson" />
        </div>
      )}
    </div>
  );
}

function Fact({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1 text-[11.5px] text-text-muted">
      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
      {label}
    </div>
  );
}

export default function ApprovalQueueCard() {
  const { approved, sentBack } = useAdminState();
  const cleared = approved.length + sentBack.length;

  return (
    <DoitCard
      eyebrow="Approval queue"
      title={
        cleared >= APPROVAL_QUEUE.length
          ? 'Your queue is clear'
          : `${APPROVAL_QUEUE.length - cleared} surveys ready to launch`
      }
      intro="Nothing goes to residents without a named human signing for it."
      footer={<StandardsStatusBar>Both drafts pass the accessibility check in every delivery format.</StandardsStatusBar>}
    >
      <div className="space-y-2">
        {APPROVAL_QUEUE.map((item) => (
          <ApprovalCard key={item.id} item={item} showGovernance />
        ))}
      </div>
    </DoitCard>
  );
}
