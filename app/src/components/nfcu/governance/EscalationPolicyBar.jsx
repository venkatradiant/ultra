import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, User, X, ArrowDown } from 'lucide-react';

const STORAGE_KEY = 'nfcu.threshold';
const DEFAULT_THRESHOLD = 70;

export default function EscalationPolicyBar({ governance }) {
  const [threshold, setThreshold] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? Number(saved) : DEFAULT_THRESHOLD;
    } catch {
      return DEFAULT_THRESHOLD;
    }
  });
  const [openPopover, setOpenPopover] = useState(null);

  const auditTrail = governance.audit_trail || [];
  const pending = auditTrail.filter((e) => !e.outcome).length;
  const resolved = auditTrail.filter((e) => !!e.outcome).length;

  const reviewer = governance.reviewer || {
    name: 'Quality Assurance',
    role: 'Default reviewer',
    sla: 'Within 30 min during business hours',
    queue: 'QA Queue',
  };

  const updateThreshold = (next) => {
    setThreshold(next);
    try { sessionStorage.setItem(STORAGE_KEY, String(next)); } catch { /* noop */ }
  };

  const resetThreshold = () => updateThreshold(DEFAULT_THRESHOLD);

  const scrollToAudit = () => {
    const el = document.getElementById('audit-trail-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpenPopover(null);
  };

  const isEdited = threshold !== DEFAULT_THRESHOLD;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-1.5">
      {/* Threshold chip + popover */}
      <div className="relative">
        <button
          onClick={() => setOpenPopover(openPopover === 'threshold' ? null : 'threshold')}
          className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors cursor-pointer"
        >
          <Shield className="w-3 h-3" />
          <span>Auto-escalate <span className="font-semibold tabular-nums">&lt; {threshold}%</span></span>
          {isEdited && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-1 rounded bg-red-100 text-red-600">edited</span>
          )}
        </button>
        <AnimatePresence>
          {openPopover === 'threshold' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full mt-2 left-0 w-[320px] z-30 bg-surface rounded-xl border border-border p-4"
              style={{ boxShadow: '0 8px 28px rgba(0,0,0,0.12)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold text-text">Confidence Threshold</div>
                  <div className="text-[10px] text-text-muted">Below this score, auto-escalate to a human reviewer</div>
                </div>
                <button onClick={() => setOpenPopover(null)} className="text-text-subtle hover:text-text-muted cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="range"
                  min={60}
                  max={95}
                  step={1}
                  value={threshold}
                  onChange={(e) => updateThreshold(Number(e.target.value))}
                  className="flex-1 accent-brand cursor-pointer"
                />
                <span className="font-mono text-sm font-bold text-text tabular-nums w-12 text-right">{threshold}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-muted leading-relaxed">
                <div>
                  <div>Last reviewed: <span className="font-medium text-text-muted">2026-Q1 · Quality Lead</span></div>
                  <div>Next scheduled review: <span className="font-medium text-text-muted">2026-Q2</span></div>
                </div>
                {isEdited && (
                  <button
                    onClick={resetThreshold}
                    className="text-[10px] font-semibold text-brand hover:underline cursor-pointer"
                  >
                    Reset to {DEFAULT_THRESHOLD}%
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pending / resolved chip */}
      <button
        onClick={scrollToAudit}
        className="inline-flex items-center gap-2 rounded-full bg-surface border border-border px-2.5 py-1 text-[11px] font-medium text-text-muted hover:border-border hover:shadow-sm transition-all cursor-pointer"
      >
        <span className="inline-flex items-center gap-1">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${pending > 0 ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="font-semibold">{pending} pending</span>
        </span>
        <span className="text-text-subtle">·</span>
        <span className="inline-flex items-center gap-1 text-text-muted">
          <CheckCircle2 className="w-3 h-3 text-green-600" />
          <span>{resolved} resolved</span>
        </span>
        <ArrowDown className="w-3 h-3 text-text-subtle" />
      </button>

      {/* Reviewer chip + popover */}
      <div className="relative">
        <button
          onClick={() => setOpenPopover(openPopover === 'reviewer' ? null : 'reviewer')}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand/[0.05] border border-brand/15 px-2.5 py-1 text-[11px] font-medium text-brand hover:bg-brand/[0.08] hover:border-brand/25 transition-colors cursor-pointer"
        >
          <User className="w-3 h-3" />
          <span>On-call: <span className="font-semibold">{reviewer.name}</span></span>
          <span className="text-brand/60">· {reviewer.role}</span>
        </button>
        <AnimatePresence>
          {openPopover === 'reviewer' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full mt-2 left-0 w-[340px] z-30 bg-surface rounded-xl border border-border p-4"
              style={{ boxShadow: '0 8px 28px rgba(0,0,0,0.12)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold text-text">On-call Reviewer</div>
                  <div className="text-[10px] text-text-muted">Routes for any below-threshold escalation</div>
                </div>
                <button onClick={() => setOpenPopover(null)} className="text-text-subtle hover:text-text-muted cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-text-subtle mb-0.5">Reviewer</div>
                  <div className="text-[12px] font-semibold text-text">{reviewer.name}</div>
                  <div className="text-[11px] text-text-muted">{reviewer.role}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-text-subtle mb-0.5">SLA</div>
                  <div className="text-[11px] text-text-muted">{reviewer.sla}</div>
                </div>
                {reviewer.queue && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-text-subtle mb-0.5">Queue</div>
                    <div className="text-[11px] font-mono text-text-muted">{reviewer.queue}</div>
                  </div>
                )}
                {reviewer.coverage && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-text-subtle mb-0.5">Coverage</div>
                    <div className="text-[11px] text-text-muted">{reviewer.coverage}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
