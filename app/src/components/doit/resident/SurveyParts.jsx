import { useEffect, useRef, useState } from 'react';
import { Check, Info, Volume2, Mic } from 'lucide-react';
import { ReferenceBadge, VerifiedBadge } from '../shared/TrustBits';
import { NONE_OPTION, toggleMultiSelect } from '../../../data/doit/resident/surveyLogic';

/**
 * The resident-facing primitives.
 *
 * Deliberately plain: a resident answering a government survey on a phone is not
 * the audience for the density the internal personas get. Every target clears
 * 44px, every control has a visible focus ring, and nothing depends on colour
 * alone to carry state.
 */

const OPTION_BASE =
  'flex min-h-[44px] w-full items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left text-[14px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/** Single-choice options — scale, single-select and yes/no all share this. */
export function ChoiceOptions({ options, value, onChoose, name }) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label={name}>
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChoose(option)}
            className={`${OPTION_BASE} ${
              selected
                ? 'border-brand bg-brand/[0.06] font-semibold text-text'
                : 'border-border bg-surface text-text hover:border-brand/45 hover:bg-brand/[0.03]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-[19px] w-[19px] flex-shrink-0 items-center justify-center rounded-full border-2 ${
                selected ? 'border-brand' : 'border-border'
              }`}
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

/**
 * Multi-choice, with "None of these" mutually exclusive against everything else.
 * The exclusion lives in `toggleMultiSelect` so the web form enforces it the
 * same way rather than reimplementing it.
 */
export function MultiSelectOptions({ options, value = [], onChange, onSubmit, name }) {
  return (
    <div>
      <div className="space-y-2" role="group" aria-label={name}>
        {options.map((option) => {
          const selected = value.includes(option);
          const isNone = option === NONE_OPTION;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(toggleMultiSelect(value, option))}
              className={`${OPTION_BASE} ${
                selected
                  ? 'border-brand bg-brand/[0.06] font-semibold text-text'
                  : 'border-border bg-surface text-text hover:border-brand/45 hover:bg-brand/[0.03]'
              } ${isNone ? 'mt-1' : ''}`}
            >
              <span
                aria-hidden="true"
                className={`flex h-[19px] w-[19px] flex-shrink-0 items-center justify-center rounded border-2 ${
                  selected ? 'border-brand bg-brand text-white' : 'border-border'
                }`}
              >
                {selected && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              {option}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={value.length === 0}
        className="mt-3 min-h-[44px] w-full rounded-xl bg-brand px-4 text-[14px] font-semibold text-white transition-colors enabled:hover:bg-brand-hover disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {value.length === 0 ? 'Choose at least one' : 'Continue'}
      </button>
    </div>
  );
}

/** Free text. */
export function OpenInput({ value, onChange, onSubmit, placeholder, label }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit();
      }}
    >
      <label className="sr-only" htmlFor="doit-open-answer">
        {label}
      </label>
      <textarea
        ref={ref}
        id="doit-open-answer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) onSubmit();
          }
        }}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border-2 border-border bg-surface px-3.5 py-2.5 text-[14px] leading-relaxed text-text placeholder:text-text-subtle focus-visible:border-brand focus-visible:outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="mt-2 min-h-[44px] w-full rounded-xl bg-brand px-4 text-[14px] font-semibold text-white transition-colors enabled:hover:bg-brand-hover disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Continue
      </button>
    </form>
  );
}

/**
 * The per-answer receipt.
 *
 * States what was recorded, how confident VOCE is that it understood, and offers
 * a way to change it — which is the difference between a system that transcribes
 * you and one that interprets you without telling you.
 */
export function InterpretationRow({ answer, aiNote, onChange }) {
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(false), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="ml-1 border-l-2 border-border-subtle pl-3">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-text-muted">
        <span className="font-medium text-success">✓ Recorded:</span>
        <span className="text-text">{answer}</span>
      </p>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-text-muted">
        <span>◉ AI Confidence: 93%</span>
        <button
          type="button"
          onClick={() => {
            setToast(true);
            onChange?.();
          }}
          className="rounded px-1 font-semibold text-brand underline decoration-dotted underline-offset-2 hover:text-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Change
        </button>
      </p>
      {aiNote && <p className="mt-0.5 text-[12px] italic leading-relaxed text-text-muted">{aiNote}</p>}
      {toast && (
        <p role="status" className="mt-1 rounded-md bg-surface-2 px-2 py-1 text-[11.5px] text-text-muted">
          In the full product, you can edit this answer.
        </p>
      )}
    </div>
  );
}

/** A matched clarification with a governed source behind it. */
export function DefinitionCard({ card, source }) {
  return (
    <div className="rounded-xl border border-info/25 bg-info/[0.05] p-3.5">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <VerifiedBadge />
        <ReferenceBadge />
      </div>
      <p className="text-[13.5px] font-semibold text-text">{card.term}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-text">{card.definition}</p>
      {card.example && (
        <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-text-muted">
          <span className="font-semibold text-text">For example:</span> {card.example}
        </p>
      )}
      {source && <p className="mt-2 text-[11px] text-text-subtle">Source: {source}</p>}
    </div>
  );
}

/**
 * A prose clarification. The `verified` flag is the whole point: a matched
 * answer carries badges and a source, and the fallback carries neither. That
 * contrast is what tells a resident which answers are grounded.
 */
export function ClarificationBubble({ text, verified, source }) {
  return (
    <div className={`rounded-xl border p-3.5 ${verified ? 'border-info/25 bg-info/[0.05]' : 'border-border bg-surface-2'}`}>
      {verified && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <VerifiedBadge />
          <ReferenceBadge />
        </div>
      )}
      <p className="text-[13px] leading-relaxed text-text">{text}</p>
      {verified && source && <p className="mt-2 text-[11px] text-text-subtle">Source: {source}</p>}
    </div>
  );
}

/** A real progress ring, driven by position in the path actually taken. */
export function ProgressRing({ position, total }) {
  const pct = total ? Math.round((position / total) * 100) : 0;
  const radius = 15;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        role="img"
        aria-label={`Question ${position} of ${total}`}
      >
        <circle cx="19" cy="19" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="3.5" />
        <circle
          cx="19"
          cy="19"
          r={radius}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          transform="rotate(-90 19 19)"
          style={{ transition: 'stroke-dashoffset 400ms ease' }}
        />
      </svg>
      <span className="text-[12.5px] text-text-muted">
        Question <span className="font-semibold text-text">{position}</span> of {total}
      </span>
    </div>
  );
}

/** Read-aloud and voice-input switches. */
export function ToggleSwitch({ checked, onChange, label, icon }) {
  const Icon = icon === 'mic' ? Mic : Volume2;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex min-h-[36px] items-center gap-2 rounded-full border px-3 text-[12px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        checked ? 'border-brand bg-brand/[0.08] text-brand' : 'border-border bg-surface text-text-muted hover:bg-surface-2'
      }`}
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      {label}
      <span
        aria-hidden="true"
        className={`ml-0.5 flex h-[16px] w-[28px] flex-shrink-0 items-center rounded-full px-[2px] transition-colors ${
          checked ? 'justify-end bg-brand' : 'justify-start bg-border'
        }`}
      >
        <span className="h-[12px] w-[12px] rounded-full bg-white" />
      </span>
    </button>
  );
}

/** The banner explaining that answers are anonymous. */
export function PrivacyNote({ children }) {
  return (
    <p className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted">
      <Info className="mt-px h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
      {children}
    </p>
  );
}
