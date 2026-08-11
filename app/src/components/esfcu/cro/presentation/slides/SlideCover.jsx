import pres from '../../../../../data/esfcu/cro/presentation.json';
import { useDeck } from '../../../shared/presentation/deckContext';

const TILE_SEEDS = ['cov_loss', 'cov_cases', 'cov_coverage'];

/**
 * Slide 1 — the position, as spec §15a asks: "framed as risk under control".
 *
 * No portrait, unlike the CEO's cover. Renata is a representative persona, and
 * a stock face beside an invented name reads as a real person to anyone
 * skimming — the one claim this deck must never make. The space goes to the
 * three situational figures instead, which is what a risk cover owes anyway.
 */
export default function SlideCover({ active }) {
  const { askProps } = useDeck();
  const s = pres.slides.cover;
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
          <div {...askProps('cov_coverage', 'callout')}>{s.callout}</div>
        </div>
        <div className="coverR">
          <div {...askProps('g_persona', 'cro-cover-note')}>
            <div className="ccn-eyebrow">Prepared for the supervisory committee</div>
            <div className="ccn-body">
              Every figure on the following slides carries its source, its as-of date and a
              confidence marker. The one figure that is not yet safe to cite is shown as such
              rather than averaged away.
            </div>
            <div className="ccn-cap">{pres.meta.photoCaption}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
