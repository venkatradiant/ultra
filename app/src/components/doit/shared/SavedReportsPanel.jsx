import { useEffect, useRef, useState } from 'react';
import { FileText, Pencil, Send, Trash2 } from 'lucide-react';
import { GovernanceRow, StatusBadge } from './TrustBits';
import { deleteReport, updateReport, useReportsFor } from './reportsState';

/**
 * Everything this persona has saved to their reports.
 *
 * The "Save to my reports" chip used to be a sentence with nothing behind it —
 * no route, no screen, no state anywhere in the app. This is the surface that
 * makes the claim true: the reports are listed, they open, the fields that were
 * editable in the chat are editable here, and they can be sent or thrown away.
 *
 * Reads the persona-keyed store rather than authorState/adminState, because the
 * Author's manager report and the Administrator's leadership brief are different
 * artefacts and neither persona should see the other's drafts.
 */
export default function SavedReportsPanel({ personaId, emptyHint }) {
  const reports = useReportsFor(personaId);
  const [openId, setOpenId] = useState(null);

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <FileText className="mx-auto mb-3 h-8 w-8 text-text-subtle" aria-hidden="true" />
        <p className="text-[13.5px] font-semibold text-text">No saved reports yet</p>
        <p className="mx-auto mt-1 max-w-md text-[12.5px] leading-relaxed text-text-muted">{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reports.map((report) => (
        <li key={report.id} className="rounded-2xl border border-border-subtle bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <StatusBadge
                  label={report.status === 'sent' ? 'Sent' : 'Draft'}
                  variant={report.status === 'sent' ? 'live' : 'generated'}
                />
                <span className="text-[11px] text-text-subtle">{report.savedAt}</span>
              </div>
              <p className="text-[13.5px] font-semibold leading-snug text-text">{report.subject}</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-text-muted">{report.headline}</p>
            </div>
            <div className="flex flex-shrink-0 gap-1.5">
              <SmallButton
                onClick={() => setOpenId(openId === report.id ? null : report.id)}
                expanded={openId === report.id}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                {openId === report.id ? 'Close' : 'Edit'}
              </SmallButton>
              <SmallButton onClick={() => deleteReport(personaId, report.id)} danger>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </SmallButton>
            </div>
          </div>

          {openId === report.id && (
            <div className="mt-3 border-t border-border-subtle pt-3">
              <Field
                label="Subject"
                value={report.subject}
                onSave={(v) => updateReport(personaId, report.id, { subject: v })}
              />
              <Field
                label={report.headlineLabel || 'Headline'}
                value={report.headline}
                multiline
                onSave={(v) => updateReport(personaId, report.id, { headline: v })}
              />

              {report.methodology && (
                <div className="mb-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
                    Methodology
                  </p>
                  {/* Not editable, here or in the chat. It is templated from the
                      cleaning selection so the report can never quote a response
                      count the cards that produced it disagree with. */}
                  <p className="text-[12.5px] italic leading-relaxed text-text-muted">
                    {report.methodology}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <GovernanceRow
                  action={report.status === 'sent' ? 'Sent' : 'Saved'}
                  approvedBy={report.author}
                />
                {report.status !== 'sent' && (
                  <button
                    type="button"
                    onClick={() => updateReport(personaId, report.id, { status: 'sent' })}
                    className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg bg-brand px-3 text-[11.5px] font-semibold text-white hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    {report.sendLabel || 'Send'}
                  </button>
                )}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function SmallButton({ onClick, expanded, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border px-2.5 text-[11.5px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        danger
          ? 'border-border text-text-muted hover:border-critical/40 hover:bg-critical/[0.06] hover:text-critical'
          : 'border-border text-text-muted hover:bg-surface-2 hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

/** Click-to-edit, mirroring ReportEditorCard's affordance in the chat. */
function Field({ label, value, multiline, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);

  // Focus follows the click that opened the field. Imperative rather than the
  // autoFocus attribute, which jsx-a11y flags on sight.
  useEffect(() => {
    if (editing) ref.current?.select();
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next) onSave(next);
    else setDraft(value);
    setEditing(false);
  };

  const Input = multiline ? 'textarea' : 'input';

  return (
    <div className="mb-3">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
        {label}
      </p>
      {editing ? (
        <Input
          ref={ref}
          value={draft}
          rows={multiline ? 3 : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !multiline) commit();
            if (e.key === 'Escape') {
              setDraft(value);
              setEditing(false);
            }
          }}
          aria-label={label}
          className="w-full rounded-md border border-brand/45 bg-surface px-2 py-1.5 text-[12.5px] leading-relaxed text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          className="group flex w-full items-start gap-1.5 rounded text-left text-[12.5px] leading-relaxed text-text hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span className="min-w-0 flex-1 border-b border-dashed border-transparent group-hover:border-brand/40">
            {value}
          </span>
          <Pencil
            className="mt-[3px] h-3 w-3 flex-shrink-0 text-text-subtle opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            aria-hidden="true"
          />
          <span className="sr-only">Edit {label.toLowerCase()}</span>
        </button>
      )}
    </div>
  );
}
