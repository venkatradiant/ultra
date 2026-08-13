import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react';
import DoitCard from '../shared/DoitCard';
import { AlertBanner, ConfidenceBadge, StandardsStatusBar, StatusBadge } from '../shared/TrustBits';
import { setAuthorState } from '../shared/authorState';
import { SURVEY_2 } from '../../../data/doit/_shared/constants';

/**
 * The Permit Renewal Feedback draft — the author's real working surface.
 *
 * Everything here is editable because the claim VOCE is making is that AI
 * assistance does not mean AI authorship: it flags Q5 as hard to read and
 * offers two rewrites, it proposes Q7's missing options, and it recomputes
 * readiness live — but the author changes the words.
 *
 * The completion count is derived from the questions themselves rather than
 * stored, so the blocker banner cannot claim "ready" while a question is still
 * empty.
 */

const TYPE_DEFAULTS = {
  'Scale (1–5)': ['1 — Very dissatisfied', '2 — Dissatisfied', '3 — Neutral', '4 — Satisfied', '5 — Very satisfied'],
  'Likert (5-point agreement)': ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree'],
  'Yes / No': ['Yes', 'No'],
  'Multi-select': ['Option A', 'Option B', 'Option C'],
  'Multi-select (adaptive)': ['Option A', 'Option B', 'Option C'],
  'Single-select': ['Option A', 'Option B', 'Option C', 'Option D'],
  'Open text': null,
};
const TYPE_NAMES = Object.keys(TYPE_DEFAULTS);

const INITIAL_QUESTIONS = [
  { id: 'q1', num: 1, text: 'Overall, how satisfied were you with the permit renewal process?', type: 'Scale (1–5)', options: TYPE_DEFAULTS['Scale (1–5)'] },
  { id: 'q2', num: 2, text: 'How did you submit your renewal this time?', type: 'Single-select', options: ['Online portal', 'By mail', 'In person at a service center', 'By phone'] },
  { id: 'q3', num: 3, text: 'Did you encounter any problems during the renewal?', type: 'Yes / No', options: ['Yes', 'No'] },
  { id: 'q4', num: 4, text: 'If yes, what type of problem did you encounter?', type: 'Multi-select (adaptive)', aiNote: 'Shown only if Q3 = Yes', options: ['Website or portal issue', 'Long processing time', 'Missing or incorrect instructions', 'Payment problem', 'Other'] },
  { id: 'q5', num: 5, text: 'About how long did the renewal process take from start to finish?', type: 'Single-select', options: ['Less than 30 minutes', '30 minutes to 2 hours', '2–8 hours', 'More than a day', 'Still in progress'] },
  { id: 'q6', num: 6, text: 'Did you need to contact the office for help at any point?', type: 'Yes / No', options: ['Yes', 'No'] },
  { id: 'q7', num: 7, text: 'How easy was the permit renewal process overall?', type: 'Single-select', options: [] },
  { id: 'q8', num: 8, text: 'What is the one thing we could do to make permit renewal easier?', type: 'Open text', options: null },
  { id: 'q9', num: 9, text: 'Would you recommend renewing online to others?', type: 'Yes / No', options: ['Yes', 'No', 'Not sure'] },
];

const isComplete = (q) => (q.options === null ? true : q.options.length > 0);

export default function DraftSurveyPanel() {
  const [questions, setQuestions] = useState(() =>
    INITIAL_QUESTIONS.map((q) => ({ ...q, options: Array.isArray(q.options) ? [...q.options] : q.options })),
  );
  const [expanded, setExpanded] = useState(() => new Set(['q7']));
  const [q5Dismissed, setQ5Dismissed] = useState(false);
  const [q5Choice, setQ5Choice] = useState(null);
  const [q7Prompt, setQ7Prompt] = useState('');
  const [editing, setEditing] = useState(null); // { kind: 'text'|'option', id, idx }
  const [draft, setDraft] = useState('');

  const completeCount = questions.filter(isComplete).length;
  const ready = completeCount === questions.length;
  const allExpanded = expanded.size === questions.length;

  const patch = (id, next) => setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...next } : q)));

  const setQ7Options = (options) => {
    patch('q7', { options: [...options] });
    setAuthorState({ q7Options: [...options] });
    setExpanded((s) => new Set([...s, 'q7']));
  };

  const changeType = (id, type) => {
    const defaults = TYPE_DEFAULTS[type];
    patch(id, { type, options: defaults === null ? null : [...defaults] });
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
          <AlertBanner variant="warning" title={`${questions.length - completeCount} question still blocking`}>
            Q7 has no answer options — residents cannot respond to it. I can suggest a scale, or you can
            write your own.
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
        {questions.map((q) => {
          const open = expanded.has(q.id);
          const complete = isComplete(q);
          return (
            <li key={q.id} className="px-3 py-2.5">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-surface-2 text-[10.5px] font-bold text-text-muted">
                  {q.num}
                </span>
                <div className="min-w-0 flex-1">
                  {isEditing('text', q.id) ? (
                    <InlineEdit
                      value={draft}
                      onChange={setDraft}
                      onCommit={commitEdit}
                      onCancel={() => setEditing(null)}
                      label={`Question ${q.num} text`}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit('text', q.id, null, q.text)}
                      className="w-full rounded text-left text-[12.5px] leading-snug text-text hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {q.text}
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
                <button
                  type="button"
                  onClick={() => toggle(q.id)}
                  aria-expanded={open}
                  aria-label={`${open ? 'Collapse' : 'Expand'} question ${q.num}`}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-text-subtle hover:bg-surface-2 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              </div>

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
                      {TYPE_NAMES.map((name) => (
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
                      {q.options.length === 0 && q.id === 'q7' && (
                        <Q7Wizard
                          prompt={q7Prompt}
                          onPrompt={setQ7Prompt}
                          onUseSuggested={() => setQ7Options(SURVEY_2.q7SuggestedOptions)}
                          onWriteOwn={() =>
                            setQ7Options(
                              q7Prompt
                                .split(/[,\n]/)
                                .map((s) => s.trim())
                                .filter(Boolean),
                            )
                          }
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
    </DoitCard>
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

/** The two-path fork: take the suggestion, or describe what you want. */
function Q7Wizard({ prompt, onPrompt, onUseSuggested, onWriteOwn }) {
  return (
    <div className="mb-2 rounded-lg border border-brand/20 bg-brand/[0.05] p-2.5">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-brand">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Two ways to finish this question
      </p>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {SURVEY_2.q7SuggestedOptions.map((option) => (
          <span key={option} className="rounded border border-brand/20 bg-surface px-2 py-0.5 text-[11px] font-medium text-brand">
            {option}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onUseSuggested}
          className="min-h-[32px] rounded-md bg-brand px-2.5 text-[11.5px] font-semibold text-white hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Use these four
        </button>
        <input
          value={prompt}
          onChange={(e) => onPrompt(e.target.value)}
          placeholder="…or type your own, separated by commas"
          aria-label="Write your own answer options for Q7"
          className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-[11.5px] text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        />
        <button
          type="button"
          onClick={onWriteOwn}
          disabled={!prompt.trim()}
          className="min-h-[32px] rounded-md border border-border px-2.5 text-[11.5px] font-semibold text-text-muted enabled:hover:bg-surface-2 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Add mine
        </button>
      </div>
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
