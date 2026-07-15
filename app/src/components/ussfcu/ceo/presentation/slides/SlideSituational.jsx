import pres from '../../../../../data/ussfcu/ceo/presentation.json';
import DeckPhoto from './DeckPhoto';
import { askProps } from '../askAbout';

const TILE_SEEDS = ['sit_l2s', 'sit_growth', 'sit_pipeline'];

const COVER_PHOTO = 'https://cdn.firstbranchcms.com/kcms-structure/e7c78b11-3100-4433-b74f-4d14cd601b4c/image.jpeg';

export default function SlideSituational({ active }) {
  const s = pres.slides.situational;
  return (
    <section className={`slide navy s1${active ? ' active' : ''}`}>
      <div className="covergrid">
        <div className="coverL">
          <div className="cover-logo">
            <img src="/ussfcu-seal.png" alt="United States Senate Federal Credit Union" />
            <span className="cl-txt"><b>United States Senate</b><span>Federal Credit Union</span></span>
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
          <DeckPhoto className="cphoto" src={COVER_PHOTO} alt="USSFCU member family" caption={pres.meta.photoCaption} capClass="ccap" />
        </div>
      </div>
    </section>
  );
}
