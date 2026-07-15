import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Check } from 'lucide-react';

// Step 4 (Anomaly Detection): BSA/AML compliance gate surfaced at the required
// step. Two identity elements to confirm; toggling is local/visual only — the
// conversation advances via the "Identity confirmed" chip.
const ELEMENTS = [
  { id: 'dob', label: 'Date of birth', hint: 'Confirm verbally with the member' },
  { id: 'last4', label: 'Last 4 of SSN', hint: 'Confirm verbally with the member' },
];

export default function AgentComplianceGate() {
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4"
    >
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <h4 className="text-sm font-semibold text-amber-900">BSA/AML identity verification</h4>
      </div>
      <p className="text-[11px] text-amber-800/80 mb-3 leading-relaxed">
        Required before any account change. Confirm both elements with Elena, then check them off — I&rsquo;ll
        log that verification was completed by you, the agent.
      </p>

      <ul className="space-y-2">
        {ELEMENTS.map((e) => {
          const on = !!checked[e.id];
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => toggle(e.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors ${
                  on ? 'border-emerald-300 bg-emerald-50' : 'border-border bg-surface hover:border-amber-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                    on ? 'bg-emerald-600 border-emerald-600' : 'border-border bg-surface'
                  }`}
                >
                  {on && <Check className="w-3 h-3 text-white" />}
                </span>
                <div className="min-w-0">
                  <p className={`text-[12px] font-semibold leading-tight ${on ? 'text-emerald-800' : 'text-text-muted'}`}>
                    {e.label}
                  </p>
                  <p className="text-[10px] text-text-muted">{e.hint}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-amber-700/80">
        Required before changes — account change stays locked until verified
      </p>
    </motion.div>
  );
}
