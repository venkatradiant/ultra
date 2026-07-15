import pres from '../../../../../data/ussfcu/ceo/presentation.json';
import { askProps, askAbout } from '../askAbout';

const ROW_SEEDS = ['ev_loans', 'ev_shares', 'sit_pipeline'];

export default function SlideEvidence({ active }) {
  const s = pres.slides.evidence;
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
            <svg width="100%" height="220" viewBox="0 0 380 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Loan-to-share rose from 72 percent to 84 percent over five years">
              <line x1="44" y1="170" x2="360" y2="170" stroke="#E4DED2" />
              <polyline points="60,150 135,124 210,92 285,60 350,34" fill="none" stroke="#0A2A47" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="350" cy="34" r="6" fill="#C2A24C" stroke="#fff" strokeWidth="2" />
              <g className="t" fontSize="12" fill="#5E6E7C">
                <text x="52" y="190">2022</text><text x="196" y="190">2024</text><text x="330" y="190">2026</text>
              </g>
              <text x="250" y="30" className="t" fontSize="12" fontWeight="600" fill="#8a6d1f">{s.trendAnnotation}</text>
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
