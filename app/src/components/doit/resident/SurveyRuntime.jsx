import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Send, X } from 'lucide-react';
import {
  ChoiceOptions,
  ClarificationBubble,
  DefinitionCard,
  InterpretationRow,
  MultiSelectOptions,
  OpenInput,
  PrivacyNote,
  ProgressRing,
  ToggleSwitch,
} from './SurveyParts';
import ResponseSummaryCard, { CompletionCard } from './ResponseSummaryCard';
import WebFormView from './WebFormView';
import { StandardsStatusBar } from '../shared/TrustBits';
import { setResidentState, useResidentState, resetResidentState } from './residentState';
import clarifications from '../../../data/doit/resident/clarifications.json';
import {
  TOTAL_QUESTIONS,
  isAnswered,
  nextStepId,
  positionOf,
  questionById,
  totalFor,
} from '../../../data/doit/resident/surveyLogic';

/**
 * The Resident's survey — a questionnaire, not a chat.
 *
 * Why this is an overlay rather than chat flows: it collects answers, branches
 * on them, summarises them for review and submits. Expressing that through the
 * chat engine would force every answer option to become a globally-unique chip
 * label in one flat per-persona namespace — "Yes" and "No" on q5 could not be
 * reused anywhere — and multi-select does not fit a one-click-one-transition
 * model at all.
 *
 * It portals to document.body. PersonaWorkspace renders `overlayComponent` as an
 * ordinary in-flow sibling inside an overflow-hidden flex column, so a merely
 * position:fixed child can still be clipped. The ESFCU deck sets the precedent
 * (createPortal + a very high z-index); this matches it.
 *
 * It receives only `onClose` — the slot's type is
 * ComponentType<{ onClose: () => void }> — so it imports its own data.
 */

const findClarification = (text) => {
  const lower = text.toLowerCase();
  return clarifications.entries.find((entry) => entry.triggers.some((t) => lower.includes(t)));
};

export default function SurveyRuntime({ onClose }) {
  // Survey progress lives in a module store, not useState: PersonaWorkspace
  // unmounts the overlay on close, and both the reopen card and the reopen turn
  // promise that answers stay put.
  const { started, webForm, audioOn, voiceOn, stepId, answers, entries } = useResidentState();
  const setStarted = (v) => setResidentState({ started: v });
  const setWebForm = (v) => setResidentState({ webForm: v });
  const setAudioOn = (v) => setResidentState({ audioOn: v });
  const setVoiceOn = (v) => setResidentState({ voiceOn: v });
  const setStepId = (v) => setResidentState({ stepId: v });
  const setAnswers = (v) => setResidentState({ answers: v });

  // Draft text and pending multi-select stay local — they are keystrokes in
  // flight, not answers, and re-entering the survey should start them clean.
  const [draft, setDraft] = useState('');
  const [multi, setMulti] = useState([]);
  const [question, setQuestion] = useState('');
  const threadRef = useRef(null);
  const panelRef = useRef(null);

  const step = stepId === 'review' || stepId === 'complete' ? null : questionById(stepId);
  const total = useMemo(() => totalFor(answers) || TOTAL_QUESTIONS, [answers]);
  const position = step ? positionOf(stepId, answers) : total;

  // Escape closes, and the panel takes focus without dragging the shell behind
  // it (the workspace is overflow-hidden but still programmatically scrollable).
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

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, stepId]);

  const record = useCallback(
    (id, value) => {
      const q = questionById(id);
      const shown = Array.isArray(value) ? value.join(', ') : value;
      const nextAnswers = { ...answers, [id]: value };
      const next = nextStepId(id, value);
      setResidentState({
        answers: nextAnswers,
        entries: [
          ...entries,
          { kind: 'answer', id, question: q.text, label: q.label, shown, aiNote: q.aiNote },
        ],
        stepId: next ?? 'review',
      });
      setDraft('');
      setMulti([]);
    },
    [answers, entries],
  );

  const ask = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const match = findClarification(trimmed);
    setResidentState({
      entries: [
        ...entries,
        { kind: 'question', text: trimmed },
        {
          kind: 'clarification',
          card: match?.card,
          text: match?.response ?? (match?.card ? null : clarifications.fallback),
          verified: !!match,
          source: match?.source,
        },
      ],
    });
    setQuestion('');
  };

  /** Jump back to a question from the review table. */
  const editAnswer = (id) => {
    setStepId(id);
    const existing = answers[id];
    if (Array.isArray(existing)) setMulti(existing);
    else if (typeof existing === 'string') setDraft(existing);
  };

  if (webForm) {
    return (
      <WebFormView
        onSwitchBack={() => setWebForm(false)}
        onClose={onClose}
        answers={answers}
        onAnswers={setAnswers}
      />
    );
  }

  const body = (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Maryland Medical Assistance Application Survey"
      className="fixed inset-0 z-[2147483000] flex flex-col bg-bg outline-none"
    >
      {/* Header — mark, progress, accessibility switches, close */}
      <header className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b border-border-subtle bg-surface px-4 py-3 sm:px-6">
        <img src="/logos/maryland-doit-mark.svg" alt="" className="h-8 w-8 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-text">
            Maryland Medical Assistance Application Survey
          </p>
          <p className="text-[11.5px] text-text-muted">Maryland Department of Information Technology</p>
        </div>
        {started && stepId !== 'complete' && <ProgressRing position={position} total={total} />}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the survey"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </header>

      {started && (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-border-subtle bg-surface-2 px-4 py-2 sm:px-6">
          <ToggleSwitch checked={audioOn} onChange={setAudioOn} label="Read aloud" icon="volume" />
          <ToggleSwitch checked={voiceOn} onChange={setVoiceOn} label="Voice input" icon="mic" />
          <button
            type="button"
            onClick={() => setWebForm(true)}
            className="ml-auto min-h-[36px] rounded-lg px-2 text-[12px] font-semibold text-brand underline decoration-dotted underline-offset-2 hover:text-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Switch to the web form
          </button>
        </div>
      )}

      <div ref={threadRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-[560px] space-y-4">
          {!started ? (
            <IntroCard onStart={() => setStarted(true)} onWebForm={() => setWebForm(true)} />
          ) : (
            <>
              {entries.map((entry, i) => (
                <Entry key={i} entry={entry} />
              ))}

              {step && (
                <div className="space-y-3">
                  <p className="text-[15px] font-semibold leading-snug text-text">
                    {step.usesPreviousAnswer && answers.q2
                      ? `You mentioned ${[].concat(answers.q2).join(' and ').toLowerCase()}. ${step.text}`
                      : step.text}
                  </p>

                  {step.type === 'multiselect' ? (
                    <MultiSelectOptions
                      name={step.text}
                      options={step.options}
                      value={multi}
                      onChange={setMulti}
                      onSubmit={() => isAnswered(multi) && record(step.id, multi)}
                    />
                  ) : step.type === 'open' ? (
                    <OpenInput
                      label={step.text}
                      value={draft}
                      onChange={setDraft}
                      onSubmit={() => record(step.id, draft.trim())}
                      placeholder="Type your answer…"
                    />
                  ) : (
                    <ChoiceOptions
                      name={step.text}
                      options={step.options}
                      value={typeof answers[step.id] === 'string' ? answers[step.id] : null}
                      onChoose={(option) => record(step.id, option)}
                    />
                  )}
                </div>
              )}

              {stepId === 'review' && (
                <ResponseSummaryCard
                  answers={answers}
                  onEdit={editAnswer}
                  // Submit does NOT go through the answer path. The prototype
                  // called handleAnswer('review','submitted'), which pushed a
                  // stray "submitted" bubble and a "Recorded: submitted" row
                  // above the thank-you card.
                  onSubmit={() => setStepId('complete')}
                />
              )}

              {stepId === 'complete' && (
                <CompletionCard
                  onWebForm={() => setWebForm(true)}
                  onRestart={() => resetResidentState()}
                />
              )}
            </>
          )}
        </div>
      </div>

      {started && stepId !== 'complete' && (
        <footer className="flex-shrink-0 border-t border-border-subtle bg-surface px-4 py-3 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
            className="mx-auto flex w-full max-w-[560px] items-center gap-2"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Not sure what something means? Ask here."
              aria-label="Ask a question about this survey"
              className="min-h-[44px] min-w-0 flex-1 rounded-xl border-2 border-border bg-surface px-3.5 text-[13.5px] text-text placeholder:text-text-subtle focus-visible:border-brand focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              aria-label="Send question"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-colors enabled:hover:bg-brand-hover disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </footer>
      )}
    </div>
  );

  return createPortal(body, document.body);
}

