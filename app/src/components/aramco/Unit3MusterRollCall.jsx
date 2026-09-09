/**
 * Unit3MusterRollCall — accounting for one unit, not the site.
 *
 * Deliberately its own small surface rather than a second `MusterBoard`. The
 * muster fixture models one site-wide drill — five muster points, 2,412 people,
 * a measured 2:47 — and that drill is not happening here. Clearing Unit 3 so a
 * rescue team can work is a different, smaller thing, and rendering it on the
 * site board would have put two contradictory counts on the same screen.
 *
 * The headcount is the zone's own figure from the site fixture, passed in by the
 * panel, so this and the map agree about how many people are in Unit 3. The
 * fixture counts *down* the outstanding rather than up the accounted, which
 * keeps the roll-call correct whatever that zone population happens to be.
 */
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCriticalAlert } from '../../context/CriticalAlertContext';

export default function Unit3MusterRollCall({ expected }) {
  const navigate = useNavigate();
  const { alert, musterStartedAt } = useCriticalAlert();
  const muster = alert.unit3Muster;

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!musterStartedAt) return undefined;
    const tick = () => setElapsed((Date.now() - musterStartedAt) / 1000);
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [musterStartedAt]);

  // The last step whose time has passed. No interpolation — a roll-call updates
  // when someone checks in, not smoothly.
  const step = muster.steps.reduce(
    (best, s) => (elapsed >= s.atSeconds ? s : best),
    muster.steps[0],
  );
  const outstanding = Math.min(step.outstanding, expected);
  const accounted = Math.max(expected - outstanding, 0);
  const pct = expected > 0 ? (accounted / expected) * 100 : 0;
  const complete = outstanding === 0;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-2/60 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
        <div className="min-w-0">
          <h4 className="text-[12px] font-bold text-text flex items-center gap-1.5">
            {complete
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              : <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />}
            Unit 3 muster — {muster.musterPointName}
          </h4>
          <p className="text-[10.5px] text-text-subtle mt-0.5">{muster.note}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-text tabular-nums">
          <Users className="w-3.5 h-3.5 text-text-subtle" />
          {accounted.toLocaleString()} of {expected.toLocaleString()} accounted
        </span>
      </div>

      <div
        className="h-2 rounded-full bg-border overflow-hidden"
        role="progressbar"
        aria-valuenow={accounted}
        aria-valuemin={0}
        aria-valuemax={expected}
        aria-label="Unit 3 muster accounting"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${complete ? 'bg-emerald-500' : 'bg-brand'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
        <p className="text-[11px] text-text-muted">
          {complete
            ? 'Everyone who was working in Unit 3 is accounted for. The unit is clear for the rescue team.'
            : `${outstanding.toLocaleString()} still to check in at ${muster.musterPointName}.`}
        </p>
        <button
          type="button"
          onClick={() => navigate('/muster')}
          className="text-[10.5px] font-semibold text-brand hover:underline cursor-pointer"
        >
          Open full Muster Status
        </button>
      </div>
    </div>
  );
}
