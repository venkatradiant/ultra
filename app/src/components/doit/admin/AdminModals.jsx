import { useState } from 'react';
import DoitModal, { ModalPrimary, ModalSecondary } from '../shared/DoitModal';
import { closeThenFireChip } from '../shared/fireChip';
import { GovernanceRow } from '../shared/TrustBits';
import { approve, sendBack, useAdminState, useAdminOpenOnce, setAdminState } from '../shared/adminState';
import { APPROVAL_QUEUE, PORTFOLIO_SURVEYS } from '../../../data/doit/_shared/constants';

/**
 * The Administrator's approval and brief dialogs.
 *
 * Every confirm label here is unique across the persona, because the chip map is
 * one flat namespace and modal buttons dispatch through it exactly as chips do.
 * A shared "Approve" across two surveys is the single most common way this port
 * goes wrong: it is unrepresentable, and it mis-routes silently.
 *
 * Approving and returning both write to the store, so the queue card behind the
 * dialog shows the survey as signed or returned rather than still pending.
 */

/** Sending the brief to leadership. */
export function SendBriefModal() {
  const { open, close } = useAdminOpenOnce('admin:send-brief');
  const { selectedSurveys, briefTopic } = useAdminState();
  if (!open) return null;

  const inScope = PORTFOLIO_SURVEYS.filter((s) => selectedSurveys.includes(s.id));
  const total = inScope.reduce((sum, s) => sum + s.responses, 0);

  return (
    <DoitModal
      title="Send this brief to leadership?"
      onClose={close}
      actions={
        <>
          <ModalPrimary focusOnMount onClick={() => closeThenFireChip(close, 'Yes, send it to leadership')}>
            Yes, send it to leadership
          </ModalPrimary>
          <ModalSecondary onClick={() => closeThenFireChip(close, 'Go back to the brief')}>
            Go back to the brief
          </ModalSecondary>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-text-muted">
        Sending <span className="font-semibold text-text">“{briefTopic}”</span>, drawn from{' '}
        {inScope.length} surveys and {total.toLocaleString()} responses. The sources line travels with
        it, so anyone reading can reproduce the figure.
      </p>
      <div className="mt-3">
        <GovernanceRow action="Will be recorded as sent" approvedBy="Marcus Johnson" />
      </div>
    </DoitModal>
  );
}

function ApproveModal({ id, chip, cancelChip, item, children }) {
  const { open, close } = useAdminOpenOnce(id);
  if (!open) return null;

  const confirm = () => {
    if (item) approve(item.id);
    closeThenFireChip(close, chip);
  };

  return (
    <DoitModal
      eyebrow="This action is logged under your name"
      title={children}
      onClose={close}
      actions={
        <>
          <ModalPrimary focusOnMount onClick={confirm}>
            {chip}
          </ModalPrimary>
          <ModalSecondary onClick={() => closeThenFireChip(close, cancelChip)}>{cancelChip}</ModalSecondary>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-text-muted">
        Approving schedules the survey and releases it to its distribution list. The approval is
        recorded against your name and cannot be withdrawn without contacting your administrator.
      </p>
      <div className="mt-3">
        <GovernanceRow action="Approver of record" approvedBy="Marcus Johnson" />
      </div>
    </DoitModal>
  );
}

export function ApprovePermitModal() {
  return (
    <ApproveModal
      id="admin:approve-1"
      chip="Yes, approve Permit Renewal"
      cancelChip="Back to the queue"
      item={APPROVAL_QUEUE[0]}
    >
      Approve Permit Renewal Feedback?
    </ApproveModal>
  );
}

export function ApproveServiceCenterModal() {
  return (
    <ApproveModal
      id="admin:approve-2"
      chip="Yes, approve Service Center"
      cancelChip="Back to the queue"
      item={APPROVAL_QUEUE[1]}
    >
      Approve Service Center Exit Survey?
    </ApproveModal>
  );
}

/** Both at once — the one that needs the most explicit confirm label. */
export function ApproveBothModal() {
  const { open, close } = useAdminOpenOnce('admin:approve-both');
  const { approved } = useAdminState();
  if (!open) return null;

  const confirm = () => {
    setAdminState({ approved: [...new Set([...approved, ...APPROVAL_QUEUE.map((a) => a.id)])] });
    closeThenFireChip(close, 'Yes, approve both surveys');
  };

  return (
    <DoitModal
      eyebrow="This action is logged under your name"
      title="Approve both surveys?"
      onClose={close}
      actions={
        <>
          <ModalPrimary focusOnMount onClick={confirm}>
            Yes, approve both surveys
          </ModalPrimary>
          <ModalSecondary onClick={() => closeThenFireChip(close, 'Back to the queue')}>
            Back to the queue
          </ModalSecondary>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-text-muted">
        This signs off both drafts without opening either one. If you have not read the questions, use
        Review each instead — the queue shows every question on both surveys.
      </p>
      <ul className="mt-3 space-y-1 rounded-lg border border-border-subtle bg-surface-2 p-2.5">
        {APPROVAL_QUEUE.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2 text-[12.5px] text-text">
            <span className="min-w-0 truncate">{item.name}</span>
            <span className="flex-shrink-0 text-[11px] text-text-muted">
              {item.questions} questions · {item.launch}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <GovernanceRow action="Approver of record" approvedBy="Marcus Johnson" />
      </div>
    </DoitModal>
  );
}

/**
 * Returning a draft to its author.
 *
 * "Send back to author" used to be a bare chip: the reply claimed the author
 * would see it in their drafts, but nothing was written anywhere and no reason
 * travelled with it. An approver rejecting work without saying why is the thing
 * a review step exists to prevent, so the note is required rather than optional.
 */
function SendBackModal({ id, chip, cancelChip, item, placeholder }) {
  const { open, close } = useAdminOpenOnce(id);
  const [comment, setComment] = useState('');
  if (!open) return null;

  const confirm = () => {
    sendBack(item.id, comment);
    closeThenFireChip(close, chip);
  };

  return (
    <DoitModal
      eyebrow="Goes back to the author with your name on it"
      title={`Return ${item.name} to ${item.author}?`}
      onClose={close}
      actions={
        <>
          <ModalPrimary focusOnMount onClick={confirm} disabled={!comment.trim()}>
            {chip}
          </ModalPrimary>
          <ModalSecondary onClick={() => closeThenFireChip(close, cancelChip)}>{cancelChip}</ModalSecondary>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-text-muted">
        {item.author} sees this in their drafts along with your note. Tell them what to change — a
        draft returned without a reason usually comes back unchanged.
      </p>
      <label className="mt-3 block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
          What needs changing
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[12.5px] leading-relaxed text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        />
      </label>
      {!comment.trim() && (
        <p className="mt-1 text-[11px] text-text-subtle">
          A note is required before this can go back.
        </p>
      )}
      <div className="mt-3">
        <GovernanceRow action="Returned" approvedBy="Marcus Johnson" />
      </div>
    </DoitModal>
  );
}

export function SendBackPermitModal() {
  return (
    <SendBackModal
      id="admin:send-back-1"
      chip="Yes, return it to Sarah"
      cancelChip="Back to the queue"
      item={APPROVAL_QUEUE[0]}
      placeholder="e.g. Q4 only shows if Q3 is Yes, but the wording implies it always appears. Please reword it."
    />
  );
}

export function SendBackServiceCenterModal() {
  return (
    <SendBackModal
      id="admin:send-back-2"
      chip="Yes, return it to James"
      cancelChip="Back to the queue"
      item={APPROVAL_QUEUE[1]}
      placeholder="e.g. Add a “Prefer not to say” option to the service centre question."
    />
  );
}
