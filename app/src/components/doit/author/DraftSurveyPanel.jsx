import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react';
import DoitCard from '../shared/DoitCard';
import { AlertBanner, ConfidenceBadge, StandardsStatusBar, StatusBadge } from '../shared/TrustBits';
import { setDraftQuestions, useAuthorState } from '../shared/authorState';
import {
  DRAFT_QUESTION_TYPES,
  SURVEY_2,
  TYPE_DEFAULTS,
  generateOptions,
  isQuestionComplete,
} from '../../../data/doit/_shared/constants';

/**
 * The Permit Renewal Feedback draft — the author's real working surface.
 *
 * Everything here is editable because the claim VOCE is making is that AI
 * assistance does not mean AI authorship: it flags Q5 as hard to read and
 * offers two rewrites, it proposes Q7's missing options, and it recomputes
 * readiness live — but the author changes the words.
 *
 * The questions live in `authorState`, not in this component. They used to be
 * local `useState`, which meant every edit died when the conversation moved past
 * this turn, and the resident preview — having nothing to read — showed one
 * hardcoded question regardless of what had just been written.
 *
 * The completion count is derived from the questions themselves rather than
 * stored, so the blocker banner cannot claim "ready" while a question is still
 * empty. Question NUMBERS are derived from position for the same reason: adding
 * or removing a question renumbers everything below it, and a stored number
 * would drift.
 */

let newQuestionSeq = 0;

