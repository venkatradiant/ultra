import DoitModal, { ModalPrimary, ModalSecondary } from '../shared/DoitModal';
import { closeThenFireChip } from '../shared/fireChip';
import { GovernanceRow } from '../shared/TrustBits';
import { useAdminState, useAdminOpenOnce, setAdminState } from '../shared/adminState';
import { APPROVAL_QUEUE, PORTFOLIO_SURVEYS } from '../../../data/doit/_shared/constants';

/**
 * The Administrator's four gates.
 *
 * Every confirm label here is unique across the persona, because the chip map is
 * one flat namespace and modal buttons dispatch through it exactly as chips do.
 * A shared "Approve" across two surveys is the single most common way this port
 * goes wrong: it is unrepresentable, and it mis-routes silently.
 *
 * Approving also writes to the store, so the queue card behind the dialog shows
 * the survey as signed rather than still pending.
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
  const { approved } = useAdminState();
  if (!open) return null;

  const confirm = () => {
    if (item && !approved.includes(item.id)) setAdminState({ approved: [...approved, item.id] });
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
