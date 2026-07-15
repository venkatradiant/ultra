import { useState, useEffect } from 'react';
import lineage from '../../../../data/ussfcu/ceo/lineage.json';

// Deck-native lineage trace, opened from the Assurance slide's Lineage-on-Demand
// widget. Same lineage.json as Conversation Mode; navy/gold board styling.
export default function DeckLineageOverlay({ open, onClose }) {
  const figures = lineage.figures;
  const [activeId, setActiveId] = useState(figures[0].id);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  if (!open) return null;
  const fig = figures.find((f) => f.id === activeId) || figures[0];

  return (
    <div className="pm-lin-backdrop" onClick={onClose}>
      <div className="pm-lin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="pm-lin-head">
          <span className="pm-lin-title">Lineage on demand — source to screen</span>
          <button type="button" className="pm-lin-x" onClick={onClose} aria-label="Close lineage">&#10005;</button>
        </div>
        <div className="pm-lin-body">
          <div className="pm-lin-picker">
            {figures.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`pm-lin-pick${f.id === activeId ? ' on' : ''}`}
                onClick={() => setActiveId(f.id)}
              >
                <span className="pm-lin-pl">{f.label}</span>
                <span className="pm-lin-pv">{f.value}</span>
              </button>
            ))}
          </div>
          <div className="pm-lin-trace">
            <div className="pm-lin-fig">
              <div>
                <div className="pm-lin-fl">{fig.label}</div>
                <div className="pm-lin-fv">{fig.value}</div>
              </div>
              <span className="pm-lin-conf">{fig.confidence}% confidence</span>
            </div>
            <div className="pm-lin-chain">
              {fig.chain.map((node, i) => (
                <div className={`pm-lin-node${i === fig.chain.length - 1 ? ' last' : ''}`} key={`${node.system}-${i}`}>
                  <div className="pm-lin-dot">{i + 1}</div>
                  <div className="pm-lin-nc">
                    <div className="pm-lin-stage">{node.stage}</div>
                    <div className="pm-lin-sys">{node.system}</div>
                    <div className="pm-lin-note">{node.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pm-lin-foot">
              <span>Source: {fig.source} · as of {fig.asOf}</span>
              <span className="pm-lin-ok">Traceable — board &amp; NCUA ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
