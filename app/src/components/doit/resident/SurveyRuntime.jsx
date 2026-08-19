import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Mic, Send, Volume2, X } from 'lucide-react';
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
import { matchSpokenAnswer, useReadAloud, useVoiceInput, voiceInputSupported, speechSupported } from './useSpeech';
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
  toggleMultiSelect,
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

/**
 * A question as it is read aloud.
 *
 * The question's own terminator is dropped before the options are appended —
 * a synthesiser reads "Assistance?. Your options are" with an audible stumble
 * where the two stops collide.
 */
const spokenFor = (step) =>
  step.options?.length
    ? `${step.text.replace(/[.?!]+$/, '')}. Your options are: ${step.options.join(', ')}.`
    : step.text;

const findClarification = (text) => {
  const lower = text.toLowerCase();
  return clarifications.entries.find((entry) => entry.triggers.some((t) => lower.includes(t)));
};

export default function SurveyRuntime({ onClose }) {
  // Survey progress lives in a module store, not useState: PersonaWorkspace
  // unmounts the overlay on close, and both the reopen card and the reopen turn
  // promise that answers stay put.
  const { started, webForm, audioOn, voiceOn, stepId, answers, entries, returnTo } = useResidentState();
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

  // Read-aloud and voice input. Both toggles were previously inert booleans; the
  // capability check decides whether they are offered at all, because a switch
  // that cannot do anything is the thing this replaced.
  const canRead = speechSupported();
  const canListen = voiceInputSupported();
  const readAloud = useReadAloud(audioOn);
  const [heard, setHeard] = useState(null);

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

  // Speak each new question as it arrives, and its options with it — a resident
  // relying on audio needs to know what they are choosing between, not only
  // what they are being asked.
  useEffect(() => {
    if (!audioOn || !started || !step) return;
    readAloud.speak(step.id, spokenFor(step));
    // `readAloud` is stable across renders; depending on it would re-speak the
    // question every time the speaking indicator changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioOn, started, stepId]);

  /**
   * Record one answer.
   *
   * Two things it now does that it did not before.
   *
   * PROVENANCE. `interpretation` is carried on the entry, and it is only ever
   * present when the resident SPOKE and VOCE had to decide which option they
   * meant. A tapped option is a choice, not an interpretation — the receipt used
   * to print "AI Confidence: 93%" over every answer, including radio buttons,
   * asserting a judgement nobody had made.
   *
   * EDITING. When `returnTo` is set the resident is correcting an answer from
   * the review table. Then this REPLACES that answer's entry rather than
   * appending a second one, and goes straight back to the summary instead of
   * walking forward through questions that are already answered.
   */
  const record = useCallback(
    (id, value, interpretation = null) => {
      const q = questionById(id);
      const shown = Array.isArray(value) ? value.join(', ') : value;
      const nextAnswers = { ...answers, [id]: value };
      const entry = { kind: 'answer', id, question: q.text, label: q.label, shown, aiNote: q.aiNote, interpretation };

      if (returnTo === 'review') {
        const replaced = entries.map((e) => (e.kind === 'answer' && e.id === id ? entry : e));
        // Changing q2 can add or remove the conditional follow-up. If it no
        // longer applies, its answer has to go with it — leaving it behind would
        // put a question on the summary that this resident was never asked.
        const followUpNow = nextStepId(id, value) === 'q3';
        const dropsFollowUp = id === 'q2' && !followUpNow;
        if (dropsFollowUp) delete nextAnswers.q3;
        setResidentState({
          answers: nextAnswers,
          entries: dropsFollowUp ? replaced.filter((e) => !(e.kind === 'answer' && e.id === 'q3')) : replaced,
          // The one case that cannot go straight back: q2 just turned the
          // follow-up ON, so there is a genuinely unanswered question to ask.
          stepId: id === 'q2' && followUpNow && nextAnswers.q3 === undefined ? 'q3' : 'review',
          returnTo: id === 'q2' && followUpNow && nextAnswers.q3 === undefined ? 'review' : null,
        });
        setDraft('');
        setMulti([]);
        return;
      }

      const next = nextStepId(id, value);
      setResidentState({
        answers: nextAnswers,
        entries: [...entries, entry],
        stepId: next ?? 'review',
      });
      setDraft('');
      setMulti([]);
    },
    [answers, entries, returnTo],
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

  /**
   * What to do with a spoken answer.
   *
   * For an open question the transcript IS the answer — there is nothing to
   * interpret, so nothing claims to have interpreted it; it lands in the draft
   * for the resident to check before submitting.
   *
   * For a question with options VOCE has to decide which one they meant, and
   * that decision is the only genuine interpretation in this survey. It travels
   * with the answer as `interpretation`, which is what the receipt shows a
   * confidence score for. When nothing is close enough it says so rather than
   * recording a guess.
   */
  const handleTranscript = useCallback(
    (transcript) => {
      if (!step) return;
      if (step.type === 'open') {
        setDraft(transcript);
        setHeard(null);
        return;
      }
      const match = matchSpokenAnswer(transcript, step.options);
      if (!match) {
        setHeard({ transcript, matched: false });
        return;
      }
      setHeard(null);
      if (step.type === 'multiselect') {
        setMulti((current) => toggleMultiSelect(current, match.option));
        return;
      }
      record(step.id, match.option, {
        heard: transcript,
        mappedTo: match.option,
        score: match.confidence,
      });
    },
    [step, record],
  );

  const voice = useVoiceInput(handleTranscript);

  /**
   * Jump back to one question from the review table.
   *
   * `returnTo` is what makes this a round trip rather than a restart — see
   * `record` above.
   */
  const editAnswer = (id) => {
    setResidentState({ stepId: id, returnTo: 'review' });
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
          <p className="text-[11.5px] text-text-muted">Maryland DoIT</p>
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

      {/* Each switch appears only where the browser can honour it. Speech
          recognition is Chromium and Safari only, and an accessibility control
          that does nothing is worse than one that is absent. */}
      {started && (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-border-subtle bg-surface-2 px-4 py-2 sm:px-6">
          {canRead && (
            <ToggleSwitch checked={audioOn} onChange={setAudioOn} label="Read aloud" icon="volume" />
          )}
          {canListen && (
            <ToggleSwitch checked={voiceOn} onChange={setVoiceOn} label="Voice input" icon="mic" />
          )}
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
              {/* Only offer "Change" once the whole survey has been answered.
                  Mid-survey, the question the resident is looking at is the one
                  they should be answering; jumping backwards from an earlier
                  receipt would strand them in the middle of a path. */}
              {entries.map((entry, i) => (
                <Entry
                  key={i}
                  entry={entry}
                  onEdit={stepId === 'review' && entry.kind === 'answer' ? () => editAnswer(entry.id) : undefined}
                />
              ))}

              {step && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-text">
                      {step.usesPreviousAnswer && answers.q2
                        ? `You mentioned ${[].concat(answers.q2).join(' and ').toLowerCase()}. ${step.text}`
                        : step.text}
                    </p>
                    {audioOn && canRead && (
                      <button
                        type="button"
                        onClick={() => readAloud.speak(step.id, spokenFor(step))}
                        aria-label="Read this question again"
                        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                          readAloud.speakingId === step.id
                            ? 'bg-brand/15 text-brand'
                            : 'text-text-muted hover:bg-surface-2 hover:text-text'
                        }`}
                      >
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {voiceOn && canListen && (
                    <VoiceAnswerControl voice={voice} heard={heard} onDismissHeard={() => setHeard(null)} />
                  )}

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
                  entries={entries}
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

/**
 * Answering by voice.
 *
 * The transcript is shown back before anything is recorded when VOCE could not
 * place it. Silently doing nothing after someone has spoken is the worst of the
 * three outcomes — worse than a wrong guess, because there is nothing to correct.
 */
function VoiceAnswerControl({ voice, heard, onDismissHeard }) {
  return (
    <div>
      <button
        type="button"
        onClick={voice.listening ? voice.stop : voice.start}
        aria-pressed={voice.listening}
        className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          voice.listening
            ? 'border-brand bg-brand text-white'
            : 'border-border bg-surface text-text-muted hover:border-brand/45 hover:text-brand'
        }`}
      >
        {voice.listening ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Mic className="h-4 w-4" aria-hidden="true" />
        )}
        {voice.listening ? 'Listening — say your answer' : 'Answer out loud'}
      </button>

      {voice.error && (
        <p role="status" className="mt-1.5 text-[12px] text-critical">
          {voice.error}
        </p>
      )}

      {heard && !heard.matched && (
        <div role="status" className="mt-1.5 rounded-lg border border-warning/30 bg-warning/[0.07] px-2.5 py-2">
          <p className="text-[12px] leading-relaxed text-text">
            I heard “{heard.transcript}”, but I could not match it to one of the answers above. Try
            again, or choose one yourself.
          </p>
          <button
            type="button"
            onClick={onDismissHeard}
            className="mt-1 rounded px-1 text-[11.5px] font-semibold text-brand hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function IntroCard({ onStart, onWebForm }) {
  const { intro } = clarifications;
  // The accessibility sentence describes the controls this browser will actually
  // show. It used to promise audio and voice unconditionally, while both toggles
  // are hidden where the API is missing — so on Firefox it named two switches
  // that were not on the screen.
  const canRead = speechSupported();
  const canListen = voiceInputSupported();
  const variant = canRead && canListen ? 'both' : canRead ? 'readAloud' : canListen ? 'voice' : 'none';

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h1 className="text-[19px] font-bold leading-snug text-text">{intro.title}</h1>
      <p className="mt-1.5 text-[12px] font-medium text-text-muted">{intro.meta}</p>
      <p className="mt-3 text-[14px] leading-relaxed text-text">
        {intro.body} {intro.accessibility[variant]}
      </p>

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
function Entry({ entry, onEdit }) {
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
          <InterpretationRow
            answer={entry.shown}
            aiNote={entry.aiNote}
            interpretation={entry.interpretation}
            onEdit={onEdit}
          />
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

