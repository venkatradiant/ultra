import pres from '../../../../../data/esfcu/cro/presentation.json';
import { useDeck } from '../../../shared/presentation/deckContext';

const OPT_SEEDS = ['opt_rec', 'opt_blanket', 'opt_coverage'];

// Slide 6 — three response paths, one recommended, each with the same three
// rated attributes (spec §15a). The ratings are what make this a decision
// rather than a recommendation to rubber-stamp: option 2 contains fastest and
// is still not recommended, and the attribute that says why is visible.
export default function SlideOptions({ active }) {
  const { askProps } = useDeck();
  const s = pres.slides.options;
  return (
    <section className={`slide paper${active ? ' active' : ''}`}>
      <div className="shead">
        <div><div className="eyebrow dark">{s.eyebrow}</div><hr className="kline" /></div>
        <div className="note">{s.note}</div>
      </div>
      <div className="sbody">
        <div className="ropts">
          {s.options.map((o, i) => (
            <div key={o.num} {...askProps(OPT_SEEDS[i], `ropt${o.recommended ? ' rec' : ''}`)}>
              <div className="oh">
                <span className="onum">{o.num}</span>
                {o.recommended ? <span className="recbadge">Recommended</span> : null}
              </div>
              <h4>{o.title}</h4>
              <p>{o.desc}</p>
              {o.attrs.map((a) => (
                <div className="attr" key={a.l}>
                  <span className="al">{a.l}</span>
                  <span className={`av ${a.tone}`}>{a.v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div {...askProps('opt_coverage', 'rnote')}><span className="i">i</span>{s.note2}</div>
      </div>
    </section>
  );
}
