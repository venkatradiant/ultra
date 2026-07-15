import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import qualityData from '../../data/nfcu/nfcuQualityData.json';

const { qualityPosture, ncuaCompliance, fcrTrend } = qualityData;

/* ─── Gauge helper (same as RegulatoryReadinessCard) ────────────────────── */
function GaugeChart({ score, maxScore, status }) {
  const pct = (score / maxScore) * 100;
  const color = status === 'amber' ? '#F59E0B' : status === 'green' ? '#00897B' : '#CC0000';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${pct * 1.57} 157`}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-0">
          <span className="text-2xl font-bold text-text">{score}</span>
          <span className="text-xs text-text-subtle ml-0.5 mb-1">/{maxScore}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Quality Posture Card ───────────────────────────────────────────────── */
export function NFCUQualityPostureCard() {
  const d = qualityPosture;
  const statusBadgeColor =
    d.overallStatus === 'amber' ? 'bg-amber-50 text-amber-600' :
    d.overallStatus === 'green' ? 'bg-emerald-50 text-emerald-600' :
    'bg-red-50 text-red-600';

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text">{d.title}</h3>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadgeColor}`}>
          {d.overallScore}/100
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {d.metrics.map((m) => (
          <div key={m.label} className={`text-center p-2.5 rounded-lg ${
            m.status === 'critical' ? 'bg-red-50 border border-red-100' :
            m.status === 'below' ? 'bg-amber-50 border border-amber-100' :
            'bg-surface-2'
          }`}>
            <p className={`text-base font-bold ${
              m.status === 'critical' ? 'text-red-600' :
              m.status === 'below' ? 'text-amber-600' : 'text-text'
            }`}>{m.value}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{m.label}</p>
            <p className="text-[9px] text-text-subtle mt-0.5">Target: {m.target}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-text-subtle mt-3 text-center">
        Dynamics 365 QM · Azure AI Sentiment · Genesys Cloud
      </p>
    </div>
  );
}

/* ─── NCUA Compliance Readiness Card ────────────────────────────────────── */
const areaStatusConfig = {
  ok:       { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'OK' },
  watch:    { dot: 'bg-amber-400',   text: 'text-amber-600',   label: 'Watch' },
  at_risk:  { dot: 'bg-red-500',     text: 'text-red-600',     label: 'At Risk' },
};

export function NFCUComplianceCard() {
  const d = ncuaCompliance;
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-5">
      <h3 className="text-sm font-semibold text-text mb-1">{d.title}</h3>
      <p className="text-[10px] text-text-subtle mb-3">{d.keyRisk}</p>
      <GaugeChart score={d.score} maxScore={d.maxScore} status={d.status} />
      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="p-2 rounded-lg bg-red-50 border border-red-100">
          <p className="text-lg font-bold text-red-600">{d.openFindings}</p>
          <p className="text-[10px] text-text-muted">Open Findings</p>
        </div>
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <p className="text-lg font-bold text-emerald-600">{d.closedFindings}</p>
          <p className="text-[10px] text-text-muted">Closed Findings</p>
        </div>
      </div>

      {/* Compliance area breakdown */}
      <div className="mt-4 space-y-2">
        {d.areas.map((a) => {
          const cfg = areaStatusConfig[a.status] || areaStatusConfig.ok;
          return (
            <div key={a.area} className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5 ${cfg.dot}`} />
                <span className="text-[11px] text-text-muted font-medium truncate">{a.area}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
                <p className="text-[9px] text-text-subtle">{a.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-text-subtle mt-3 text-center">
        Next exam window: {d.nextExamWindow}
      </p>
    </div>
  );
}

/* ─── FCR Trend Chart ────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg p-2.5 shadow-sm text-xs">
      <p className="font-semibold text-text-muted mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
};

export function NFCUFCRTrendChart() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-5">
      <h3 className="text-sm font-semibold text-text mb-1">First-Call Resolution — 8-Week Trend</h3>
      <p className="text-xs text-text-subtle mb-4">Bill pay FCR collapsing after April 14 IT incident</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={fcrTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.12} />
              <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="billPayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 8, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            domain={[45, 90]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
            formatter={(value) => value === 'overall_fcr' ? 'Overall FCR' : 'Bill Pay FCR'}
          />
          <Area
            type="monotone"
            dataKey="overall_fcr"
            name="overall_fcr"
            stroke="var(--color-brand)"
            strokeWidth={2}
            fill="url(#overallGrad)"
            dot={{ r: 3, fill: 'var(--color-brand)', strokeWidth: 1.5, stroke: '#fff' }}
            activeDot={{ r: 5 }}
            animationDuration={900}
          />
          <Area
            type="monotone"
            dataKey="bill_pay_fcr"
            name="bill_pay_fcr"
            stroke="#DC2626"
            strokeWidth={2}
            fill="url(#billPayGrad)"
            dot={{ r: 3, fill: '#DC2626', strokeWidth: 1.5, stroke: '#fff' }}
            activeDot={{ r: 5 }}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
