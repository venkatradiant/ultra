import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Info,
  Lock,
  Upload,
  X,
} from 'lucide-react';
import IllustrativeDataChip from '../../common/IllustrativeDataChip';
import { closeThenFireChip } from '../../common/fireChip';
import {
  ASSIGNMENT,
  QUESTIONS,
  QUESTIONS_TOTAL,
  SHARE_CHOICES,
  UPLOAD_COLUMNS,
  formatValue,
  validateAnswer,
} from '../../../data/amisa/hr/assignment';
import {
  answeredCount,
  markSubmitted,
  markUploaded,
  setAnswer,
  setHrState,
  toggleShare,
  useHrState,
} from './hrState';

/**
 * Ana Lucía's assignment — a questionnaire, not a chat.
 *
 * WHY AN OVERLAY, the same reasoning the DoIT Resident's survey records: this
 * collects answers, validates them, summarises them for review and submits.
 * Expressing that through the chat engine would force every answer option to
 * become a globally-unique chip label in one flat per-persona namespace, and a
 * numeric field with live validation does not fit a one-click-one-transition
 * model at all. The overlay costs zero shared edits.
 *
 * It portals to document.body: PersonaWorkspace renders `overlayComponent` as
 * an ordinary in-flow sibling inside an overflow-hidden flex column, so a
 * merely position:fixed child can still be clipped. Same precedent as the ESFCU
 * deck and the VOCE survey.
 *
 * THREE BEATS THIS SCREEN EXISTS FOR:
 *   1. The definition is beside the question, not in a handbook.
 *   2. Narrative text in a numeric field is refused before it can be submitted.
 *   3. The school decides what leaves the school, on a review step it cannot
 *      skip past.
 */
