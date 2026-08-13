import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import DoitCard from '../shared/DoitCard';
import { AiDisclaimer, ConfidenceBadge } from '../shared/TrustBits';
import { useAdminState, setAdminState } from '../shared/adminState';
import { PLATFORM_COLORS, PORTFOLIO_SURVEYS, REGIONAL_BREAKDOWN } from '../../../data/doit/_shared/constants';

/**
 * The cross-survey brief for leadership.
 *
 * Topic and finding are click-to-edit; the sources line is not, and is assembled
 * from the actual selection rather than typed — a brief that names a response
 * count nobody can reproduce is exactly the thing this product exists to stop.
 */
export default function LeadershipBriefCard() {
  const { selectedSurveys, briefTopic, briefFinding } = useAdminState();
  const inScope = PORTFOLIO_SURVEYS.filter((s) => selectedSurveys.includes(s.id));
  const total = inScope.reduce((sum, s) => sum + s.responses, 0);
  const platforms = [...new Set(inScope.map((s) => s.platform))];
  const outlier = REGIONAL_BREAKDOWN.find((r) => r.outlier);

  return (
    <DoitCard
      eyebrow="Cross-survey brief — for leadership"
      intro="Click the topic or the finding to revise before sending."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AiDisclaimer />
          <ConfidenceBadge score={91} />
        </div>
      }
    >
      <div className="rounded-lg border border-border-subtle bg-surface-2 p-3.5">
        <EditableField label="Topic" value={briefTopic} onSave={(v) => setAdminState({ briefTopic: v })} />
        <EditableField label="Finding" value={briefFinding} onSave={(v) => setAdminState({ briefFinding: v })} />

        <FieldRow label="Sources">
          <p className="text-[12.5px] leading-relaxed text-text">
            {inScope.length} surveys · {total.toLocaleString()} responses ·{' '}
            {platforms.map((p) => (
              <span key={p} className="font-medium" style={{ color: PLATFORM_COLORS[p] }}>
                {p}
                {p === platforms[platforms.length - 1] ? '' : ', '}
              </span>
            ))}
          </p>
        </FieldRow>

        <FieldRow label="Recommended action" last>
          <p className="text-[12.5px] leading-relaxed text-text">
            Prioritise a {outlier.region}-region service-center review before the next survey wave.
          </p>
        </FieldRow>
      </div>
    </DoitCard>
  );
}

function FieldRow({ label, children, last }) {
  return (
    <div className={last ? '' : 'mb-3 border-b border-border-subtle pb-3'}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">{label}</p>
      {children}
    </div>
  );
}

function EditableField({ label, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

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
