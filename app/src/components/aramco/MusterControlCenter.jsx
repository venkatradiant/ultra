/**
 * MusterControlCenter — the live drill panel.
 *
 * Lifted from the deployed TrackLynk (Synapse) console, which runs a muster
 * from a single side panel: three colour-coded progress rows (not yet started /
 * started mustering / mustered), a progress ring, in/out/total counters, and a
 * running duration. That layout is worth copying rather than reinventing
 * because of what it does to the question being asked.
 *
 * A board that says "28 unaccounted" states a failure. The same 28 split into
 * *nine who have not moved* and *nineteen who are moving* states a search plan,
 * and those are very different instructions to give a warden at minute two of a
 * drill. The split is not new data — it is the existing unaccounted groups read
 * as progress states instead of as one bucket.
 *
 * The one deliberate departure: the console's IN/OUT/TOTAL counts tag reads at
 * the gate. Here they count gate movements *since the alarm*, which during a
 * lockdown should be zero — and zero is the assertion that matters, because it
 * is what makes the denominator trustworthy.
 */
import { motion } from 'framer-motion';
import { Radio, LogIn, LogOut, Timer } from 'lucide-react';

const ROWS = [
  { key: 'notStarted', label: 'not yet started', wrap: 'border-l-rose-500 bg-rose-50/70', text: 'text-rose-900' },
  { key: 'mustering', label: 'started mustering', wrap: 'border-l-sky-500 bg-sky-50/70', text: 'text-sky-900' },
  { key: 'mustered', label: 'mustered', wrap: 'border-l-emerald-500 bg-emerald-50/70', text: 'text-emerald-900' },
];

/** Progress ring. Inline SVG — one arc needs no chart library. */
function Ring({ pct }) {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="relative w-[88px] h-[88px] flex-shrink-0">
      <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#E2E8F0" strokeWidth="9" />
        <motion.circle
          cx="44" cy="44" r={r} fill="none" stroke="#059669" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold text-text tabular-nums">
        {pct}%
      </span>
    </div>
  );
}

function Counter({ Icon, label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface px-3 py-2">
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle">
        <Icon className="w-3 h-3" /> {label}
      </span>
      <span className={`text-[15px] font-bold tabular-nums ${tone}`}>
        {String(value).padStart(2, '0')}
      </span>
    </div>
  );
}

/**
 * @param {object} props
 * @param {object} props.muster The muster fixture (needs `control` and `total`).
 */
export default function MusterControlCenter({ muster }) {
  const c = muster?.control;
  if (!c) return null;

  const pct = Math.round((c.mustered / muster.total) * 100);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-2 overflow-hidden">
      <div className="flex items-center justify-between gap-3 bg-slate-900 px-4 py-2.5">
        <p className="inline-flex items-center gap-2 text-[12px] font-bold text-white tracking-tight">
          <Radio className="w-3.5 h-3.5" /> Muster Control Center
        </p>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {c.status === 'running' ? 'Running' : 'Stopped'}
        </span>
      </div>

      <div className="p-4 space-y-2.5">
        {ROWS.map((row, i) => (
          <motion.div
            key={row.key}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className={`flex items-center gap-2.5 rounded-lg border border-border-subtle border-l-4 px-3 py-2 ${row.wrap}`}
          >
            <span className={`text-[15px] font-bold tabular-nums ${row.text}`}>
              {c[row.key].toLocaleString()}
            </span>
            <span className={`text-[12px] ${row.text}`}>{row.label}</span>
          </motion.div>
        ))}

        <div className="flex flex-wrap items-center gap-4 pt-1.5">
          <Ring pct={pct} />
          <div className="min-w-[150px] space-y-1.5">
            <Counter Icon={LogIn} label="In" value={c.gateMovementsIn} tone="text-emerald-700" />
            <Counter Icon={LogOut} label="Out" value={c.gateMovementsOut} tone="text-rose-700" />
          </div>
          <p className="text-[11px] text-text-muted leading-snug flex-1 min-w-[180px]">
            <span className="font-semibold text-text">Mustering progress</span> against the
            reconciled headcount of {muster.total.toLocaleString()}.
          </p>
        </div>
        <p className="text-[10px] text-text-subtle leading-snug">
          In and out count gate movements since the alarm — {c.lockdownNote}
        </p>

        <p className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-text pt-1">
          <Timer className="w-3.5 h-3.5 text-text-subtle" /> Duration: {c.durationLabel}
        </p>
      </div>
    </div>
  );
}