export default function AssignmentRuntime({ onClose }) {
  const { answers, step, submitted, uploaded, shares } = useHrState();
  const [draft, setDraft] = useState('');
  const [touched, setTouched] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const panelRef = useRef(null);
  const restoreTo = useRef(null);

  // `step` runs 0..QUESTIONS.length, where the last index is the review step.
  const onReview = step >= QUESTIONS.length;
  const question = onReview ? null : QUESTIONS[step];

  useEffect(() => {
    setDraft(question ? (answers[question.id] ?? '') : '');
    setTouched(false);
    setShowUpload(false);
    // Only when the step changes — re-syncing on every answers change would
    // fight the user's own typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    restoreTo.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (restoreTo.current instanceof HTMLElement) restoreTo.current.focus({ preventScroll: true });
    };
  }, [onClose]);

  const result = useMemo(
    () => (question ? validateAnswer(question, draft) : null),
    [question, draft],
  );

  const commit = useCallback(() => {
    if (!question) return;
    setTouched(true);
    if (!result?.valid) return;
    setAnswer(question.id, result.normalised ?? draft);
    setHrState({ step: step + 1 });
  }, [question, result, draft, step]);

  const answered = answeredCount();
  const progress = Math.round((answered / QUESTIONS_TOTAL) * 100);

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[2147483100] flex items-start justify-center overflow-y-auto bg-[rgba(10,11,9,0.62)] p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${ASSIGNMENT.office} assignment`}
        tabIndex={-1}
        className="my-auto w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl outline-none"
      >
        {/* ── Header: what she owns, and only what she owns ── */}
        <div className="border-b border-border-subtle px-5 py-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-brand">
                Your assignment · {ASSIGNMENT.office}
              </p>
              <h2 className="mt-0.5 text-[16px] font-semibold leading-snug text-text">
                {ASSIGNMENT.section}
              </h2>
              <p className="mt-0.5 text-[11.5px] text-text-muted">
                {ASSIGNMENT.school} · {QUESTIONS_TOTAL} questions · due {ASSIGNMENT.dueDate}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <IllustrativeDataChip size="sm" note="A fictional assignment at a fictional school." />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close the assignment"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Assignment progress"
              />
            </div>
            <span className="flex-shrink-0 text-[11.5px] font-medium text-text-muted">
              {answered} of {QUESTIONS_TOTAL}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-text-muted">
            You can stop here and come back. Nothing is lost, and nothing is sent until you review
            it.
          </p>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-4">
          {submitted ? (
            <SubmittedPanel onClose={onClose} />
          ) : onReview ? (
            <ReviewPanel shares={shares} answers={answers} onBack={() => setHrState({ step: QUESTIONS.length - 1 })} />
          ) : (
            <>
              <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Question {question.label} of {QUESTIONS_TOTAL}
              </p>
              <p className="mb-3 text-[15px] font-medium leading-snug text-text">{question.text}</p>

              {question.definition && (
                <div className="mb-3 rounded-lg border border-info/25 bg-info/[0.06] px-3 py-2">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-info" aria-hidden="true" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-info">
                      What counts here
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-text">{question.definition}</p>
                </div>
              )}

              {/*
                A real <form>, so Enter submits NATIVELY rather than through a
                keydown handler. Typing a salary and pressing Enter is the most
                natural interaction in this whole flow, and a keydown listener
                is the fragile way to catch it — ChatInput uses a form for the
                same reason. `noValidate` because the validation that matters is
                ours: the browser's would reject "1,100" that we standardise.
              */}
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  commit();
                }}
              >
                <Field
                  question={question}
                  value={draft}
                  onChange={setDraft}
                  onSubmit={commit}
                  invalid={touched && !result?.valid}
                />
                {/* Submits the form on Enter; the visible control is in the footer. */}
                <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
                  Save this answer
                </button>
              </form>

              {touched && !result?.valid && result?.message && (
                <Notice tone="error" icon={AlertTriangle}>
                  {result.message}
                </Notice>
              )}
              {result?.valid && result?.questioned && draft.trim() !== '' && (
                <Notice tone="warn" icon={AlertTriangle}>
                  {result.message}
                </Notice>
              )}
              {result?.valid && !result?.questioned && result?.message && (
                <Notice tone="ok" icon={CheckCircle2}>
                  {result.message}
                </Notice>
              )}

              {/* The spreadsheet path — offered on the salary questions only. */}
              {question.type === 'currency' && (
                <div className="mt-3">
                  {showUpload ? (
                    <UploadPanel
                      uploaded={uploaded}
                      onMap={() => {
                        markUploaded();
                        setDraft('34600');
                      }}
                      onCancel={() => setShowUpload(false)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowUpload(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                      Upload instead — it is already in a spreadsheet
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!submitted && (
          <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-5 py-3">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setHrState({ step: Math.max(0, step - 1) })}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back
            </button>

            {onReview ? (
              <button
                type="button"
                onClick={markSubmitted}
                className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Submit to AMISA
              </button>
            ) : (
              <button
                type="button"
                onClick={commit}
                className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {step === QUESTIONS.length - 1 ? 'Review and submit' : 'Next'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* ── Parts ─────────────────────────────────────────────────────────── */

function Field({ question, value, onChange, onSubmit, invalid }) {
  const id = `amisa-q-${question.id}`;
  const base = `w-full rounded-xl border-2 bg-surface px-3.5 py-2.5 text-[14px] text-text transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
    invalid ? 'border-critical' : 'border-border focus:border-brand/60'
  }`;

  if (question.type === 'singleselect') {
    return (
      <div className="space-y-2" role="radiogroup" aria-label={question.text}>
        {question.options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left text-[14px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                selected
                  ? 'border-brand bg-brand/[0.06] font-semibold text-text'
                  : 'border-border bg-surface text-text hover:border-brand/45'
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-[19px] w-[19px] flex-shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-brand' : 'border-border'}`}
              >
                {selected && <span className="h-[9px] w-[9px] rounded-full bg-brand" />}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === 'open') {
    return (
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Optional — anything that would help AMISA read your numbers correctly."
        className={base}
      />
    );
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit();
        }}
        aria-invalid={invalid || undefined}
        placeholder={question.type === 'currency' ? 'e.g. 34800' : question.type === 'percent' ? 'e.g. 6.5' : 'e.g. 86'}
        className={`${base} ${question.unit ? 'pr-16' : ''}`}
      />
      {question.unit && (
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-text-subtle">
          {question.unit}
        </span>
      )}
    </div>
  );
}

const NOTICE_TONES = {
  error: 'border-critical/35 bg-critical/[0.07] text-text',
  warn: 'border-warning/35 bg-warning/[0.08] text-text',
  ok: 'border-success/25 bg-success/[0.07] text-text',
};
const NOTICE_ICONS = { error: 'text-critical', warn: 'text-warning', ok: 'text-success' };

function Notice({ tone, icon: Icon, children }) {
  return (
    <div className={`mt-2.5 flex items-start gap-2 rounded-lg border px-3 py-2 ${NOTICE_TONES[tone]}`}>
      <Icon className={`mt-px h-4 w-4 flex-shrink-0 ${NOTICE_ICONS[tone]}`} aria-hidden="true" />
      <p className="text-[13px] leading-relaxed">{children}</p>
    </div>
  );
}

