import regData from '../../data/risk/regulatory_readiness.json';
import MiniGauge from './MiniGauge';

const TREND_LABELS = {
  improving: '↑',
  stable: '→',
  declining: '↓',
};

export default function RegulatoryGaugePanel() {
  const { overall, categories } = regData;

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">NCUA Regulatory Readiness</h3>
      <p className="text-[11px] text-text-subtle mb-3">Overall score: {overall.score}/100 — Next exam: {overall.next_exam_window}</p>

      {/* Overall gauge */}
      <div className="flex items-center justify-center mb-4 pb-3 border-b border-border-subtle">
        <div className="text-center">
          <MiniGauge score={overall.score} status={overall.status} size={80} />
          <p className="text-[10px] text-text-subtle mt-1">
            Overall {TREND_LABELS[overall.trend]} (prev: {overall.previous_score})
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-start gap-2">
            <MiniGauge score={cat.score} status={cat.status} size={52} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-text leading-tight truncate">{cat.name}</p>
              <p className="text-[10px] text-text-subtle">
                {TREND_LABELS[cat.trend]} {cat.previous} → {cat.score}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{cat.key_finding}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-border-subtle flex justify-between text-[10px] text-text-subtle">
        <span>Open findings: {regData.open_findings}</span>
        <span>Closed YTD: {regData.closed_findings_ytd}</span>
      </div>
    </div>
  );
}