export default function DraftSurveyPanel() {
  const { draftQuestions: questions } = useAuthorState();
  const [expanded, setExpanded] = useState(() => new Set(['q7']));
  const [q5Dismissed, setQ5Dismissed] = useState(false);
  const [q5Choice, setQ5Choice] = useState(null);
  const [editing, setEditing] = useState(null); // { kind: 'text'|'option', id, idx }
  const [draft, setDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const completeCount = questions.filter(isQuestionComplete).length;
  const blockedCount = questions.length - completeCount;
  const ready = blockedCount === 0;
  const allExpanded = expanded.size === questions.length;

  const patch = (id, next) =>
    setDraftQuestions(questions.map((q) => (q.id === id ? { ...q, ...next } : q)));

  const setOptionsFor = (id, options) => {
    patch(id, { options: [...options] });
    setExpanded((s) => new Set([...s, id]));
  };

  const changeType = (id, type) => {
    const defaults = TYPE_DEFAULTS[type];
    patch(id, { type, options: defaults === null ? null : [...defaults] });
  };

  /** Append a question, opened and already in edit mode so it is never blank-but-silent. */
  const addQuestion = () => {
    const id = `qn-${++newQuestionSeq}`;
    setDraftQuestions([
      ...questions,
      { id, text: 'New question', type: 'Single-select', options: [...TYPE_DEFAULTS['Single-select']] },
    ]);
    setExpanded((s) => new Set([...s, id]));
    setEditing({ kind: 'text', id, idx: null });
    setDraft('New question');
  };

  const removeQuestion = (id) => {
    setDraftQuestions(questions.filter((q) => q.id !== id));
    setExpanded((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
    setConfirmDelete(null);
  };

  /** Move a question one place. Position IS the number, so this renumbers too. */
  const move = (id, delta) => {
    const idx = questions.findIndex((q) => q.id === id);
    const target = idx + delta;
    if (idx === -1 || target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[idx], next[target]] = [next[target], next[idx]];
    setDraftQuestions(next);
  };

  const toggle = (id) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const startEdit = (kind, id, idx, value) => {
    setEditing({ kind, id, idx });
    setDraft(value);
  };

  const commitEdit = () => {
    if (!editing) return;
    const value = draft.trim();
    if (value) {
      if (editing.kind === 'text') patch(editing.id, { text: value });
      else {
        const q = questions.find((x) => x.id === editing.id);
        const options = [...q.options];
        options[editing.idx] = value;
        patch(editing.id, { options });
      }
    }
    setEditing(null);
  };

  const isEditing = (kind, id, idx) =>
    editing?.kind === kind && editing.id === id && (kind === 'text' || editing.idx === idx);

  return (
    <DoitCard
      eyebrow="Draft survey"
      title={SURVEY_2.name}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StandardsStatusBar>
            All question types generate accessible markup in every delivery format.
          </StandardsStatusBar>
          <ConfidenceBadge score={91} />
        </div>
      }
    >
      <div className="mb-3">
        {ready ? (
          <AlertBanner variant="success" title="Ready to publish">
            All {questions.length} questions are complete. Nothing is blocking the send.
          </AlertBanner>
        ) : (
          <AlertBanner
            variant="warning"
            title={`${blockedCount} question${blockedCount === 1 ? '' : 's'} still blocking`}
          >
            A question with no answer options cannot be answered. I can suggest a set, or you can
            tell me what kind you want.
          </AlertBanner>
        )}
      </div>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-text">
          <span className="text-brand">{completeCount}</span> of {questions.length} complete
        </p>
        <button
          type="button"
          onClick={() => setExpanded(allExpanded ? new Set() : new Set(questions.map((q) => q.id)))}
          className="rounded-md px-2 py-1 text-[11.5px] font-semibold text-brand hover:bg-brand/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
        {questions.map((q, index) => {
          const open = expanded.has(q.id);
          const complete = isQuestionComplete(q);
          const num = index + 1;
          return (
            <li key={q.id} className="px-3 py-2.5">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-surface-2 text-[10.5px] font-bold text-text-muted">
                  {num}
                </span>
                <div className="min-w-0 flex-1">
                  {isEditing('text', q.id) ? (
                    <InlineEdit
                      value={draft}
                      onChange={setDraft}
                      onCommit={commitEdit}
                      onCancel={() => setEditing(null)}
                      label={`Question ${num} text`}
                    />
                  ) : (
                    // The pencil is the point: the text was always click-to-edit,
                    // but with no affordance the panel read as "options only".
                    <button
                      type="button"
                      onClick={() => startEdit('text', q.id, null, q.text)}
                      className="group flex w-full items-start gap-1.5 rounded text-left text-[12.5px] leading-snug text-text hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <span className="min-w-0 flex-1 border-b border-dashed border-transparent group-hover:border-brand/40">
                        {q.text}
                      </span>
                      <Pencil
                        className="mt-[3px] h-3 w-3 flex-shrink-0 text-text-subtle opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Edit question {num}</span>
                    </button>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10.5px] text-text-subtle">{q.type}</span>
                    {q.aiNote && (
                      <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info">
                        {q.aiNote}
                      </span>
                    )}
                    {!complete && <StatusBadge label="Needs options" variant="blocked" />}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  <IconButton
                    onClick={() => move(q.id, -1)}
                    disabled={index === 0}
                    label={`Move question ${num} up`}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton
                    onClick={() => move(q.id, 1)}
                    disabled={index === questions.length - 1}
                    label={`Move question ${num} down`}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton
                    onClick={() => setConfirmDelete(q.id)}
                    label={`Remove question ${num}`}
                    danger
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton
                    onClick={() => toggle(q.id)}
                    expanded={open}
                    label={`${open ? 'Collapse' : 'Expand'} question ${num}`}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </IconButton>
                </div>
              </div>

              {confirmDelete === q.id && (
                <ConfirmDelete
                  num={num}
                  onConfirm={() => removeQuestion(q.id)}
                  onCancel={() => setConfirmDelete(null)}
                />
              )}

              {open && (
                <div className="mt-2.5 space-y-2.5 border-t border-border-subtle pt-2.5 pl-7">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
                      Question type
                    </span>
                    <select
                      value={q.type}
                      onChange={(e) => changeType(q.id, e.target.value)}
                      className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[12px] text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
                    >
                      {DRAFT_QUESTION_TYPES.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </label>

                  {q.options === null ? (
                    <p className="text-[12px] italic text-text-muted">
                      Open text — the resident types their answer.
                    </p>
                  ) : (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
                        Answer options
                      </p>
                      {q.options.length === 0 && (
                        <OptionsWizard
                          questionId={q.id}
                          showSuggested={q.id === 'q7'}
                          onUseSuggested={() => setOptionsFor(q.id, SURVEY_2.q7SuggestedOptions)}
                          onGenerated={(options) => setOptionsFor(q.id, options)}
                        />
                      )}
                      <ul className="space-y-1">
                        {q.options.map((option, idx) => (
                          <li key={`${q.id}-${idx}`} className="flex items-center gap-1.5">
                            {isEditing('option', q.id, idx) ? (
                              <InlineEdit
                                value={draft}
                                onChange={setDraft}
                                onCommit={commitEdit}
                                onCancel={() => setEditing(null)}
                                label={`Option ${idx + 1}`}
                              />
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEdit('option', q.id, idx, option)}
                                  className="min-w-0 flex-1 rounded border border-border-subtle bg-surface-2 px-2 py-1 text-left text-[12px] text-text hover:border-brand/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
                                >
                                  {option}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => patch(q.id, { options: q.options.filter((_, i) => i !== idx) })}
                                  aria-label={`Remove option “${option}”`}
                                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-text-subtle hover:bg-critical/10 hover:text-critical focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => patch(q.id, { options: [...q.options, `Option ${q.options.length + 1}`] })}
                        className="mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11.5px] font-semibold text-brand hover:bg-brand/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add option
                      </button>
                    </div>
                  )}

                  {q.id === 'q5' && !q5Dismissed && (
                    <Q5PlainLanguage
                      chosen={q5Choice}
                      onChoose={(text, idx) => {
                        patch('q5', { text });
                        setQ5Choice(idx);
                        setQ5Dismissed(true);
                      }}
                      onDismiss={() => setQ5Dismissed(true)}
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={addQuestion}
        className="mt-2 inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-brand/30 px-2.5 text-[11.5px] font-semibold text-brand hover:bg-brand/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add question
      </button>
    </DoitCard>
  );
}

/** The small square controls on a question row. */
function IconButton({ onClick, disabled, label, expanded, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-expanded={expanded}
      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-text-subtle disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        danger
          ? 'enabled:hover:bg-critical/10 enabled:hover:text-critical'
          : 'enabled:hover:bg-surface-2 enabled:hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

/** Removing a question is destructive and unlabelled buttons are easy to hit. */
function ConfirmDelete({ num, onConfirm, onCancel }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-critical/30 bg-critical/[0.06] px-2.5 py-2">
      <p className="min-w-0 flex-1 text-[11.5px] text-text">Remove question {num} from the draft?</p>
      <button
        type="button"
        onClick={onConfirm}
        className="min-h-[28px] rounded-md bg-critical px-2.5 text-[11px] font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Remove
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="min-h-[28px] rounded-md border border-border px-2.5 text-[11px] font-semibold text-text-muted hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Keep it
      </button>
    </div>
  );
}

function InlineEdit({ value, onChange, onCommit, onCancel, label }) {
  const inputRef = useRef(null);

  // Focus follows the click that opened this field. Imperative rather than the
  // autoFocus attribute, which jsx-a11y flags on sight.
  useEffect(() => {
    inputRef.current?.select();
  }, []);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onCommit();
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={onCommit}
        aria-label={label}
        className="min-w-0 flex-1 rounded border border-brand/45 bg-surface px-2 py-1 text-[12px] text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
      />
    </div>
  );
}

/**
 * Finishing a question that has no options.
 *
 * The author DESCRIBES the kind of options they want and VOCE writes them — it
 * does not ask the author to type the options themselves. That was the previous
 * design and it inverted the product's own claim: a comma-separated text field
 * is a worse text field, not AI assistance.
 *
 * The generated set is shown for review before it is accepted, with the name of
 * the scale VOCE picked, so the author can see what it understood and try again
 * rather than discovering the mismatch in the preview.
 */
function OptionsWizard({ questionId, showSuggested, onUseSuggested, onGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);

  const generate = () => {
    if (!prompt.trim()) return;
    setResult(generateOptions(prompt));
  };

  return (
    <div className="mb-2 rounded-lg border border-brand/20 bg-brand/[0.05] p-2.5">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-brand">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> This question has no answer options yet
      </p>

      {showSuggested && (
        <div className="mb-2.5 border-b border-brand/15 pb-2.5">
          <p className="mb-1.5 text-[11px] text-text-muted">
            Matched to your Q1 2025 permit survey, so the scale stays consistent:
          </p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SURVEY_2.q7SuggestedOptions.map((option) => (
              <span key={option} className="rounded border border-brand/20 bg-surface px-2 py-0.5 text-[11px] font-medium text-brand">
                {option}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onUseSuggested}
            className="min-h-[32px] rounded-md bg-brand px-2.5 text-[11.5px] font-semibold text-white hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Use these four
          </button>
        </div>
      )}

      <label className="mb-1 block text-[11px] text-text-muted" htmlFor={`describe-${questionId}`}>
        Or tell me what kind of options you want and I will write them:
      </label>
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          id={`describe-${questionId}`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              generate();
            }
          }}
          placeholder="e.g. a four-point ease scale"
          className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-[11.5px] text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        />
        <button
          type="button"
          onClick={generate}
          disabled={!prompt.trim()}
          className="min-h-[32px] rounded-md border border-brand/40 px-2.5 text-[11.5px] font-semibold text-brand enabled:hover:bg-brand/[0.08] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Generate options
        </button>
      </div>

      {result && (
        <div className="mt-2 rounded-md border border-border-subtle bg-surface p-2.5">
          <p className="mb-1.5 text-[11px] text-text-muted">
            I read that as <span className="font-semibold text-text">{result.recipe.label.toLowerCase()}</span>:
          </p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {result.options.map((option) => (
              <span key={option} className="rounded border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text">
                {option}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onGenerated(result.options)}
              className="min-h-[32px] rounded-md bg-brand px-2.5 text-[11.5px] font-semibold text-white hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Use these
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="min-h-[32px] rounded-md border border-border px-2.5 text-[11.5px] font-semibold text-text-muted hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Describe it differently
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** VOCE flags a question as hard to read and offers alternatives. */
function Q5PlainLanguage({ chosen, onChoose, onDismiss }) {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/[0.07] p-2.5">
      <p className="mb-1 flex items-center gap-1.5 text-[11.5px] font-semibold text-warning">
        <Wand2 className="h-3.5 w-3.5" aria-hidden="true" /> Plain-language suggestion
      </p>
      <p className="mb-2 text-[11.5px] leading-relaxed text-text-muted">
        This reads at about grade 11. Resident-facing questions should sit at grade 8 or below. Two
        shorter versions that keep the meaning:
      </p>
      <div className="space-y-1.5">
        {SURVEY_2.q5Rewrites.map((rewrite, idx) => (
          <button
            key={rewrite}
            type="button"
            onClick={() => onChoose(rewrite, idx)}
            aria-pressed={chosen === idx}
            className="block w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-left text-[12px] text-text hover:border-brand/45 hover:bg-brand/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
          >
            {rewrite}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-1.5 rounded px-1.5 py-1 text-[11px] font-semibold text-text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Keep the original
      </button>
    </div>
  );
}
