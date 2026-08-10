import { useEffect, useState } from 'react';
import { askAbout } from './askAbout';
import pres from '../../../../data/esfcu/ceo/presentation.json';

// Detail modal for the three recommended Leadership Next Steps. One modal, three
// contents — opens on the clicked step and can switch between all three.
// Dismissing (X / backdrop / Escape) returns to the slide; the "Return to
// briefing home" button exits the whole deck (onReturnHome = the deck's onClose).
// Spec §15a: each recommended action must be "actionable in the real build
// (assign, schedule, or generate a memo)" — "this closes the loop from the AI
// noticing the signal to a human owning the response." The modal used to be
// read-only, so the loop the spec says must close, did not.
//
// Scripted like everything else here: the control acknowledges in place rather
// than pretending to reach a calendar or a mail server it has no connection to.
const ACTIONS = [
  { id: 'assign', label: 'Assign the owner', done: 'Assigned — the owner set now holds this action.' },
  { id: 'schedule', label: 'Schedule it', done: 'Scheduled against the response timeframe above.' },
  { id: 'memo', label: 'Generate the memo', done: 'Memo drafted with the figures and their lineage attached.' },
];

export default function ClosingModal({ open, stepIndex = 0, onDismiss, onReturnHome, onDownload }) {
  const c = pres.closing;
  const [active, setActive] = useState(stepIndex);
  // Keyed by step so acknowledgements do not bleed across the three actions.
  const [taken, setTaken] = useState({});

  // Sync to the clicked step each time the modal opens.
  useEffect(() => { if (open) setActive(stepIndex); }, [open, stepIndex]);
  useEffect(() => { if (!open) setTaken({}); }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onDismiss?.(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onDismiss]);

  if (!open) return null;
  const s = c.steps[active] || c.steps[0];

  return (
    <div className="pm-close-backdrop" onClick={onDismiss}>
      <div className="pm-close-card" role="dialog" aria-modal="true" aria-label="Recommended action" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pm-close-x" onClick={onDismiss} aria-label="Close and return to slide">&#10005;</button>

        {/* Switch between the three recommended actions inside the one modal */}
        <div className="pm-close-tabs">
          {c.steps.map((st, i) => (
            <button
              key={st.title}
              type="button"
              className={`pm-close-tab${i === active ? ' on' : ''}`}
              onClick={() => setActive(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="pm-close-eyebrow">{s.eyebrow}</div>
        <hr className="pm-close-kline" />
        <h2 className="pm-close-title">{s.title}</h2>
        <p className="pm-close-body">{s.body}</p>

        <div className="pm-close-marks">
          {s.marks.map((m) => (
            <div className="pm-close-mark" key={m.l}>
              <span className="pm-close-ml">{m.l}</span>
              <span className="pm-close-mv">{m.v}</span>
            </div>
          ))}
        </div>

        {/* Assign / schedule / memo — the loop-closing controls. */}
        <div className="pm-close-do">
          {ACTIONS.map((a) => {
            const key = `${active}:${a.id}`;
            const isDone = !!taken[key];
            return (
              <button
                key={a.id}
                type="button"
                className={`pm-close-do-btn${isDone ? ' on' : ''}`}
                onClick={() => setTaken((t) => ({ ...t, [key]: true }))}
                aria-pressed={isDone}
              >
                {isDone ? '✓ ' : ''}{a.label}
              </button>
            );
          })}
          <button
            type="button"
            className="pm-close-do-btn ghost"
            onClick={() => askAbout('g_owners')}
          >
            Ask about the owners
          </button>
        </div>
        {ACTIONS.filter((a) => taken[`${active}:${a.id}`]).map((a) => (
          <p key={a.id} className="pm-close-done">{a.done}</p>
        ))}

        <div className="pm-close-actions">
          {onDownload ? (
            <button type="button" className="pm-close-secondary" onClick={onDownload}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
              {c.secondaryCta}
            </button>
          ) : null}
          <button type="button" className="pm-close-primary" onClick={onReturnHome}>
            {c.primaryCta}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>

        <div className="pm-close-signoff">{c.signoff}</div>
      </div>
    </div>
  );
}
