import qualityData from '../../data/nfcu/nfcuQualityData.json';

const { qualitySignals, agentQualityByQueue } = qualityData;

const severityConfig = {
  critical: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border border-red-200',
    label: 'Critical',
    bar: 'bg-red-500',
  },
  warning: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    label: 'Warning',
    bar: 'bg-amber-500',
  },
  ok: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    label: 'On Target',
    bar: 'bg-emerald-500',
  },
};

const categoryColors = {
  Compliance: 'bg-purple-50 text-purple-700 border border-purple-200',
  Experience: 'bg-blue-50 text-blue-700 border border-blue-200',
  Workforce: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export default function NFCUQualitySignalsTable() {
  return (
    <div className="space-y-4">
      {/* Active Quality Signals */}
      <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text">Active Quality Signals</p>
            <p className="text-[10px] text-text-subtle mt-0.5">Dynamics 365 QM · Azure AI Sentiment</p>
          </div>
          <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold uppercase tracking-wide">
            2 Critical
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {qualitySignals.map((sig) => {
            const s = severityConfig[sig.severity] || severityConfig.warning;
            const catColor = categoryColors[sig.category] || 'bg-surface-2 text-text-muted border border-border';
            return (
              <div key={sig.id} className="px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${s.dot}`} />
                    <span className="text-xs font-semibold text-text leading-snug">{sig.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${catColor}`}>
                      {sig.category}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${s.badge}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed ml-4">{sig.description}</p>
                <div className="ml-4 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                  {sig.sources.map((src, i) => (
                    <span key={i} className="text-[9px] text-text-subtle font-medium">{src}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quality Scores by Queue */}
      <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <p className="text-xs font-semibold text-text">Quality Score by Queue</p>
          <span className="text-[10px] text-text-subtle font-medium">Target: 85</span>
        </div>
        <div className="p-4 space-y-3">
          {agentQualityByQueue.map((q) => {
            const s = severityConfig[q.status] || severityConfig.ok;
            const pct = Math.min((q.score / 100) * 100, 100);
            const trendArrow = q.trend === 'declining' ? '↓' : q.trend === 'stable' ? '→' : '↑';
            const trendColor = q.trend === 'declining' ? 'text-red-500' : q.trend === 'stable' ? 'text-text-subtle' : 'text-emerald-500';
            return (
              <div key={q.queue}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <span className="text-xs font-medium text-text-muted">{q.queue}</span>
                    <span className={`text-[10px] font-bold ${trendColor}`}>{trendArrow}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-subtle">{q.agents} agents</span>
                    <span className={`text-xs font-bold ${
                      q.score >= q.target ? 'text-emerald-600' :
                      q.score >= q.target - 5 ? 'text-amber-600' : 'text-red-600'
                    }`}>{q.score}</span>
                  </div>
                </div>
                <div className="relative h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full ${s.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                  {/* Target line at 85% */}
                  <div
                    className="absolute top-0 h-full w-px bg-gray-400 opacity-60"
                    style={{ left: '85%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-2.5 border-t border-border-subtle bg-gray-50/50 flex items-center justify-between">
          <span className="text-[10px] text-text-subtle">Gray tick = 85-point target threshold</span>
          <span className="text-[10px] font-semibold text-text-muted">Overall: 82.8</span>
        </div>
      </div>
    </div>
  );
}
