import pres from '../../../../../data/esfcu/cro/presentation.json';
import { useDeck } from '../../../shared/presentation/deckContext';

// Slide 2 — the issue: four systems each holding a fragment, converged into one
// count. Same layout as the CEO's evidence slide, because it makes the same
// argument — sources that each tell part of the story, against one governed
// figure — and the deck's rhythm depends on that recognition.
//
// Every coordinate is computed from the JSON so the drawing cannot drift from
// the numbers quoted in Conversation Mode.
const ROW_SEEDS = ['iss_channels', 'iss_channels', 'iss_channels'];

const W = 620;
const H = 220;
const PAD = { l: 40, r: 30, t: 30, b: 40 };

function plot(trend) {
  const n = trend.length;
  const vals = trend.map((p) => p.v);
  const min = Math.min(...vals) - 4;
  const max = Math.max(...vals) + 6;
  const x = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / Math.max(1, n - 1);
  const y = (v) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);
  return { x, y, points: trend.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ') };
}

export default function SlideIssue({ active }) {
  const { askProps, askAbout } = useDeck();
  const s = pres.slides.issue;
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
              <div {...askProps('cov_cases', 'rresult')}>
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
          <div {...askProps('iss_trend', 'trendcard')}>
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
                x={x(lastIdx) - 70}
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
                onClick={(e) => { e.stopPropagation(); askAbout('iss_trace'); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); askAbout('iss_trace'); } }}
              ><span className="dot" />Traceable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
