import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PrivacyNote } from './SurveyParts';
import { CompletionCard } from './ResponseSummaryCard';
import { StandardsStatusBar } from '../shared/TrustBits';
import clarifications from '../../../data/doit/resident/clarifications.json';
import {
  NONE_OPTION,
  QUESTIONS,
  isFollowUpAsked,
  toggleMultiSelect,
} from '../../../data/doit/resident/surveyLogic';

/**
 * The same six questions as a plain web form.
 *
 * "One definition, many delivery channels" is only a claim until both channels
 * ask the same person the same things. So the conditional Q3 and the "None of
 * these" exclusion come from `surveyLogic` — the identical functions the
 * conversational runtime calls — rather than being reimplemented here.
 *
 * These are the first real radio and checkbox inputs in the codebase: a grep for
 * type="radio" or type="checkbox" across src/ previously returned zero. Native
 * inputs matter here more than anywhere else in the app, because this is the
 * path a resident on a screen reader or a switch device will take.
 */
export default function WebFormView({ onSwitchBack, onClose, answers: initial = {}, onAnswers }) {
  const [answers, setAnswers] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const panelRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const showFollowUp = isFollowUpAsked(answers);
  const visible = QUESTIONS.filter((q) => q.id !== 'q3' || showFollowUp);

  const set = (id, value) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    onAnswers?.(next);
    setError(null);
  };

  const submit = (e) => {
    e.preventDefault();
    const missing = visible.find((q) => {
      const v = answers[q.id];
      return Array.isArray(v) ? v.length === 0 : !String(v ?? '').trim();
    });
    if (missing) {
      setError(`Question ${missing.label} still needs an answer.`);
      requestAnimationFrame(() => errorRef.current?.focus({ preventScroll: true }));
      return;
    }
    setSubmitted(true);
  };

  const body = (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Maryland Medical Assistance Application Survey — web form"
      className="fixed inset-0 z-[2147483000] flex flex-col bg-bg outline-none"
    >
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-border-subtle bg-surface px-4 py-3 sm:px-6">
        <img src="/logos/maryland-doit-mark.svg" alt="" className="h-8 w-8 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-text">
            Maryland Medical Assistance Application Survey
          </p>
          <p className="text-[11.5px] text-text-muted">Web form</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the survey"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-[620px]">
          {submitted ? (
            <CompletionCard />
          ) : (
            <>
              <div className="mb-4 rounded-xl border border-border bg-surface p-4">
                <p className="text-[13px] leading-relaxed text-text">{clarifications.intro.body}</p>
                <div className="mt-3 space-y-2.5">
                  <PrivacyNote>{clarifications.intro.privacy}</PrivacyNote>
                  <StandardsStatusBar>{clarifications.intro.standards}</StandardsStatusBar>
                </div>
                <button
                  type="button"
                  onClick={onSwitchBack}
                  className="mt-3 min-h-[40px] rounded-lg px-2 text-[12.5px] font-semibold text-brand underline decoration-dotted underline-offset-2 hover:text-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Switch to the conversational survey
                </button>
              </div>

              <form onSubmit={submit} noValidate>
                <div className="space-y-4">
                  {visible.map((q) => (
                    <FormQuestion key={q.id} question={q} value={answers[q.id]} onChange={(v) => set(q.id, v)} />
                  ))}
                </div>

                {error && (
                  <p
                    ref={errorRef}
                    tabIndex={-1}
                    role="alert"
                    className="mt-4 rounded-lg border border-critical/30 bg-critical/[0.07] px-3 py-2 text-[13px] font-medium text-critical outline-none"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-4 min-h-[44px] w-full rounded-xl bg-brand px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Submit my answers
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}

function FormQuestion({ question, value, onChange }) {
  const multi = question.type === 'multiselect';
  const open = question.type === 'open';
  const selected = multi ? value || [] : value;

  return (
    <fieldset className="rounded-xl border border-border bg-surface p-4">
      <legend className="px-1 text-[14px] font-semibold leading-snug text-text">
        <span className="mr-1.5 text-text-muted">{question.label}.</span>
        {question.text}
      </legend>

      {question.aiNote && (
        <p className="mt-1 text-[12px] italic leading-relaxed text-text-muted">{question.aiNote}</p>
      )}

      {open ? (
        <>
          <label className="sr-only" htmlFor={`wf-${question.id}`}>
            {question.text}
          </label>
          <textarea
            id={`wf-${question.id}`}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="mt-2.5 w-full resize-none rounded-lg border-2 border-border bg-surface px-3 py-2 text-[13.5px] leading-relaxed text-text placeholder:text-text-subtle focus-visible:border-brand focus-visible:outline-none"
            placeholder="Type your answer…"
          />
        </>
      ) : (
        <div className="mt-2.5 space-y-1">
          {question.options.map((option) => {
            const id = `wf-${question.id}-${option.replace(/\W+/g, '-')}`;
            const checked = multi ? selected.includes(option) : selected === option;
            return (
              <div
                key={option}
                className={`flex min-h-[44px] items-center gap-3 rounded-lg px-2 ${
                  option === NONE_OPTION && multi ? 'mt-1.5 border-t border-border-subtle pt-2.5' : ''
                }`}
              >
                <input
                  id={id}
                  type={multi ? 'checkbox' : 'radio'}
                  name={`wf-${question.id}`}
                  value={option}
                  checked={checked}
                  onChange={() => onChange(multi ? toggleMultiSelect(selected, option) : option)}
                  className="h-[18px] w-[18px] flex-shrink-0 accent-[var(--color-brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                />
                <label htmlFor={id} className="flex-1 cursor-pointer py-1 text-[13.5px] text-text">
                  {option}
                </label>
              </div>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
