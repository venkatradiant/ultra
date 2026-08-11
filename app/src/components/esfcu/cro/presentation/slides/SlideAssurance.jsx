import pres from '../../../../../data/esfcu/cro/presentation.json';
import CroDataTrustStrip from '../../CroDataTrustStrip';
import { useDeck } from '../../../shared/presentation/deckContext';

// Slide 5 — assurance. The SAME trust-strip component and the SAME
// trustStrip.json as Conversation Mode, rendered as the full-width board
// ribbon, so the deck and the workspace can never disagree about the coverage
// gap. The ribbon's coverage tile opens the deck lineage overlay, which lives
// at deck level so it renders full-size rather than inside the scaled stage.
export default function SlideAssurance({ active }) {
  const { askProps, openLineage } = useDeck();
  const s = pres.slides.assurance;
  return (
    <section className={`slide navyd${active ? ' active' : ''}`}>
      <div className="shead">
        <div><div className="eyebrow">{s.eyebrow}</div><h2 style={{ marginTop: 14 }}>{s.title}</h2></div>
      </div>
      <p {...askProps('assur_pending', 'assur-lead')}>{s.lead}</p>
      <div className="sbody" style={{ justifyContent: 'flex-start' }}>
        <CroDataTrustStrip variant="ribbon" onTrace={openLineage} />
      </div>
    </section>
  );
}
