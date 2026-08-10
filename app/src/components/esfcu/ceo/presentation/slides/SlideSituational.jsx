import pres from '../../../../../data/esfcu/ceo/presentation.json';
import DeckPhoto from './DeckPhoto';
import { askProps } from '../askAbout';

const TILE_SEEDS = ['sit_assets', 'sit_members', 'sit_capital'];

// No ESFCU member photography is licensed for this build, so the cover leans on
// DeckPhoto's duotone-navy fallback rather than borrowing an image from the
// public site. Point `src` at a brand-kit asset when one is supplied.
const COVER_PHOTO = null;

export default function SlideSituational({ active }) {
  const s = pres.slides.situational;
  return (
    <section className={`slide navy s1${active ? ' active' : ''}`}>
      <div className="covergrid">
        <div className="coverL">
          <div className="cover-logo">
            <img src="/logos/esfcu-logo.svg" alt="Educational Systems Federal Credit Union" />
            <span className="cl-txt"><b>Educational Systems</b><span>Federal Credit Union</span></span>
          </div>
          <div className="eyebrow">{s.eyebrow}</div>
          <div className="sev" style={{ marginTop: 14 }}><span className="d" />{s.severity}</div>
          <h1>{s.title} <em>{s.titleEm}</em></h1>
          <div className="sub">{s.subtitle}</div>
          <div className="stiles">
            {s.tiles.map((t, i) => (
              <div key={t.l} {...askProps(TILE_SEEDS[i], 'stile')}>
                <div className="l">{t.l}</div>
                <div className="k">{t.k}</div>
                <div className="s">{t.s}</div>
              </div>
            ))}
          </div>
          <div {...askProps('sit_why', 'callout')}>{s.callout}</div>
        </div>
        <div className="coverR">
          <DeckPhoto
            className="cphoto"
            src={COVER_PHOTO}
            alt="Educational Systems Federal Credit Union — serving Maryland's education community"
            caption={pres.meta.photoCaption}
            capClass="ccap"
          />
        </div>
      </div>
    </section>
  );
}
