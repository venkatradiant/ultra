import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, History, CheckCircle2, AlertTriangle } from 'lucide-react';
import { loadAuditTrail } from '../../../utils/confidence';

function dedupe(list) {
  const seen = new Set();
  const out = [];
  for (const e of list) {
    if (e?.auditId && !seen.has(e.auditId)) {
      seen.add(e.auditId);
      out.push(e);
    }
  }
  return out;
}

function relativeTime(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const kindConfig = {
  'auto-escalation': { Icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', label: 'Escalation' },
  'watch-list': { Icon: History, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Watch' },
  'scheduled-validation': { Icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Validation' },
};

export default function AuditTrailFeed({ baseEntries = [] }) {
  const [live, setLive] = useState(() => loadAuditTrail());

  useEffect(() => {
    const onEsc = (e) => {
      setLive((prev) => dedupe([e.detail, ...prev]));
    };
    window.addEventListener('nfcu:escalation', onEsc);
    return () => window.removeEventListener('nfcu:escalation', onEsc);
  }, []);

  const merged = useMemo(() => {
    return dedupe([...live, ...baseEntries]).slice(0, 12);
  }, [live, baseEntries]);

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-1.5 mb-3">
        <Shield className="w-3.5 h-3.5 text-text-subtle" />
        <div className="text-[9px] uppercase tracking-wider font-bold text-text-subtle">Audit Trail · Last 12 Events</div>
      </div>

      <ul className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-sleek">
        <AnimatePresence initial={false}>
          {merged.map((entry) => {
            const kind = kindConfig[entry.kind] || kindConfig['auto-escalation'];
            const Icon = kind.Icon;
            return (
              <motion.li
                key={entry.auditId}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="rounded-lg border border-border-subtle px-3 py-2.5 hover:border-border"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${kind.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${kind.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-mono text-brand">{entry.auditId}</p>
                      <span className="text-[10px] text-text-subtle">{relativeTime(entry.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${kind.color} ${kind.bg}`}>
                        {kind.label}
                      </span>
                      <span className="text-[11px] font-semibold text-text truncate">
                        {entry.personaName || entry.persona} · {entry.score}% confidence
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{entry.reason}</p>
                    )}
                    {entry.route_to && (
                      <p className="text-[11px] text-text-muted mt-1 inline-flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-text-subtle" />
                        Routed to <span className="font-medium text-text-muted">{entry.route_to}</span>
                      </p>
                    )}
                    {entry.outcome && (
                      <p className="text-[11px] text-green-700 mt-1 leading-relaxed">
                        <span className="font-semibold">Outcome:</span> {entry.outcome}
                      </p>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>

        {merged.length === 0 && (
          <li className="text-[11px] text-text-subtle text-center py-4">No audit events recorded yet.</li>
        )}
      </ul>
    </div>
  );
}
