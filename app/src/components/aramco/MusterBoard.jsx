/**
 * MusterBoard — live accounting by zone.
 *
 * Light-surfaced, consistent with every other page. The alarm state is carried
 * by a single dark critical panel (the unaccounted count) rather than by
 * inverting the whole screen: during a muster the GM is scanning for the one
 * number that is wrong, and a uniformly dark board makes every number equally
 * loud. Dark is reserved for the thing that is actually critical.
 *
 * Counts resolve against the reconciled headcount, not the gate figure, so the
 * muster starts from a number that has already been defended.
 */
import { motion } from 'framer-motion';
import { Siren, MapPin, TrendingUp, Users, CheckCircle2, Timer } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getMuster } from '../../data/aramco/hse-gm';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';
import MusterControlCenter from './MusterControlCenter';
import MaximizablePanel, { MaximizeButton } from '../common/MaximizablePanel';

const PRIORITY_STYLE = {
  high: { wrap: 'border-rose-300 bg-rose-50', tone: 'text-rose-800', num: 'text-rose-800', dot: 'bg-rose-600' },
  medium: { wrap: 'border-amber-300 bg-amber-50', tone: 'text-amber-800', num: 'text-amber-800', dot: 'bg-amber-500' },
  low: { wrap: 'border-border bg-surface-2', tone: 'text-text-muted', num: 'text-text', dot: 'bg-slate-400' },
};

/**
 * Entity–muster-zone allocation bands, exactly as the deployed console defines
 * them. They answer a different question from "is this point complete": a point
 * at 96% of *capacity* is a crush risk even when every expected person has
 * arrived, and that is a decision the incident commander has to make while the
 * drill is still running rather than in the debrief.
 */
