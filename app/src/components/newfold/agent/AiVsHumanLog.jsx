import { Bot, User, UserCog, CheckCircle2 } from 'lucide-react';
import metrics from '../../../data/newfold-digital/agent/metrics.json';

const actorMeta = {
  Human: { icon: User, color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'Human' },
  AI: { icon: Bot, color: 'text-violet-600', bg: 'bg-violet-500/10', label: 'AI' },
  'Human+AI': { icon: UserCog, color: 'text-brand', bg: 'bg-brand/10', label: 'Human + AI' },
};

export default function AiVsHumanLog() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden max-w-md">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text">Action Confirmed</p>
        <p className="text-[10px] text-text-subtle mt-0.5">Ready for compliance review · full audit trail</p>
      </div>
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Fix Completed — 4 Steps</p>
        <div className="space-y-1.5">
          {metrics.fixSteps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <p className="text-[11px] text-text">{s}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-2 border-b border-border-subtle bg-surface-2">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">AI vs Human Action Log</p>
      </div>
      <div className="divide-y divide-border-subtle">
        {metrics.aiVsHuman.map((a, i) => {
          const m = actorMeta[a.actor] || actorMeta.AI;
          const Icon = m.icon;
          return (
            <div key={i} className="px-4 py-2.5 flex items-center gap-3">
              <span className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-text">{a.action}</p>
                <p className="text-[10px] text-text-subtle">{a.who}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${m.color}`}>{m.label}</span>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-emerald-500/[0.05]">
        <p className="text-[10px] text-emerald-700 font-semibold">→ $203.88 → $178.88 with loyalty credit · every action attributed and logged.</p>
      </div>
    </div>
  );
}