/** The spreadsheet path: map three columns once, same validation on every row. */
function UploadPanel({ uploaded, onMap, onCancel }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-semibold text-text">salary-scale-2026.xlsx · 96 rows</p>
        <button
          type="button"
          onClick={onCancel}
          className="text-[11.5px] font-medium text-text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Cancel
        </button>
      </div>
      <ul className="mb-2.5 space-y-1">
        {UPLOAD_COLUMNS.map((col) => (
          <li key={col.source} className="flex items-start gap-2 text-[12px]">
            {col.status === 'matched' ? (
              <Check className="mt-px h-3.5 w-3.5 flex-shrink-0 text-success" aria-hidden="true" />
            ) : (
              <Info className="mt-px h-3.5 w-3.5 flex-shrink-0 text-warning" aria-hidden="true" />
            )}
            <span className="text-text-muted">
              <span className="font-medium text-text">{col.source}</span> → {col.maps}
            </span>
          </li>
        ))}
      </ul>
      {uploaded ? (
        <p className="text-[13px] leading-relaxed text-text">
          Mapped. The same validation ran on all 96 rows — 94 passed, and 2 were held because the
          column is labelled COP against a field defined in USD. Nothing was converted on a guess.
        </p>
      ) : (
        <button
          type="button"
          onClick={onMap}
          className="rounded-lg bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Map these columns
        </button>
      )}
      <p className="mt-2 text-[11px] italic text-text-muted">
        Mapped once, then remembered. Next August she retypes none of it.
      </p>
    </div>
  );
}

/** The review step: what leaves the school, decided by the school. */
function ReviewPanel({ shares, answers, onBack }) {
  return (
    <div>
      <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        Before anything leaves this school
      </p>
      <h3 className="mb-1 text-[15px] font-semibold text-text">You choose what is shared</h3>
      <p className="mb-3 text-[13px] leading-relaxed text-text-muted">
        Not shared by default. Shared by decision.
      </p>

      <ul className="mb-3 divide-y divide-border-subtle">
        {SHARE_CHOICES.map((choice) => {
          const on = !!shares[choice.key];
          const id = `amisa-share-${choice.key}`;
          return (
            <li key={choice.key} className="flex items-start gap-3 py-2.5">
              {choice.shareable ? (
                <input
                  type="checkbox"
                  id={id}
                  checked={on}
                  onChange={() => toggleShare(choice.key)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-[var(--color-brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                />
              ) : (
                <span
                  className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-border bg-surface-2"
                  title="Stays at the school. Not a setting."
                >
                  <Lock className="h-2.5 w-2.5 text-text-subtle" aria-hidden="true" />
                </span>
              )}
              <label htmlFor={choice.shareable ? id : undefined} className={choice.shareable ? 'min-w-0 flex-1 cursor-pointer' : 'min-w-0 flex-1'}>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-text">{choice.label}</span>
                  {!choice.shareable && (
                    <span className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-text-subtle">
                      Stays here
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-text-muted">
                  {choice.detail}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mb-3 rounded-lg border border-brand/20 bg-brand/[0.05] px-3 py-2.5">
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">
          The school owns the data. The association sees the answer.
        </p>
        <p className="text-[13px] leading-relaxed text-text">
          {QUESTIONS.filter((q) => answers[q.id]).length} answers are ready to send as aggregated
          figures. Individual staff records are not in this submission and cannot be added to it.
        </p>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="text-[12px] font-medium text-text-muted underline-offset-2 hover:text-text hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Go back and change an answer
      </button>
    </div>
  );
}

function SubmittedPanel({ onClose }) {
  const { answers } = useHrState();
  const salary = answers.q5;
  return (
    <div className="py-2 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
      </div>
      <h3 className="text-[16px] font-semibold text-text">Submitted</h3>
      <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-text-muted">
        Timestamped and logged. AMISA has your aggregated figures
        {salary ? ` — including ${formatValue(QUESTIONS[4], salary)} at a master's degree with three years` : ''}. Your
        individual staff records never left the school.
      </p>
      {/*
        Closes the overlay AND advances the thread, rather than dropping her
        back on the turn she left. The label must stay identical to the chip on
        `hr_reopen` — amisaFlows.test asserts every offered chip is routed, and
        fireChip matches on exact text.
      */}
      <button
        type="button"
        onClick={() => closeThenFireChip(onClose, "See my school's data")}
        className="mt-4 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        See my school's data
      </button>
    </div>
  );
}