function IntroCard({ onStart, onWebForm }) {
  const { intro } = clarifications;
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h1 className="text-[19px] font-bold leading-snug text-text">{intro.title}</h1>
      <p className="mt-1.5 text-[12px] font-medium text-text-muted">{intro.meta}</p>
      <p className="mt-3 text-[14px] leading-relaxed text-text">{intro.body}</p>

      <div className="mt-4 space-y-2.5">
        <PrivacyNote>{intro.privacy}</PrivacyNote>
        <StandardsStatusBar>{intro.standards}</StandardsStatusBar>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-4 min-h-[44px] w-full rounded-xl bg-brand px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Start →
      </button>
      <button
        type="button"
        onClick={onWebForm}
        className="mt-2 min-h-[40px] w-full rounded-lg px-3 text-[12.5px] text-text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Prefer a standard form?{' '}
        <span className="font-semibold text-brand underline decoration-dotted underline-offset-2">
          Switch to the web form.
        </span>
      </button>
    </div>
  );
}

/** One thing that already happened in the thread. */
function Entry({ entry }) {
  if (entry.kind === 'answer') {
    return (
      <div className="opacity-[0.55] transition-opacity hover:opacity-100">
        <p className="text-[13px] leading-snug text-text-muted">{entry.question}</p>
        <div className="mt-1.5 flex justify-end">
          <p className="max-w-[85%] rounded-xl rounded-tr-sm bg-brand px-3.5 py-2 text-[13.5px] text-white">
            {entry.shown}
          </p>
        </div>
        <div className="mt-1.5">
          <InterpretationRow answer={entry.shown} aiNote={entry.aiNote} />
        </div>
      </div>
    );
  }

  if (entry.kind === 'question') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-xl rounded-tr-sm border border-border bg-surface px-3.5 py-2 text-[13.5px] text-text">
          {entry.text}
        </p>
      </div>
    );
  }

  return entry.card ? (
    <DefinitionCard card={entry.card} source={entry.source} />
  ) : (
    <ClarificationBubble text={entry.text} verified={entry.verified} source={entry.source} />
  );
}