const LOAD_BANDS = [
  { max: 50, label: 'Optimal', swatch: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-700' },
  { max: 80, label: 'Moderate', swatch: 'bg-amber-400', bar: 'bg-amber-400', text: 'text-amber-700' },
  { max: 100, label: 'High', swatch: 'bg-orange-500', bar: 'bg-orange-500', text: 'text-orange-700' },
  { max: Infinity, label: 'Overloaded', swatch: 'bg-rose-600', bar: 'bg-rose-600', text: 'text-rose-700' },
];

const bandFor = (loadPct) => LOAD_BANDS.find((b) => loadPct <= b.max);

export default function MusterBoard({ getter = getMuster }) {
  const muster = useAsyncData(getter);
  if (!muster) return null;

  const pct = Math.round((muster.accounted / muster.total) * 100);

  return (
    <MaximizablePanel className="p-4 sm:p-5" label="Muster status">
      {/* Header — the alarm state is stated, not painted across the whole page. */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 border border-rose-300 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-800 mb-2">
            <Siren className="w-3.5 h-3.5 animate-pulse" />
            {muster.stateLabel}
          </p>
          <h3 className="text-sm font-semibold text-text">Muster Status by Zone</h3>
          <ProvenanceLine
            className="mt-1"
            source="Gate access-control, Location and tag data (vendor-agnostic), CCTV and presence"
            freshness={`live · elapsed ${muster.elapsedSeconds} seconds`}
            reconciled
            note={`Counting against the reconciled headcount of ${muster.total.toLocaleString()}, not the gate figure.`}
          />
        </div>
        <span className="flex items-center gap-2"><IllustrativeDataChip /><MaximizeButton /></span>
      </div>

      {/* Headline accounting */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="sm:col-span-2 rounded-xl border border-border-subtle bg-surface-2 p-4 min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">
            <Users className="w-3 h-3" /> Accounted for
          </p>
          <p className="text-4xl font-bold text-text leading-none">
            {muster.accounted.toLocaleString()}
            <span className="text-lg font-semibold text-text-subtle"> / {muster.total.toLocaleString()}</span>
          </p>
          <div className="mt-3 h-2.5 rounded-full bg-border overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
          <p className="text-[11px] text-text-muted mt-1.5">
            {pct}% accounted in the first {muster.elapsedSeconds} seconds
          </p>
        </div>

        {/* THE dark surface. One panel, for the one thing that is critical. */}
        <div className="rounded-xl border border-[#7F1D2E] bg-[#4C0D1C] p-4 min-w-0 text-white shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-200 mb-2">Unaccounted</p>
          <p className="text-4xl font-bold leading-none">{muster.unaccounted}</p>
          <p className="text-[11px] text-rose-100/80 mt-2 leading-snug">
            All from the earlier reconciliation gap — no new gaps opened at the alarm.
          </p>
        </div>
      </div>

      <div className="mb-5">
        <MusterControlCenter muster={muster} />
      </div>

      {/* Per-zone accounting */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">
          Entity — muster zone allocation
        </p>
        <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
          {LOAD_BANDS.map((b, i) => (
            <span key={b.label} className="inline-flex items-center gap-1.5 text-[10px] text-text-muted">
              <span className={`w-2.5 h-2.5 rounded-sm ${b.swatch}`} />
              {i === 0 ? '0–50%' : i === 1 ? '51–80%' : i === 2 ? '81–100%' : '>100%'} ({b.label})
            </span>
          ))}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 mb-5">
        {muster.zones.map((z, i) => {
          const zonePct = Math.round((z.accounted / z.expected) * 100);
          const complete = z.accounted === z.expected;
          const loadPct = z.capacity ? Math.round((z.accounted / z.capacity) * 100) : null;
          const band = loadPct === null ? null : bandFor(loadPct);
          return (
            <motion.div
              key={z.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={`rounded-xl border p-3 min-w-0 ${
                complete ? 'border-emerald-200 bg-emerald-50/50' : 'border-border-subtle bg-surface-2'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-semibold text-text truncate min-w-0">{z.name}</p>
                {complete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />}
              </div>
              <p className="text-[10px] text-text-subtle truncate mt-0.5">{z.coversZones.join(' · ')}</p>
              <p className="text-xl font-bold text-text leading-none mt-2">
                {z.accounted.toLocaleString()}
                <span className="text-[12px] font-semibold text-text-subtle"> / {z.expected.toLocaleString()}</span>
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${zonePct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
                  className={`h-full rounded-full ${complete ? 'bg-emerald-500' : 'bg-amber-500'}`}
                />
              </div>
              <p className="text-[10.5px] text-text-muted mt-1.5">
                {complete ? 'All accounted' : `${z.expected - z.accounted} outstanding`}
              </p>

              {/* Assigned / capacity / available, and the load band. */}
              {band && (
                <div className="mt-2.5 pt-2.5 border-t border-border-subtle">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] text-text-subtle">
                      {z.accounted.toLocaleString()} assigned · {z.capacity.toLocaleString()} capacity ·{' '}
                      {(z.capacity - z.accounted).toLocaleString()} available
                    </span>
                    <span className={`text-[10.5px] font-bold ${band.text}`}>{loadPct}%</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(loadPct, 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
                      className={`h-full rounded-full ${band.bar}`}
                    />
                  </div>
                  <p className={`text-[10px] font-semibold mt-1 ${band.text}`}>{band.label} load</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Unaccounted, with last-known location */}
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">
        Unaccounted — last known location
      </p>
      <div className="space-y-2 mb-4">
        {muster.unaccountedGroups.map((g) => {
          const style = PRIORITY_STYLE[g.priority] || PRIORITY_STYLE.low;
          return (
            <div key={g.id} className={`rounded-xl border p-3 ${style.wrap}`}>
              <div className="flex items-start gap-3 min-w-0">
                <span className={`text-2xl font-bold leading-none flex-shrink-0 w-10 ${style.num}`}>{g.count}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-text leading-snug">{g.label}</p>
                  <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">{g.detail}</p>
                  <p className={`inline-flex items-center gap-1 text-[10.5px] font-medium mt-1 ${style.tone}`}>
                    <MapPin className="w-3 h-3" /> {g.lastKnown}
                  </p>
                </div>
                {g.priority === 'high' && (
                  <span className="flex-shrink-0 rounded-full bg-rose-700 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white">
                    Eyes-on first
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Projection */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
        <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-emerald-900">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Full accounting projected in about {muster.projection.fullAccountingMinutes} minutes
        </p>
        <p className="text-[10.5px] text-emerald-800/80">
          {muster.projection.basis} · confidence {muster.projection.confidence}%
        </p>
      </div>

      {/* Measured completion — this closes an open follow-up from the intake,
          where the last drill's time existed only as "felt too long". */}
      {muster.measuredCompletion && (
        <div className="rounded-xl border border-border-subtle bg-surface-2 p-3.5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">
              Measured completion — this drill
            </p>
            <p className="text-xl font-bold text-text leading-none">{muster.measuredCompletion.label}</p>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-emerald-800">
              <Timer className="w-2.5 h-2.5" /> Target {muster.measuredCompletion.target}
            </span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">{muster.measuredCompletion.basis}</p>
          <p className="text-[10.5px] text-text-subtle italic leading-relaxed mt-1">
            Prior drill: {muster.measuredCompletion.priorDrill} {muster.measuredCompletion.note}
          </p>
        </div>
      )}
    </MaximizablePanel>
  );
}
