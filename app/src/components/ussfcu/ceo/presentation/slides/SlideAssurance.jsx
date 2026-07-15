import pres from '../../../../../data/ussfcu/ceo/presentation.json';
import DataTrustStrip from '../../DataTrustStrip';

export default function SlideAssurance({ active }) {
  const s = pres.slides.assurance;
  return (
    <section className={`slide navyd${active ? ' active' : ''}`}>
      <div className="shead">
        <div><div className="eyebrow">{s.eyebrow}</div><h2 style={{ marginTop: 14 }}>{s.title}</h2></div>
      </div>
      <p className="assur-lead">{s.lead}</p>
      <div className="sbody" style={{ justifyContent: 'flex-start' }}>
        {/* The same trust-strip component as Conversation Mode, rendered as the
            full-width board ribbon. Single source of truth (trustStrip.json).
            The Lineage-on-Demand widget opens the deck lineage overlay, lifted to
            the deck level (PresentationMode) so it renders full-size, not scaled. */}
        <DataTrustStrip
          variant="ribbon"
          onTrace={() => window.dispatchEvent(new CustomEvent('ussfcu-ceo-deck:open-lineage'))}
        />
      </div>
    </section>
  );
}
