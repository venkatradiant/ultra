import pres from '../../../../../data/esfcu/ceo/presentation.json';
import { askProps, askAbout } from '../askAbout';

const ROW_SEEDS = ['ev_loans', 'ev_shares', 'ev_liquidity'];

// Slide 2 — the issue. Three converged figures resolving to one governed
// loan-to-share ratio, beside the eight-quarter trend that IS the story.
//
// The trend polyline is computed from the JSON rather than hand-plotted, so the
// drawing can never drift from the numbers the rest of the demo quotes.
const W = 380;
const H = 200;
const PAD = { l: 46, r: 22, t: 26, b: 34 };

function plot(series) {
  const vals = series.map((p) => p.v);
  const min = Math.min(...vals) - 1.2;
  const max = Math.max(...vals) + 1.2;
  const x = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / Math.max(1, series.length - 1);
  const y = (v) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);
  return { x, y, points: series.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ') };
}

export default function SlideEvidence({ active }) {
  const s = pres.slides.evidence;
  const { x, y, points } = plot(s.trend);
  const lastIdx = s.trend.length - 1;

  return (
    <section className={`slide paper${active ? ' active' : ''}`}>
      <div className="shead">
        <div><div className="eyebrow dark">{s.eyebrow}</div><hr className="kline" /></div>
        <div className="note">{s.note}</div>
      </div>
      <div className="sbody">
        <div className="ev">
          <div>
            <div className="recon">
              {s.rows.map((r, i) => (
                <div key={r.rs} {...askProps(ROW_SEEDS[i], 'rrow')}>
                  <span className="rs">{r.rs}</span>
                  <span className="rv">{r.rv}</span>
                  <span className={`rg ${r.tone}`}>{r.rg}</span>
                </div>
              ))}
              <div {...askProps('ev_l2s', 'rresult')}>
                <div className="rk">{s.result.k}</div>
                <div>
                  <div className="rl">{s.result.l}</div>
                  <div style={{ fontSize: '12.5px', color: '#7fd3a6', fontWeight: 600, marginTop: 3 }}>{s.result.conf}</div>
                </div>
              </div>
            </div>
            <div className="lin">
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Lineage:</span>
              {s.lineage.map((node, i) => (
                <span key={node} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="lchip">{node}</span>
                  {i < s.lineage.length - 1 ? <span className="larrow">&rarr;</span> : null}
                </span>
              ))}
            </div>
          </div>
          <div {...askProps('ev_trend', 'trendcard')}>
            <h3>{s.trendTitle}</h3>
            <svg
              width="100%"
              height="220"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={s.trendAria}
            >
              <line x1={PAD.l - 6} y1={H - PAD.b} x2={W - 10} y2={H - PAD.b} stroke="#E4DED2" />
              <polyline points={points} fill="none" stroke="#003768" strokeWidth="3" strokeLinejoin="round" />
              <circle cx={x(lastIdx)} cy={y(s.trend[lastIdx].v)} r="6" fill="#C98A32" stroke="#fff" strokeWidth="2" />
              <g className="t" fontSize="12" fill="#5E6E7C">
                <text x={x(0) - 12} y={H - 12}>{s.trend[0].q}</text>
                <text x={x(lastIdx) - 30} y={H - 12}>{s.trend[lastIdx].q}</text>
              </g>
              <text
                x={x(lastIdx) - 96}
                y={y(s.trend[lastIdx].v) - 12}
                className="t"
                fontSize="12"
                fontWeight="600"
                fill="#8a6d1f"
              >
                {s.trendAnnotation}
              </text>
            </svg>
            <div className="csrc">
              <span>{s.source}</span>
              <span
                className="conf pm-ask"
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); askAbout('ev_trace'); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); askAbout('ev_trace'); } }}
              ><span className="dot" />Traceable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
