import pres from '../../../../../data/esfcu/ceo/presentation.json';
import DeckPhoto from './DeckPhoto';
import { askProps } from '../askAbout';

const TILE_SEEDS = ['sit_assets', 'sit_members', 'sit_capital'];

// Girado Smith's own portrait, from ESFCU's President/CEO page. Served from
// /public rather than hotlinked off esfcu.org so the deck still renders in a
// boardroom with no network — and so the client's CDN is not carrying load for
// our demo.
const COVER_PHOTO = '/esfcu/ceo-portrait.webp';

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
            alt="Girado Smith, CPA — President and Chief Executive Officer, Educational Systems Federal Credit Union"
            caption={pres.meta.photoCaption}
            capClass="ccap"
          />
        </div>
      </div>
    </section>
  );
}
