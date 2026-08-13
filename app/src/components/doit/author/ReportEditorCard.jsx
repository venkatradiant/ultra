import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import DoitCard from '../shared/DoitCard';
import { AiDisclaimer, ConfidenceBadge } from '../shared/TrustBits';
import { useAuthorState, setAuthorState } from '../shared/authorState';
import { methodologyLine } from '../../../data/doit/_shared/constants';

/**
 * The one-page summary for the author's manager.
 *
 * Subject and headline are click-to-edit: the draft is a starting point the
 * human owns, not an output they rubber-stamp. The methodology line is NOT
 * editable and NOT a literal — it is templated from the same cleaning selection
 * the author made two turns ago, so the report can never quote a response count
 * the cards above it disagree with.
 */
export default function ReportEditorCard() {
  const { cleaning, reportSubject, reportHeadline } = useAuthorState();

  return (
    <DoitCard
      eyebrow="Report draft — for manager"
      intro="Click the subject or headline to edit before sending."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AiDisclaimer />
          <ConfidenceBadge score={94} />
        </div>
      }
    >
      <div className="rounded-lg border border-border-subtle bg-surface-2 p-3.5">
        <EditableField
          label="Subject"
          value={reportSubject}
          onSave={(v) => setAuthorState({ reportSubject: v })}
        />
        <EditableField
          label="Headline"
          value={reportHeadline}
          onSave={(v) => setAuthorState({ reportHeadline: v })}
        />

        <FieldRow label="Key findings">
          <ol className="list-decimal space-y-1 pl-4 text-[12.5px] leading-relaxed text-text">
            <li>Wait times at in-person centers are the primary driver of dissatisfaction.</li>
            <li>
              The new online portal is causing confusion — the upload flow and session handling are
              cited most.
            </li>
            <li>Staff courtesy remains a strength, rated 4.4 / 5.</li>
          </ol>
        </FieldRow>

        <FieldRow label="Recommended action">
          <p className="text-[12.5px] leading-relaxed text-text">
            Targeted follow-up on in-person wait times and portal UX before the next survey wave.
          </p>
        </FieldRow>

        <FieldRow label="Methodology" last>
          <p className="text-[12.5px] italic leading-relaxed text-text-muted">
            {methodologyLine(cleaning)}
          </p>
        </FieldRow>
      </div>
    </DoitCard>
  );
}

function FieldRow({ label, children, last }) {
  return (
    <div className={last ? '' : 'mb-3 border-b border-border-subtle pb-3'}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
        {label}
      </p>
      {children}
    </div>
  );
}

function EditableField({ label, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  // Focus follows the click that opened the field. Imperative rather than the
  // autoFocus attribute, which jsx-a11y flags and which cannot be made
  // conditional on the field actually being in edit mode.
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next) onSave(next);
    else setDraft(value);
    setEditing(false);
  };

  return (
    <FieldRow label={label}>
      {editing ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setDraft(value);
                setEditing(false);
              }
            }}
            aria-label={`${label} text`}
            className="min-w-0 flex-1 rounded-md border border-brand/40 bg-surface px-2.5 py-1.5 text-[12.5px] text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
          />
          <button
            type="button"
            onClick={commit}
            className="min-h-[32px] rounded-md bg-brand px-3 text-[11.5px] font-semibold text-white hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Done
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          className="group w-full rounded-md border border-dashed border-border px-2 py-1.5 text-left text-[12.5px] leading-relaxed text-text transition-colors hover:border-brand/45 hover:bg-brand/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {value}
          <Pencil className="ml-1.5 inline h-3 w-3 flex-shrink-0 text-text-subtle group-hover:text-brand" aria-hidden="true" />
          <span className="sr-only">Edit {label.toLowerCase()}</span>
        </button>
      )}
    </FieldRow>
  );
}
