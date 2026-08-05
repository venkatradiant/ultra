/**
 * PermitDetailCard — confined-space entry CS-1182.
 *
 * The Phase 2 moment from the journey map: "is this confined-space entry
 * actually set up the way the permit says?" Every permit condition is shown
 * with what is verifying it right now and how fresh that verification is, so a
 * condition that has silently stopped being true cannot hide.
 */
import { CheckCircle2, AlertCircle, Timer, Users, ShieldCheck, Radio } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getPermits } from '../../data/aramco/hse-gm';
import RiskBucketBadge from './RiskBucketBadge';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';

const CONDITION_STATE = {
  compliant: { icon: CheckCircle2, wrap: 'border-emerald-200 bg-emerald-50/50', tone: 'text-emerald-700', label: 'Compliant' },
  attention: { icon: AlertCircle, wrap: 'border-amber-200 bg-amber-50/60', tone: 'text-amber-700', label: 'Needs attention' },
  breached: { icon: AlertCircle, wrap: 'border-rose-200 bg-rose-50/60', tone: 'text-rose-700', label: 'Breached' },
};

export default function PermitDetailCard({ getter = getPermits, compact = false }) {
  const permits = useAsyncData(getter);
  if (!permits) return null;

  const cs = permits.confinedSpace;
  const { occupancy, gasTest, standby } = cs;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-text">
              {cs.id} — {cs.title}
            </h3>
            <RiskBucketBadge bucket={cs.bucket} size="sm" />
          </div>
          <p className="text-[11.5px] text-text-muted">
            {cs.location} · valid {cs.validFrom}–{cs.validTo} · issued by {cs.issuer} · work order {cs.workOrder}
          </p>
        </div>
        <IllustrativeDataChip />
      </div>

      {/* Live status strip — occupancy, gas test, standby */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-border-subtle bg-surface-2 p-3.5 min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-1.5">
            <Users className="w-3 h-3" /> Occupancy
          </p>
          <p className="text-2xl font-bold text-text leading-none">
            {occupancy.inside}
            <span className="text-sm font-semibold text-text-subtle"> / {occupancy.max}</span>
          </p>
          <p className="text-[10.5px] text-text-muted mt-1">Entrants inside · permitted maximum {occupancy.max}</p>
        </div>

        <div
          className={`rounded-xl border p-3.5 min-w-0 ${
            gasTest.dueInMinutes <= 2 ? 'border-amber-200 bg-amber-50/60' : 'border-border-subtle bg-surface-2'
          }`}
        >
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-1.5">
            <Timer className="w-3 h-3" /> Gas test
          </p>
          <p className="text-2xl font-bold text-text leading-none">
            {gasTest.dueInMinutes}
            <span className="text-sm font-semibold text-text-subtle"> min</span>
          </p>
          <p className="text-[10.5px] text-text-muted mt-1">
            Until next test due · last reading {gasTest.lastReading.toLowerCase()}, {gasTest.lastTestMinutesAgo} min ago
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-1.5">
            <ShieldCheck className="w-3 h-3" /> Standby person
          </p>
          <p className="text-lg font-bold text-emerald-700 leading-none capitalize">{standby.state}</p>
          <p className="text-[10.5px] text-text-muted mt-1">{standby.role} at the entry point</p>
        </div>
      </div>

      {/* Permit conditions, each with what is verifying it */}
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">Permit conditions</p>
      <div className="space-y-2 mb-4">
        {cs.conditions.map((c) => {
          const state = CONDITION_STATE[c.state] || CONDITION_STATE.compliant;
          const Icon = state.icon;
          return (
            <div key={c.id} className={`flex items-start gap-2.5 rounded-xl border p-3 ${state.wrap}`}>
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${state.tone}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-text">{c.label}</span>
                  <span className={`text-[9.5px] font-bold uppercase tracking-wide ${state.tone}`}>{state.label}</span>
                </div>
                <p className="text-[11.5px] text-text-muted leading-relaxed mt-0.5">{c.detail}</p>
                <ProvenanceLine className="mt-1" source={c.sources.join(', ')} freshness={c.freshness} />
              </div>
            </div>
          );
        })}
      </div>

      {!compact && (
        <>
          {/* Standby verification — the condition that most often fails silently */}
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">Standby verification</p>
          <ul className="space-y-1 mb-4">
            {standby.confirmedBy.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-[11.5px] text-text-muted">
                <Radio className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                {line}
              </li>
            ))}
          </ul>

          {/* Entrants + log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">Entrants</p>
              <div className="space-y-1.5">
                {cs.entrants.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-2 px-3 py-2"
                  >
                    <span className="text-[12px] font-medium text-text min-w-0 truncate">
                      {e.label} · {e.company}
                    </span>
                    <span className="text-[10.5px] text-text-subtle flex-shrink-0">
                      In {e.enteredAt}
                      {e.inside ? ' · inside' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">Entry and exit log</p>
              <ol className="space-y-1">
                {cs.entryExitLog
                  .slice()
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((entry, i) => (
                    <li key={i} className="flex gap-2 text-[11px] min-w-0">
                      <span className="font-mono font-semibold text-text-muted flex-shrink-0">{entry.time}</span>
                      <span className="text-text-muted min-w-0">
                        {entry.actor} — {entry.event}
                        {entry.note && <span className="block text-text-subtle italic">{entry.note}</span>}
                      </span>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
