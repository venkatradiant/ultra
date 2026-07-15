import { motion } from 'framer-motion';
import { CircleDollarSign, AlertTriangle, ArrowDown, KeyRound } from 'lucide-react';

// Step 3 (Friction Observability): the 3-step decline trail.
// Step 4 (Anomaly Detection): the exception explainer variant.
// A single lightweight presentational card, no chart library.
const TRAIL = [
  {
    icon: CircleDollarSign,
    label: 'Payment attempted',
    detail: 'Auto loan $412.00 scheduled to draw from checking · Jun 27',
    tone: 'neutral',
  },
  {
    icon: AlertTriangle,
    label: 'Balance too low at that moment',
    detail: 'Available balance was $208.14 — below the $412.00 payment · declined (NSF)',
    tone: 'warn',
  },
  {
    icon: KeyRound,
    label: 'Underlying cause: early salary credit not routed',
    detail: '$3,140.00 early salary credit arrived but is held — direct deposit routing was never configured',
    tone: 'cause',
  },
];

const toneStyles = {
  neutral: { ring: 'border-border', bg: 'bg-surface', icon: 'text-slate-400' },
  warn: { ring: 'border-amber-200', bg: 'bg-amber-50', icon: 'text-amber-500' },
  cause: { ring: 'border-brand/25', bg: 'bg-brand/[0.04]', icon: 'text-brand' },
};

function ExceptionExplainer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-gradient-to-b from-[#F8F9FB] to-white p-4"
    >
      <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-3">
        Why the funds are held
      </h4>
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[11px] font-semibold text-emerald-800">Early salary credit present</p>
          <p className="text-[10.5px] text-emerald-700/80 mt-0.5">$3,140.00 released ahead of schedule</p>
        </div>
        <div className="flex items-center justify-center text-text-subtle font-semibold text-sm px-1">+</div>
        <div className="flex-1 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-[11px] font-semibold text-red-800">Direct deposit routing missing</p>
          <p className="text-[10.5px] text-red-700/80 mt-0.5">No routing number on file to match against</p>
        </div>
        <div className="flex items-center justify-center text-text-subtle font-semibold text-sm px-1">=</div>
        <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-[11px] font-semibold text-amber-800">Funds held, not posted</p>
          <p className="text-[10.5px] text-amber-700/80 mt-0.5">Exception, not an error on your side</p>
        </div>
      </div>
      <p className="text-[10.5px] text-text-muted mt-3 leading-relaxed">
        <span className="font-semibold text-text-muted">SOP rule:</span> an early-credit flag requires a
        matching direct deposit instruction to post automatically. When the two do not match, the credit
        is held pending routing.
      </p>
    </motion.div>
  );
}

export default function MemberDeclineTrail({ variant = 'trail' }) {
  if (variant === 'exception') return <ExceptionExplainer />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-gradient-to-b from-[#F8F9FB] to-white p-4"
    >
      <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-3">
        What happened
      </h4>
      <ol className="space-y-0">
        {TRAIL.map((step, i) => {
          const Icon = step.icon;
          const s = toneStyles[step.tone];
          const last = i === TRAIL.length - 1;
          return (
            <li key={i} className="relative">
              <div className={`flex items-start gap-3 rounded-lg border ${s.ring} ${s.bg} p-3`}>
                <div className="mt-0.5 flex-shrink-0">
                  <Icon className={`w-4 h-4 ${s.icon}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-text leading-snug">{step.label}</p>
                  <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">{step.detail}</p>
                </div>
              </div>
              {!last && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-3.5 h-3.5 text-text-subtle" />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
}
