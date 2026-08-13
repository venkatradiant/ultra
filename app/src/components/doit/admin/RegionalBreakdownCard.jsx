import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DoitCard from '../shared/DoitCard';
import { AiDisclaimer, ConfidenceBadge } from '../shared/TrustBits';
import { REGIONAL_BREAKDOWN } from '../../../data/doit/_shared/constants';

/**
 * Wait-time complaints by region.
 *
 * The outlier is the finding, so it is marked in the bar colour AND in a label
 * rather than left for the reader to spot: Western is nineteen points clear of
 * the next region, which is what turns "wait times are a problem" into a
 * recommendation with an address on it.
 */
function RegionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-text">{row.region} region</p>
      <p className="text-[11px] text-text-muted">
        <span className="font-semibold tabular-nums text-text">{row.pct}%</span> of open-text cites wait times
      </p>
      {row.outlier && <p className="text-[10.5px] font-semibold text-warning">Outlier</p>}
    </div>
  );
}

export default function RegionalBreakdownCard() {
  const data = [...REGIONAL_BREAKDOWN];

  return (
    <DoitCard
      eyebrow="Wait-time complaints by region"
      intro="Share of open-text responses citing wait times, across the surveys in scope."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AiDisclaimer />
          <ConfidenceBadge score={90} />
        </div>
      }
    >
      <div className="h-[164px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 74, bottom: 4, left: 0 }}>
            <XAxis type="number" domain={[0, 70]} hide />
            <YAxis
              type="category"
              dataKey="region"
              width={72}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11.5, fill: 'var(--color-text-muted)' }}
            />
            <Tooltip cursor={{ fill: 'var(--color-surface-2)' }} content={<RegionTooltip />} />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={22}>
              {data.map((row) => (
                <Cell key={row.region} fill={row.outlier ? 'var(--color-warning)' : 'var(--color-chart-1)'} />
              ))}
              <LabelList
                dataKey="pct"
                position="right"
                formatter={(v) => `${v}%`}
                style={{ fontSize: 11.5, fill: 'var(--color-text)', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px] leading-relaxed text-text">
        <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-warning">
          Outlier
        </span>
        Western is 19 points clear of Central and nearly double Northern. Whatever is happening with
        wait times, it is concentrated there.
      </p>
    </DoitCard>
  );
}
