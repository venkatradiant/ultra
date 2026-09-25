import { CheckCircle2, ArrowRight } from 'lucide-react';
import FinanceCard, { StatusPill } from './FinanceCard';
import { getCapitalLiquidity } from '../../../data/ussfcu/finance';
import { fmtM, fmtPct } from '../../../data/ussfcu/finance/constants';

/**
 * Step 5 · Friction Observability — "Capital-ratio and liquidity gauges before
 * and after, loan-to-share against the funding-review trigger, and a small
 * reconciliation panel tying the capital figure to its three sources."
 *
 * Each gauge is the spec §13 risk read with a gauge in place of the
 * sparkline: the value before and after, its limit line, the headroom left,
 * and the source and freshness. Loan-to-share moves toward the trigger and
 * stays below it (the spoken "toward").
 */
const TONE = {
  success: 'bg-success-subtle text-success border-success/20',
  warning: 'bg-warning-subtle text-warning border-warning/20',
};

function Gauge({ title, min, max, before, after, line, lineLabel, format, status, tone, source, lineTone = 'var(--color-critical)' }) {
  const r = 52;
  const cx = 64;
  const cy = 62;
  const angle = (v) => Math.PI * (1 - (Math.min(Math.max(v, min), max) - min) / (max - min));
  const pt = (v, rr = r) => [cx + rr * Math.cos(angle(v)), cy - rr * Math.sin(angle(v))];
  const arc = (from, to) => {
    const [x1, y1] = pt(from);
    const [x2, y2] = pt(to);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  const [ax, ay] = pt(after, r - 10);
  const [bx1, by1] = pt(before, r - 7);
  const [bx2, by2] = pt(before, r + 7);
  const [lx1, ly1] = pt(line, r - 9);
  const [lx2, ly2] = pt(line, r + 9);
  // The zone beyond the limit line, drawn as a faint band on the track.
  const dangerFrom = line <= (min + max) / 2 ? min : line;
  const dangerTo = line <= (min + max) / 2 ? line : max;

  return (
    <div className="min-w-0 rounded-lg border border-border-subtle bg-surface p-3">
      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-subtle">{title}</p>
      <svg viewBox="0 0 128 72" className="mx-auto mt-1 w-full max-w-[190px]" role="img" aria-label={`${title}: ${format(before)} before, ${format(after)} after`}>
        <path d={arc(min, max)} fill="none" stroke="var(--color-surface-2)" strokeWidth="10" strokeLinecap="round" />
        {dangerTo > dangerFrom ? (
          <path d={arc(dangerFrom, dangerTo)} fill="none" stroke={lineTone} strokeOpacity="0.18" strokeWidth="10" />
        ) : null}
        <path d={arc(min, after)} fill="none" stroke="var(--color-brand)" strokeWidth="10" strokeLinecap="round" opacity="0.85" />
        <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={lineTone} strokeWidth="2" />
        <line x1={bx1} y1={by1} x2={bx2} y2={by2} stroke="var(--color-text-subtle)" strokeWidth="2" strokeDasharray="2 1.5" />
        <line x1={cx} y1={cy} x2={ax} y2={ay} stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="3" fill="var(--color-text)" />
      </svg>
      <div className="mt-0.5 flex items-center justify-center gap-1.5 tabular-nums">
        <span className="text-[12px] text-text-subtle">{format(before)}</span>
        <ArrowRight className="h-3 w-3 text-text-subtle" />
        <span className="text-[18px] font-bold leading-none text-text">{format(after)}</span>
      </div>
      <p className="mt-1 text-center text-[10px] text-text-muted">{lineLabel}</p>
      <div className="mt-1.5 flex justify-center">
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${TONE[tone]}`}>{status}</span>
      </div>
      <p className="mt-1.5 text-center text-[9.5px] text-text-subtle">{source} · Overnight scan</p>
    </div>
  );
}

export default function CapitalLiquidityGauges({ eyebrow = 'Friction Observability' }) {
  const c = getCapitalLiquidity();
  return (
    <FinanceCard
      eyebrow={eyebrow}
      title="Capital and liquidity cushion · before and after the 30-day shutdown"
      aside={<StatusPill tone="success">Still well capitalized</StatusPill>}
      footnote="Dashed tick: before the shutdown. Needle: after. Sources: Symitar, Cornerstone, UST Finex (capital position, liquidity, ALM)."
    >
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Gauge
          title="Net worth ratio"
          min={6.5}
          max={8}
          before={c.netWorthBefore}
          after={c.netWorthAfter}
          line={c.earlyWarning}
          lineLabel={`Early-warning line ${fmtPct(c.earlyWarning)}`}
          format={(v) => fmtPct(v, v === c.netWorthBefore ? 2 : 1)}
          status={`${(c.netWorthAfter - c.earlyWarning).toFixed(1)} pts above the line`}
          tone="success"
          source="Cornerstone + GL"
        />
        <Gauge
          title="Liquidity to spare, quarter"
          min={0}
          max={100}
          before={c.liquiditySurplusBefore}
          after={c.liquiditySurplus}
          line={0}
          lineLabel="Covers projected quarter outflows"
          format={(v) => fmtM(v)}
          status="Positive coverage"
          tone="success"
          source="UST Finex"
        />
        <Gauge
          title="Loan-to-share"
          min={80}
          max={90}
          before={c.loanToShareBefore}
          after={c.loanToShareAfter}
          line={c.trigger}
          lineLabel={`Funding-review trigger ${c.trigger}%`}
          format={(v) => `${v}%`}
          status={`${c.trigger - c.loanToShareAfter} pt below the trigger`}
          tone="warning"
          source="Symitar + GL"
          lineTone="var(--color-warning)"
        />
      </div>

      <p className="mb-3 rounded-lg border border-warning/25 bg-warning-subtle/50 px-3 py-2 text-[11px] leading-relaxed text-text">
        <span className="font-semibold text-warning">Pressure point: </span>
        deposit outflow concentrated in a few Senate-community payroll groups pushes loan-to-share toward the trigger.
      </p>

      <div className="rounded-lg border border-success/25 bg-success-subtle/40 p-3">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-success">
          <CheckCircle2 className="h-3.5 w-3.5" /> Capital position reconciled across three sources
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {c.reconciliation.map((s) => (
            <div key={s.id} className="min-w-0 rounded-md border border-success/20 bg-surface px-2.5 py-2">
              <p className="text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">{s.layer}</p>
              <p className="truncate text-[11px] font-medium text-text" title={s.system}>{s.system}</p>
              <p className="mt-1 flex items-baseline justify-between gap-2 tabular-nums">
                <span className="text-[13px] font-bold text-text">{fmtM(s.netWorth, 2)}</span>
                <span className="text-[11px] text-text-muted">{fmtPct(s.ratio, 2)}</span>
              </p>
              <span className="mt-1 inline-flex"><StatusPill tone="success">Matched</StatusPill></span>
            </div>
          ))}
        </div>
      </div>
    </FinanceCard>
  );
}
