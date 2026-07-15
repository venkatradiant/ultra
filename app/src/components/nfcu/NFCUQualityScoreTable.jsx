const teams = [
  { team: 'Digital Support', score: 89, adherence: '91%', fcr: '81%', sentiment: '8%', trend: 'stable', status: 'ok' },
  { team: 'Member Onboarding', score: 86, adherence: '88%', fcr: '79%', sentiment: '10%', trend: 'stable', status: 'ok' },
  { team: 'General Banking', score: 84, adherence: '82%', fcr: '72%', sentiment: '14%', trend: 'declining', status: 'warning' },
  { team: 'Mortgage Servicing', score: 79, adherence: '76%', fcr: '65%', sentiment: '24%', trend: 'declining', status: 'critical' },
  { team: 'Auto Loans', score: 76, adherence: '71%', fcr: '61%', sentiment: '22%', trend: 'declining', status: 'critical' },
];

const trendBadge = (trend) => ({
  stable: (
    <span className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap leading-none">
      Stable
    </span>
  ),
  declining: (
    <span className="inline-flex items-center gap-0.5 text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap leading-none">
      <span aria-hidden="true">↓</span>
      <span>Declining</span>
    </span>
  ),
})[trend];

const scoreColor = (s) => s >= 85 ? 'text-emerald-600' : s >= 80 ? 'text-brand' : s >= 75 ? 'text-amber-600' : 'text-red-600';

const scoreBar = (score) => (
  <div className="flex items-center gap-2">
    <div className="w-16 bg-surface-2 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${score >= 85 ? 'bg-emerald-500' : score >= 80 ? 'bg-brand' : score >= 75 ? 'bg-amber-400' : 'bg-red-400'}`}
        style={{ width: `${score}%` }} />
    </div>
    <span className={`text-xs font-bold ${scoreColor(score)}`}>{score}</span>
  </div>
);

export default function NFCUQualityScoreTable() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-text-muted">Quality Scores by Team — Trailing 30 Days</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Source: Dynamics 365 Quality Evaluation Agent · 100% of interactions scored by AI</p>
        </div>
        <span className="text-[10px] text-text-muted font-medium">Floor avg: <strong className="text-amber-600">82/100</strong></span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-2">
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Team / Queue</th>
            <th className="text-left px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Score</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Adherence</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">FCR</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Neg Sentiment</th>
            <th className="text-center px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Trend</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t, i) => (
            <tr key={t.team} className={`border-t border-border-subtle ${i % 2 === 0 ? 'bg-surface' : 'bg-gray-50/30'} hover:bg-blue-50/20 transition-colors`}>
              <td className="px-4 py-2.5 font-semibold text-text">{t.team}</td>
              <td className="px-3 py-2.5">{scoreBar(t.score)}</td>
              <td className={`px-3 py-2.5 text-center font-medium ${parseInt(t.adherence) >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>{t.adherence}</td>
              <td className={`px-3 py-2.5 text-center font-medium ${parseInt(t.fcr) >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{t.fcr}</td>
              <td className={`px-3 py-2.5 text-center font-medium ${parseInt(t.sentiment) > 15 ? 'text-red-600' : 'text-text-muted'}`}>{t.sentiment}</td>
              <td className="px-4 py-2.5 text-center">{trendBadge(t.trend)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-surface-2">
        <p className="text-[10px] text-text-muted">Target: ≥85 quality score, ≥85% adherence, ≥75% FCR, &lt;15% negative sentiment</p>
      </div>
    </div>
  );
}
