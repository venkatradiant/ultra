import pres from '../../../../../data/esfcu/cro/presentation.json';
import { useDeck } from '../../../shared/presentation/deckContext';

/**
 * Slide 3 — exposure: baseline against the modelled response, with the
 * attrition risk called out (spec §15a slide 3).
 *
 * Hand-drawn SVG rather than recharts, like the CEO's trajectory slide. The
 * deck stage is a fixed 1280x720 that is CSS-scaled to the viewport, and a
 * responsive charting library measures its own container — which on a scaled
 * stage is the wrong number, so labels land off their marks, and the PDF export
 * re-measures again at print width. A fixed viewBox scales exactly.
 */
const W = 1160;
const H = 380;
const PAD = { l: 70, r: 40, t: 30, b: 52 };

export default function SlideExposure({ active }) {
  const { askProps, askAbout } = useDeck();
  const s = pres.slides.exposure;
  const pts = s.series;
  const n = pts.length;

  const vals = pts.flatMap((p) => [p.baseline, p.response]);
  const min = Math.min(...vals) - 8;
  const max = Math.max(...vals) + 10;
  const x = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / Math.max(1, n - 1);
  const y = (v) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);
  const line = (key) => pts.map((p, i) => `${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');

  // Everything right of this line is modelled, not observed. Without the
  // divider the two paths read as history, which is the one thing they are not.
  const splitIdx = 1;
  const lastIdx = n - 1;

  return (
    <section className={`slide paper${active ? ' active' : ''}`}>
      <div className="shead">
        <div><div className="eyebrow dark">{s.eyebrow}</div><hr className="kline" /></div>
        <div className="note">{s.note}</div>
      </div>
      <div className="sbody">
        <div {...askProps('exp_avoided', 'chartcard')}>
          <div className="top">
            <h3>{s.chartTitle}</h3>
            <div
              className="conf pm-ask"
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); askAbout('exp_conf'); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); askAbout('exp_conf'); } }}
            ><span className="dot" />{s.confidence}</div>
          </div>
          <svg width="100%" height="380" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={s.aria}>
            <line x1={PAD.l - 10} y1={H - PAD.b} x2={W - 22} y2={H - PAD.b} stroke="#E4DED2" />

            {/* The gap between the two paths IS the decision, so it is shaded. */}
            <polygon
              points={`${line('baseline')} ${pts.slice().reverse().map((p, i) => `${x(lastIdx - i).toFixed(1)},${y(p.response).toFixed(1)}`).join(' ')}`}
              fill="#00897B"
              opacity="0.08"
            />

            <line x1={x(splitIdx)} y1={PAD.t - 8} x2={x(splitIdx)} y2={H - PAD.b} stroke="#C9BFAE" strokeWidth="1.5" strokeDasharray="6 5" />
            <text x={x(splitIdx) + 10} y={PAD.t + 2} className="t" fontSize="12" fill="#7A8A99">projected &rarr;</text>

            <polyline points={line('baseline')} fill="none" stroke="#B0413A" strokeWidth="3" strokeDasharray="7 5" strokeLinejoin="round" />
            <polyline points={line('response')} fill="none" stroke="#00897B" strokeWidth="3" strokeLinejoin="round" />

            {pts.map((p, i) => (
              <g key={p.q}>
                <circle cx={x(i)} cy={y(p.baseline)} r="5" fill="#B0413A" stroke="#fff" strokeWidth="2" />
                <circle cx={x(i)} cy={y(p.response)} r="5" fill="#00897B" stroke="#fff" strokeWidth="2" />
                <text x={x(i) - 24} y={H - 20} className="t" fontSize="13" fill="#5E6E7C">{p.q}</text>
              </g>
            ))}

            <text x={x(lastIdx) - 12} y={y(pts[lastIdx].baseline) - 14} className="t" fontSize="14" fontWeight="600" fill="#B0413A" textAnchor="end">
              baseline
            </text>
            <text x={x(lastIdx) - 12} y={y(pts[lastIdx].response) + 24} className="t" fontSize="14" fontWeight="600" fill="#00897B" textAnchor="end">
              with response · {s.endAnnotation}
            </text>
          </svg>

          <div className="expmarks">
            {s.marks.map((m) => (
              <div key={m.l} className={`expmark ${m.tone}`}>
                <span className="eml">{m.l}</span>
                <span className="emv">{m.v}</span>
                <span className="ems">{m.s}</span>
              </div>
            ))}
          </div>

          <div className="csrc">
            <span>{s.source}</span>
            <span
              className="conf pm-ask"
              style={{ color: 'var(--red)' }}
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); askAbout('exp_attrition'); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); askAbout('exp_attrition'); } }}
            ><span className="dot" style={{ background: 'var(--red)' }} />{s.warning}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
