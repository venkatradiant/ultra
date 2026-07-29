import { useState, useEffect } from 'react';
import { ArrowRight, Users, Clock, Activity } from 'lucide-react';
import metrics from '../../../data/newfold-digital/ops/metrics.json';

// Semicircle gauge (0–100) for Bluehost health.
function Gauge({ value }) {
  const color = value >= 80 ? '#10b981' : value >= 72 ? '#f59e0b' : '#ef4444';
  const r = 34;
  const circ = Math.PI * r; // half circle
  const dash = (value / 100) * circ;
  return (
    <svg width="90" height="52" viewBox="0 0 90 52" className="mx-auto">
      <path d="M 8 46 A 37 37 0 0 1 82 46" fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
      <path d="M 8 46 A 37 37 0 0 1 82 46" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} pathLength={circ} />
      <text x="45" y="44" textAnchor="middle" fontSize="16" fontWeight="700" fill={color}>{value}%</text>
    </svg>
  );
}

export default function AgentAllocationPanel() {
  const a = metrics.agentAllocation;
  const [secondsLeft, setSecondsLeft] = useState(a.etaMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">Real-Time Agent Allocation</p>
        <p className="text-[10px] text-text-subtle mt-0.5">Source: Genesys Cloud (routing) · Workforce Management · Agent Skill Profiles</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-center rounded-lg border border-border-subtle bg-surface-2 px-4 py-3 flex-1">
            <p className="text-[10px] text-text-muted uppercase tracking-wide">From</p>
            <p className="text-xs font-semibold text-text mt-1">{a.from}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center gap-1 text-brand font-bold text-lg"><Users className="w-4 h-4" />{a.moved}</span>
            <ArrowRight className="w-5 h-5 text-brand" />
          </div>
          <div className="text-center rounded-lg border border-brand/30 bg-brand/[0.05] px-4 py-3 flex-1">
            <p className="text-[10px] text-brand uppercase tracking-wide">To</p>
            <p className="text-xs font-semibold text-text mt-1">{a.to}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border-subtle p-3">
            <div className="flex items-center gap-1.5 text-text-muted mb-1"><Clock className="w-3.5 h-3.5" /><span className="text-[10px] uppercase tracking-wide font-semibold">Recovery countdown</span></div>
            <p className="text-2xl font-bold text-brand tabular-nums leading-none">{mm}:{ss}</p>
            <p className="text-[10px] text-text-subtle mt-1">Target: {a.targetRecovery}</p>
          </div>
          <div className="rounded-lg border border-border-subtle p-3">
            <div className="flex items-center gap-1.5 text-text-muted mb-1"><Activity className="w-3.5 h-3.5" /><span className="text-[10px] uppercase tracking-wide font-semibold">Bluehost health</span></div>
            <Gauge value={a.bluehostHealth} />
            <p className="text-[10px] text-amber-600 text-center font-medium">Watching — do not tip into critical</p>
          </div>
        </div>
      </div>
    </div>
  );
}
