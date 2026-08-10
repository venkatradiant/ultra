import pres from '../../../../../data/esfcu/ceo/presentation.json';
import { askProps, askAbout } from '../askAbout';

// Slide 3 — performance. The loans-versus-shares exhibit: both balance lines,
// the loan-to-share ratio annotated, and the internal policy ceiling marked with
// the projected breach shaded.
//
// Every coordinate is computed from the JSON so the drawing cannot drift from
// the numbers quoted in Conversation Mode.
const W = 1160;
const H = 410;
const PAD = { l: 92, r: 40, t: 26, b: 52 };

export default function SlideTrajectory({ active }) {
  const s = pres.slides.trajectory;
  const pts = s.series;
  const n = pts.length;

  const x = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / Math.max(1, n - 1);

  // Balances (left scale) — shares and loans share one scale so the widening gap
  // between them is legible as itself, not normalised away.
  const balVals = pts.flatMap((p) => [p.loans, p.shares]);
  const bMin = Math.min(...balVals) - 40;
  const bMax = Math.max(...balVals) + 40;
  const by = (v) => PAD.t + (1 - (v - bMin) / (bMax - bMin)) * (H - PAD.t - PAD.b);

  // Ratio (right scale), with the ceiling on the same scale.
  const rVals = [...pts.map((p) => p.ratio), s.ceiling];
  const rMin = Math.min(...rVals) - 1.5;
  const rMax = Math.max(...rVals) + 1.5;
  const ry = (v) => PAD.t + (1 - (v - rMin) / (rMax - rMin)) * (H - PAD.t - PAD.b);

  const line = (accessor, scale) => pts.map((p, i) => `${x(i).toFixed(1)},${scale(accessor(p)).toFixed(1)}`).join(' ');
  const ceilingY = ry(s.ceiling);
  const lastIdx = n - 1;

  return (
    <section className={`slide paper2${active ? ' active' : ''}`}>
      <div className="shead">
        <div><div className="eyebrow dark">{s.eyebrow}</div><hr className="kline" /></div>
        <div className="note">{s.note}</div>
      </div>
      <div className="sbody">
        <div {...askProps('traj_project', 'chartcard')}>
          <div className="top">
            <h3>{s.chartTitle}</h3>
            <div
              className="conf pm-ask"
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); askAbout('traj_conf'); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); askAbout('traj_conf'); } }}
            ><span className="dot" />{s.confidence}</div>
          </div>
          <svg width="100%" height="410" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={s.aria}>
            <line x1={PAD.l - 10} y1={H - PAD.b} x2={W - 22} y2={H - PAD.b} stroke="#E4DED2" />

            {/* Policy ceiling on the ratio scale, with the headroom above it shaded. */}
            <rect x={PAD.l - 10} y={PAD.t} width={W - PAD.l - PAD.r + 30} height={Math.max(0, ceilingY - PAD.t)} fill="#B0413A" opacity="0.07" />
            <line x1={PAD.l - 10} y1={ceilingY} x2={W - 22} y2={ceilingY} stroke="#B0413A" strokeWidth="1.5" strokeDasharray="6 5" />
            <text x={PAD.l - 4} y={ceilingY - 9} className="t" fontSize="13" fontWeight="600" fill="#B0413A">
              {s.ceiling}% {s.ceilingLabel}
            </text>

            {/* Balances */}
            <polyline points={line((p) => p.shares, by)} fill="none" stroke="#003768" strokeWidth="3" strokeLinejoin="round" />
            <polyline points={line((p) => p.loans, by)} fill="none" stroke="#C98A32" strokeWidth="3" strokeLinejoin="round" />
            <text x={x(lastIdx) - 4} y={by(pts[lastIdx].shares) + 24} className="t" fontSize="13" fontWeight="600" fill="#003768">Shares</text>
            <text x={x(lastIdx) - 4} y={by(pts[lastIdx].loans) - 12} className="t" fontSize="13" fontWeight="600" fill="#8a6d1f">Loans</text>

            {/* Ratio overlay */}
            <polyline points={line((p) => p.ratio, ry)} fill="none" stroke="#B0413A" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />
            <circle cx={x(lastIdx)} cy={ry(pts[lastIdx].ratio)} r="6" fill="#B0413A" stroke="#fff" strokeWidth="2" />
            <text x={x(lastIdx) - 150} y={ry(pts[lastIdx].ratio) - 12} className="t" fontSize="14" fontWeight="600" fill="#B0413A">
              {s.endAnnotation}
            </text>

            <g className="t" fontSize="13" fill="#5E6E7C">
              {pts.map((p, i) => (
                <text key={p.q} x={x(i) - 26} y={H - 20}>{p.q}</text>
              ))}
            </g>
          </svg>
          <div className="csrc">
            <span>{s.source}</span>
            <span className="conf" style={{ color: 'var(--red)' }}><span className="dot" style={{ background: 'var(--red)' }} />{s.warning}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
