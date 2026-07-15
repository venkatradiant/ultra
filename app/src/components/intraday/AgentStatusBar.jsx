import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, Activity } from 'lucide-react';

function deriveAgentState(baseline, snapshot) {
  const overrides = snapshot?.kpiOverrides || {};
  const signalIds = snapshot?.signalIds;

  const supKpis = baseline?.tiers?.supervisor?.kpis || [];
  const getBaseline = (id) => supKpis.find((k) => k.id === id)?.value;
  const queue = overrides.queue ?? overrides.queue_total ?? getBaseline('queue') ?? 0;
  const topIntent = overrides.top_intent ?? getBaseline('top_intent') ?? 'Rate Comparison';

  const signals = Array.isArray(signalIds) ? signalIds : (baseline?.priority_signals_inline || []).map((s) => s.id);
  const hasSipSignal = signals.some((id) => id.includes('SUP-001') || id.includes('DIR-001'));
  const hasAuthSignal = signals.some((id) => id.includes('SUP-002') || id.includes('DIR-002'));

  const queueStatus =
    queue >= 60 ? { label: 'Critical', tone: 'critical' }
    : queue >= 25 ? { label: 'Elevated', tone: 'warning' }
    : { label: 'Normal', tone: 'ok' };

  return {
    queueStatus,
    systemAlert: hasSipSignal ? 'SIP degradation · East carrier path' : null,
    authMode: hasAuthSignal
      ? { label: 'Fallback · KBA', tone: 'warning' }
      : { label: 'PinDrop Active', tone: 'ok' },
    topIntent,
    confidence: snapshot?.signalIds && snapshot.signalIds.length === 0 ? 96 : 92,
  };
}

const TONE_STYLES = {
  ok:       { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  warning:  { dot: 'bg-amber-500',   text: 'text-amber-700'   },
  critical: { dot: 'bg-red-500',     text: 'text-red-700'     },
};

function StatusPill({ label, value, tone, Icon }) {
  const style = TONE_STYLES[tone] || TONE_STYLES.ok;
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface border border-border">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <Icon className="w-3 h-3 text-text-subtle" />
      <span className="text-[9.5px] font-semibold uppercase tracking-wide text-text-muted">{label}</span>
      <span className={`text-[11px] font-bold ${style.text}`}>{value}</span>
    </div>
  );
}

export default function AgentStatusBar({ baseline, snapshot }) {
  const state = deriveAgentState(baseline, snapshot);
  const alertTone = state.systemAlert ? 'amber' : 'emerald';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-border bg-surface overflow-hidden"
    >
      {/* Top alert strip — system-wide context */}
      <div className={`flex items-center gap-2 px-3 py-1.5 border-b ${
        alertTone === 'amber'
          ? 'bg-amber-50/80 border-amber-100 text-amber-800'
          : 'bg-emerald-50/80 border-emerald-100 text-emerald-800'
      }`}>
        {state.systemAlert ? (
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
        )}
        <p className="text-[11px] font-semibold leading-tight truncate">
          {state.systemAlert || 'All systems nominal · PinDrop authentication active'}
        </p>
      </div>

      {/* Bottom row — thin pills */}
      <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-2">
        <StatusPill label="Queue" value={state.queueStatus.label} tone={state.queueStatus.tone} Icon={Activity} />
        <StatusPill
          label="Auth"
          value={state.authMode.label}
          tone={state.authMode.tone}
          Icon={state.authMode.tone === 'ok' ? ShieldCheck : ShieldAlert}
        />
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface border border-blue-200/80">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-blue-700">Top Intent</span>
          <span className="text-[11px] font-bold text-blue-900">{state.topIntent}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface border border-border ml-auto">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-text-muted">AI Conf</span>
          <div className="w-14 h-1 rounded-full bg-surface-2 overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={false}
              animate={{ width: `${state.confidence}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-[11px] font-bold tabular-nums text-emerald-700">{state.confidence}%</span>
        </div>
      </div>
    </motion.div>
  );
}
