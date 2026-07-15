import { useEffect, useRef } from 'react';
import { tierFor, colorFor } from '../../../../utils/confidence';

// Bottom-sheet chat surface for Presentation Mode. Presentational only —
// PresentationMode owns the conversation state and the resolver. Mirrors
// DeckLineageOverlay's structural conventions (capture-phase Escape +
// stopPropagation so the deck-level Escape doesn't also fire; sibling of the
// scaled .stage; scoped .pm-chat-* classes).
const SLIDE_LABELS = {
  situational: 'Situational Overview',
  evidence: 'What Is Happening',
  trajectory: 'Where It Heads',
  assurance: 'Data Trust & Lineage',
  members: 'Members & Mission',
  resolution: 'Resolution Options',
  nextSteps: 'Leadership Next Steps',
};

export default function PresentationChatSheet({ open, onClose, slideId, messages, isTyping, chips, onChip }) {
  const threadRef = useRef(null);

  // Escape closes the sheet, not the whole deck.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, isTyping, open]);

  if (!open) return null;
  const label = SLIDE_LABELS[slideId] || 'Executive Briefing';

  return (
    <>
      <div className="pm-chat-scrim" onClick={onClose} />
      <div className="pm-chat-sheet" role="dialog" aria-label="Ask AI about this briefing">
        <div className="pm-chat-head">
          <span className="pm-chat-ctx">Viewing · {label}</span>
          <span className="pm-chat-title">Ask AI about this briefing</span>
          <button type="button" className="pm-chat-x" onClick={onClose} aria-label="Close chat">&#10005;</button>
        </div>

        <div className="pm-chat-thread" ref={threadRef}>
          {messages.map((m) => (
            m.role === 'user' ? (
              <div key={m.id} className="pm-chat-row user">
                <div className="pm-chat-bubble user">{m.text}</div>
              </div>
            ) : (
              <div key={m.id} className="pm-chat-row ai">
                <div className="pm-chat-bubble ai">
                  <p className="pm-chat-text">{m.text}</p>
                  {(m.sources?.length || m.confidence != null) ? (
                    <div className="pm-chat-meta">
                      {(m.sources || []).map((s) => <span key={s} className="pm-chat-src">{s}</span>)}
                      {m.confidence != null ? (
                        <span className="pm-chat-conf" style={{ color: colorFor(tierFor(m.confidence)) }}>{m.confidence}% confidence</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            )
          ))}
          {isTyping ? (
            <div className="pm-chat-row ai">
              <div className="pm-chat-bubble ai typing"><span /><span /><span /></div>
            </div>
          ) : null}
        </div>

        {chips?.length && !isTyping ? (
          <div className="pm-chat-chips">
            {chips.map((c) => (
              <button key={c} type="button" className="pm-chat-chip" onClick={() => onChip(c)}>{c}</button>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
