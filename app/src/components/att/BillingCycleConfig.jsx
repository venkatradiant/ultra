/**
 * BillingCycleConfig — the cycle, the SLA window, the active instance.
 *
 * Three fields, one of which has a much wider blast radius than the other two:
 * shortening the BRN window tightens every operator's cycle at once, across
 * every instance. The panel says so next to the input, because a number field
 * that looks like the other number fields gives no clue which one is dangerous.
 */
import { useState } from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

function Field({ label, note, children }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-2/40 p-3.5">
      <label className="block text-[12px] font-semibold text-text mb-2">{label}</label>
      {children}
      <p className="text-[10.5px] text-text-subtle mt-2 leading-snug">{note}</p>
    </div>
  );
}

const INPUT = 'w-full rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] text-text focus:outline-none focus:border-brand/40';

export default function BillingCycleConfig({ config }) {
  const [cycle, setCycle] = useState(config?.cycle ?? '');
  const [slaHours, setSlaHours] = useState(config?.slaHours ?? 36);
  const [instance, setInstance] = useState(config?.instance ?? '');

  if (!config) return null;
  const copy = config.copy || {};
  const slaChanged = slaHours !== config.slaHours;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text tracking-tight">
            <Calendar className="w-4 h-4 text-brand" /> Billing Cycle Configuration
          </h3>
          <p className="text-[11px] text-text-subtle mt-0.5">Cycle schedules and SLA windows.</p>
        </div>
        <IllustrativeChip />
      </div>

      <div className="space-y-3">
        <Field label="Current Billing Cycle" note={copy.cycle}>
          <input value={cycle} onChange={(e) => setCycle(e.target.value)} className={INPUT} />
        </Field>

        <Field label="BRN SLA Window" note={copy.sla}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={168}
              value={slaHours}
              onChange={(e) => setSlaHours(Number(e.target.value))}
              className={`${INPUT} flex-1`}
            />
            <span className="text-[12px] text-text-subtle flex-shrink-0">hours</span>
          </div>
          {slaChanged && (
            <p className="inline-flex items-start gap-1.5 text-[10.5px] text-amber-800 mt-2 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 mt-px flex-shrink-0" />
              This applies to all 12 operators across all 3 instances at once — the broadest-reaching
              setting on this console.
            </p>
          )}
        </Field>

        <Field label="Active Instance" note={copy.instance}>
          <select
            value={instance}
            onChange={(e) => setInstance(e.target.value)}
            className={`${INPUT} cursor-pointer`}
          >
            {config.instances.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}
