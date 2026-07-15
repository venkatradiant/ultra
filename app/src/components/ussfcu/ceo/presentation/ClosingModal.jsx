import { useEffect, useState } from 'react';
import pres from '../../../../data/ussfcu/ceo/presentation.json';

// Detail modal for the three recommended Leadership Next Steps. One modal, three
// contents — opens on the clicked step and can switch between all three.
// Dismissing (X / backdrop / Escape) returns to the slide; the "Return to
// briefing home" button exits the whole deck (onReturnHome = the deck's onClose).
export default function ClosingModal({ open, stepIndex = 0, onDismiss, onReturnHome, onDownload }) {
  const c = pres.closing;
  const [active, setActive] = useState(stepIndex);

  // Sync to the clicked step each time the modal opens.
  useEffect(() => { if (open) setActive(stepIndex); }, [open, stepIndex]);

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
