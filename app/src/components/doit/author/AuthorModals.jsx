import { useState } from 'react';
import DoitModal, { ModalPrimary, ModalSecondary } from '../shared/DoitModal';
import { closeThenFireChip } from '../shared/fireChip';
import { GovernanceRow, StandardsStatusBar, StatusBadge } from '../shared/TrustBits';
import { useAuthorState, useOpenOnce } from '../shared/authorState';
import { FORMAT_BY_ID, NATIVE_IDS } from '../../../data/doit/_shared/deliveryFormats';
import { APPROVER, SURVEY_2 } from '../../../data/doit/_shared/constants';

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

/**
 * The hard gate before the draft leaves the author's hands.
 *
 * Note what it is NOT: this does not put the survey in front of residents. A
 * published survey goes to the author's manager for approval first, and the
 * copy here has to say so — an author who reads "goes live in the formats
 * below" and then sees an approval receipt has been told two different things.
 */
export function PublishConfirmModal() {
  const { open, close } = useOpenOnce('author:publish-confirm');
  const { formats, distributionList } = useAuthorState();
  if (!open) return null;

  const chosen = formats.length ? formats : ['conversational'];
  const native = chosen.filter((id) => NATIVE_IDS.has(id));
  const platforms = chosen.filter((id) => !NATIVE_IDS.has(id));

  return (
    <DoitModal
      eyebrow="Goes to your manager next"
      title={`Send ${SURVEY_2.name} for approval?`}
      onClose={close}
      actions={
        <>
          <ModalPrimary focusOnMount onClick={() => closeThenFireChip(close, 'Yes, send for approval')}>
            Yes, send for approval
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
        This goes to <span className="font-semibold text-text">{APPROVER.name}</span>, {APPROVER.role},
        for sign-off. Once approved it reaches{' '}
        <span className="font-semibold text-text">{distributionList}</span> in the formats below.
        Nothing is sent to a resident before that approval.
      </p>

      <div className="mt-3 rounded-lg border border-border-subtle bg-surface-2 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
          Will go live in
        </p>
        <ul className="space-y-1.5">
          {native.map((id) => (
            <li key={id} className="flex items-center justify-between gap-2">
              <span className="text-[12.5px] text-text">{FORMAT_BY_ID[id]?.name || id}</span>
              <StatusBadge label="On approval" variant="generated" />
            </li>
          ))}
          {platforms.map((id) => (
            <li key={id} className="flex items-center justify-between gap-2">
              <span className="text-[12.5px] text-text">{FORMAT_BY_ID[id]?.name || id}</span>
              <StatusBadge label="On approval, via API" variant="generated" />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 space-y-2">
        <StandardsStatusBar />
        <GovernanceRow action="Submitted for approval" approvedBy="Sarah Chen" />
      </div>
    </DoitModal>
  );
}

/**
 * What a resident will actually see — the WHOLE survey, in whichever formats
 * are selected.
 *
 * It previously rendered one hardcoded question, because the only question-level
 * data reachable from here was `q7Options`; the rest of the draft lived in
 * DraftSurveyPanel's local state and could not be read. Now that the draft lives
 * in `authorState`, the preview is the draft — including questions the author
 * added, removed or reordered a moment ago.
 *
 * The web-form tab uses real (disabled) radio and checkbox controls rather than
 * styled spans. The claim being previewed is that every format is generated from
 * one definition and stays accessible; a fake radio does not preview that.
 */
export function SurveyPreviewModal() {
  const { open, close } = useOpenOnce('author:survey-preview');
  const { formats, draftQuestions } = useAuthorState();
  const showWebForm = formats.includes('webform');
  const [tab, setTab] = useState(showWebForm && !formats.includes('conversational') ? 'webform' : 'conversational');
  if (!open) return null;

  return (
    <DoitModal
      eyebrow="Resident preview"
      title={`How this looks to a resident — all ${draftQuestions.length} questions`}
      onClose={close}
      actions={
        <>
          <ModalPrimary focusOnMount onClick={() => closeThenFireChip(close, 'Looks good — send for approval')}>
            Looks good — send for approval
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

      {/* Nine questions do not fit a dialog. Scrolling here rather than on the
          dialog keeps the tabs and the confirm buttons in reach throughout. */}
      <div className="max-h-[46vh] overflow-y-auto rounded-lg border border-border-subtle bg-surface-2 p-3.5">
        {tab === 'conversational' ? (
          <div className="space-y-4">
            {draftQuestions.map((q, i) => (
              <div key={q.id} className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
                  Question {i + 1} of {draftQuestions.length}
                </p>
                <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-border-subtle bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-text">
                  {q.text}
                </div>
                {q.options === null ? (
                  <p className="rounded-lg border border-dashed border-border px-3 py-2 text-[11.5px] italic text-text-subtle">
                    The resident types or speaks their answer.
                  </p>
                ) : q.options.length === 0 ? (
                  <p className="text-[11.5px] font-medium text-critical">
                    No answer options yet — a resident cannot answer this.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((option) => (
                      <span key={option} className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] text-text-muted">
                        {option}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <p className="text-[11px] italic text-text-subtle">
              One question at a time, with read-aloud and voice input available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {draftQuestions.map((q, i) => (
              <WebFormPreviewQuestion key={q.id} question={q} num={i + 1} />
            ))}
            <p className="text-[11px] italic text-text-subtle">
              All {draftQuestions.length} questions on one page, with real radio and checkbox controls.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <StandardsStatusBar />
      </div>
    </DoitModal>
  );
}

/**
 * One question in the web-form preview.
 *
 * Controls are real inputs and `disabled` — a preview the author could answer
 * would be collecting a response, and the whole point of this dialog is that
 * nothing has been sent yet.
 */
function WebFormPreviewQuestion({ question, num }) {
  const multi = question.type.startsWith('Multi-select');
  const name = `preview-${question.id}`;

  if (question.options === null) {
    return (
      <div>
        <label htmlFor={name} className="mb-1.5 block text-[12.5px] font-semibold text-text">
          {num}. {question.text}
        </label>
        <textarea
          id={name}
          rows={2}
          disabled
          placeholder="The resident types their answer here"
          className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[12px] text-text-muted"
        />
      </div>
    );
  }

  return (
    <fieldset>
      <legend className="mb-1.5 text-[12.5px] font-semibold text-text">
        {num}. {question.text}
      </legend>
      {question.options.length === 0 ? (
        <p className="text-[11.5px] font-medium text-critical">
          No answer options yet — a resident cannot answer this.
        </p>
      ) : (
        <div className="space-y-1.5">
          {question.options.map((option, idx) => (
            <label key={option} className="flex items-center gap-2 text-[12.5px] text-text">
              <input
                type={multi ? 'checkbox' : 'radio'}
                name={name}
                value={option}
                disabled
                id={`${name}-${idx}`}
                className="h-[15px] w-[15px] flex-shrink-0 accent-brand"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
