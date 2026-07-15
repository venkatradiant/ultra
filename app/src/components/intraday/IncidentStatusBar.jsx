import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Radio, ExternalLink } from 'lucide-react';

function minutesBetween(startIso, refIso) {
  if (!startIso) return null;
  const start = new Date(startIso).getTime();
  const ref = refIso ? new Date(refIso).getTime() : Date.now();
  return Math.max(0, Math.round((ref - start) / 60000));
}

function formatElapsed(min) {
  if (min == null) return null;
  if (min < 60) return `T+${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `T+${h}h` : `T+${h}h ${m}m`;
}

const SEVERITY_TONE = {
  critical: { dot: 'bg-red-500',     ring: 'ring-red-500/30',    text: 'text-red-700',     bar: 'border-red-200/70',    bg: 'bg-red-50/60'    },
  warning:  { dot: 'bg-amber-500',   ring: 'ring-amber-500/30',  text: 'text-amber-700',   bar: 'border-amber-200/70',  bg: 'bg-amber-50/60'  },
  ok:       { dot: 'bg-emerald-500', ring: 'ring-emerald-500/30',text: 'text-emerald-700', bar: 'border-emerald-200/70',bg: 'bg-emerald-50/60'},
};

export default function IncidentStatusBar({ baseline, snapshot, stepLabel }) {
  const incident = baseline?.incident;
  // Resolve dynamic severity: empty signalIds array on a step = resolved.
  const activeSignalIds = snapshot?.signalIds;
  const isResolved = Array.isArray(activeSignalIds) && activeSignalIds.length === 0;
  const severity = isResolved ? 'ok' : (incident?.severity || 'critical');
  const tone = SEVERITY_TONE[severity] || SEVERITY_TONE.critical;
  const stateLabel = isResolved ? 'INCIDENT RESOLVED' : (incident?.state_label || 'INCIDENT ACTIVE');

  // Live elapsed clock — recomputes every 30s.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const elapsed = useMemo(() => {
    return formatElapsed(minutesBetween(incident?.started_at, new Date(now).toISOString()));
  }, [incident?.started_at, now]);

  return (
    <div className={`rounded-xl border ${tone.bar} ${tone.bg} px-3 py-2.5`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative inline-flex w-2.5 h-2.5">
            <motion.span
              className={`absolute inset-0 rounded-full ${tone.dot} ring-4 ${tone.ring}`}
              animate={severity === 'critical' ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
              transition={severity === 'critical' ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
            />
          </span>
          <span className={`text-[11px] font-bold tracking-wide ${tone.text}`}>{stateLabel}</span>
          {elapsed ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-muted tabular-nums">
              <Clock className="w-3 h-3 text-text-subtle" />
              {elapsed}
            </span>
          ) : null}
          {!isResolved && incident?.eta ? (
            <span className="text-[11px] font-medium text-text-muted tabular-nums">
              ETA <span className="text-text-muted">{incident.eta}</span>
            </span>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          <motion.span
            className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <Radio className="w-3 h-3" />
          Live
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <p className="text-[12.5px] font-semibold text-text truncate">
          {isResolved ? 'All systems nominal.' : (incident?.headline || 'Active incident')}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {stepLabel ? (
            <p className="text-[10.5px] font-medium text-text-muted">{stepLabel}</p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.demoNavigate) window.demoNavigate('/governance');
              else if (typeof window !== 'undefined') window.location.href = '/governance';
            }}
            className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-brand hover:text-brand-hover hover:underline cursor-pointer"
            title="Open Model Governance — KPI confidence, lineage, drift, audit trail"
          >
            Governance
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
