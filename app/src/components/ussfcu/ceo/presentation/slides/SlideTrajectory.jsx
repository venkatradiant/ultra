import pres from '../../../../../data/ussfcu/ceo/presentation.json';
import { askProps, askAbout } from '../askAbout';

export default function SlideTrajectory({ active }) {
  const s = pres.slides.trajectory;
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
          <svg width="100%" height="410" viewBox="0 0 1160 410" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Loan-to-share projected to rise above the 85 percent board ceiling by September, reaching 89 percent by December">
            <line x1="90" y1="360" x2="1130" y2="360" stroke="#E4DED2" />
            <path d="M320,247.5 500,191.25 680,153.75 860,135 1040,97.5 1040,247.5 320,247.5 Z" fill="#B0413A" opacity="0.09" />
            <line x1="90" y1="247.5" x2="1130" y2="247.5" stroke="#B0413A" strokeWidth="1.5" strokeDasharray="6 5" />
            <text x="96" y="240" className="t" fontSize="13" fontWeight="600" fill="#B0413A">{s.boardCeiling}% board ceiling</text>
            <polyline points="140,285 320,247.5 500,191.25 680,153.75 860,135 1040,97.5" fill="none" stroke="#0A2A47" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="1040" cy="97.5" r="6" fill="#0A2A47" />
            <text x="1000" y="82" className="t" fontSize="14" fontWeight="600" fill="#0A2A47">{s.endAnnotation}</text>
            <g className="t" fontSize="14" fill="#5E6E7C">
              {s.series.map((pt, i) => (
                <text key={pt.m} x={128 + i * 180} y="388">{pt.m}</text>
              ))}
            </g>
            <circle cx="500" cy="191.25" r="5" fill="#B0413A" />
            <text x="512" y="186" className="t" fontSize="13" fontWeight="600" fill="#B0413A">{s.crossAnnotation}</text>
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
