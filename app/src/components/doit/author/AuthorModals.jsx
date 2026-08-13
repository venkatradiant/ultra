import { useState } from 'react';
import DoitModal, { ModalPrimary, ModalSecondary } from '../shared/DoitModal';
import { closeThenFireChip } from '../shared/fireChip';
import { GovernanceRow, StandardsStatusBar, StatusBadge } from '../shared/TrustBits';
import { useAuthorState, useOpenOnce } from '../shared/authorState';
import { FORMAT_BY_ID, NATIVE_IDS } from '../../../data/doit/_shared/deliveryFormats';
import { SURVEY_2 } from '../../../data/doit/_shared/constants';

/**
 * The Author's three dialogs.
 *
 * Each opens as soon as its turn lands and each confirm advances the thread by
 * clicking that turn's own suggested chip (see shared/fireChip.js for why).
 * Cancelling only closes the dialog — the chips stay on screen, so the author is
 * never trapped and never loses the branch.
 *
 * The confirm labels are deliberately distinct from the chips that OPEN the
 * dialogs ("Send to manager" opens, "Yes, send it to my manager" confirms). The
 * chip map is one flat namespace per persona and its substring rung has no word
 * boundary, so a shared label would mis-route.
 */

/** Open-then-confirm gate before the report leaves the building. */
export function SendConfirmModal() {
  const { open, close } = useOpenOnce('author:send-confirm');
  const { reportSubject } = useAuthorState();
  if (!open) return null;

  return (
    <DoitModal
      title="Ready to send?"
      onClose={close}
      actions={
        <>
          <ModalPrimary focusOnMount onClick={() => closeThenFireChip(close, 'Yes, send it to my manager')}>
            Yes, send it to my manager
          </ModalPrimary>
          <ModalSecondary onClick={() => closeThenFireChip(close, 'Go back')}>
            Go back
          </ModalSecondary>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-text-muted">
        This sends the findings report to your manager with the subject{' '}
        <span className="font-semibold text-text">“{reportSubject}”</span>. Make sure you have reviewed
        the headline and the methodology note above.
      </p>
      <div className="mt-3">
        <GovernanceRow action="Will be recorded as sent" approvedBy="Sarah Chen" />
      </div>
    </DoitModal>
  );
}

/** The hard gate. Publishing is the one irreversible act in the Author flow. */
export function PublishConfirmModal() {
  const { open, close } = useOpenOnce('author:publish-confirm');
  const { formats, distributionList } = useAuthorState();
  if (!open) return null;

  const chosen = formats.length ? formats : ['conversational'];
  const native = chosen.filter((id) => NATIVE_IDS.has(id));
  const platforms = chosen.filter((id) => !NATIVE_IDS.has(id));

  return (
    <DoitModal
      eyebrow="Human approval required"
      title={`Publish ${SURVEY_2.name}?`}
      onClose={close}
      actions={
        <>
          <ModalPrimary focusOnMount onClick={() => closeThenFireChip(close, 'I approve — publish now')}>
            I approve — publish now
          </ModalPrimary>
          {/* "Not yet" is already spoken for by the report path (→ author_later);
              the chip map is one flat namespace, so this cancel reuses the
              preview modal's label, which lands on the same delivery turn. */}
          <ModalSecondary onClick={() => closeThenFireChip(close, 'Keep editing')}>
            Keep editing
          </ModalSecondary>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-text-muted">
        This survey goes live in the formats below, to <span className="font-semibold text-text">{distributionList}</span>.
        Your approval is recorded permanently and cannot be undone without contacting your administrator.
      </p>

      <div className="mt-3 rounded-lg border border-border-subtle bg-surface-2 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
          Going live
        </p>
        <ul className="space-y-1.5">
          {native.map((id) => (
            <li key={id} className="flex items-center justify-between gap-2">
              <span className="text-[12.5px] text-text">{FORMAT_BY_ID[id]?.name || id}</span>
              <StatusBadge label="Live" variant="live" />
            </li>
          ))}
          {platforms.map((id) => (
            <li key={id} className="flex items-center justify-between gap-2">
              <span className="text-[12.5px] text-text">{FORMAT_BY_ID[id]?.name || id}</span>
              <StatusBadge label="Published via API" variant="generated" />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 space-y-2">
        <StandardsStatusBar />
        <GovernanceRow action="Approver of record" approvedBy="Sarah Chen" />
      </div>
    </DoitModal>
  );
}

/** What a resident will actually see, in whichever formats are selected. */
export function SurveyPreviewModal() {
  const { open, close } = useOpenOnce('author:survey-preview');
  const { formats, q7Options } = useAuthorState();
  const showWebForm = formats.includes('webform');
  const [tab, setTab] = useState(showWebForm && !formats.includes('conversational') ? 'webform' : 'conversational');
  if (!open) return null;

  const q7 = q7Options.length ? q7Options : SURVEY_2.q7SuggestedOptions;

  return (
    <DoitModal
      eyebrow="Resident preview"
      title="How this looks to a resident"
      onClose={close}
      actions={
        <>
          <ModalPrimary focusOnMount onClick={() => closeThenFireChip(close, 'Looks good — publish')}>
            Looks good — publish
          </ModalPrimary>
          <ModalSecondary onClick={() => closeThenFireChip(close, 'Keep editing')}>
            Keep editing
          </ModalSecondary>
        </>
      }
    >
      <div className="mb-3 flex gap-1.5" role="tablist" aria-label="Preview format">
        {[
          ['conversational', 'Conversational'],
          ['webform', 'Web form'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`min-h-[32px] rounded-md border px-3 text-[11.5px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              tab === id
                ? 'border-brand bg-brand text-white'
                : 'border-border bg-surface text-text-muted hover:bg-surface-2'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface-2 p-3.5">
        {tab === 'conversational' ? (
          <div className="space-y-2.5">
            <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-border-subtle bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-text">
              How easy was the permit renewal process overall?
            </div>
            <div className="flex flex-wrap gap-1.5">
              {q7.map((option) => (
                <span key={option} className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] text-text-muted">
                  {option}
                </span>
              ))}
            </div>
            <p className="text-[11px] italic text-text-subtle">
              One question at a time, with read-aloud and voice input available.
            </p>
          </div>
        ) : (
          <fieldset>
            <legend className="mb-2 text-[12.5px] font-semibold text-text">
              7. How easy was the permit renewal process overall?
            </legend>
            <div className="space-y-1.5">
              {q7.map((option) => (
                <span key={option} className="flex items-center gap-2 text-[12.5px] text-text">
                  <span aria-hidden="true" className="h-[15px] w-[15px] flex-shrink-0 rounded-full border-2 border-border bg-surface" />
                  {option}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] italic text-text-subtle">
              All nine questions on one page, with real radio and checkbox controls.
            </p>
          </fieldset>
        )}
      </div>

      <div className="mt-3">
        <StandardsStatusBar />
      </div>
    </DoitModal>
  );
}
