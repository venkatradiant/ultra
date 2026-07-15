import pres from '../../../../../data/ussfcu/ceo/presentation.json';
import { askProps } from '../askAbout';

const OPT_SEEDS = ['res_opt1', 'res_opt2', 'res_opt3'];

export default function SlideResolution({ active }) {
  const s = pres.slides.resolution;
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
        <div {...askProps('res_combo', 'rnote')}><span className="i">i</span>{s.note2}</div>
      </div>
    </section>
  );
}
