/**
 * RiskHeatmap — charge type against severity.
 *
 * A tinted matrix rather than a chart, because the question it answers is
 * "which cell is big?" and a table answers that with exact counts a colour
 * ramp cannot. The tint carries severity, the number carries magnitude, and
 * nothing is encoded twice.
 *
 * Totals reconcile to the charge-type donut beside it — Discount 6,042, MRC
 * 3,560, Streaming 1,709, OCC 1,322, Loan 811, Tax 547. Two views of one
 * cycle that disagreed would undo the whole argument.
 */
import IllustrativeChip from './IllustrativeChip';
import MaximizablePanel, { MaximizeButton } from '../common/MaximizablePanel';

export default function RiskHeatmap({ rows = [] }) {
  if (!rows.length) return null;

  const grand = rows.reduce(
    (acc, r) => ({
      low: acc.low + r.low,
      medium: acc.medium + r.medium,
      high: acc.high + r.high,
    }),
    { low: 0, medium: 0, high: 0 },
  );
  const grandTotal = grand.low + grand.medium + grand.high;

  const cell = (n, tone) => {
    const style = {
      low: 'bg-emerald-500/10 text-emerald-800',
      medium: 'bg-amber-500/12 text-amber-800',
      high: 'bg-rose-500/12 text-rose-800',
    }[tone];
    return (
      <span className={`inline-block min-w-[56px] rounded px-2.5 py-1 text-[11px] font-semibold tabular-nums ${style}`}>
        {n.toLocaleString()}
      </span>
    );
  };

  return (
    <MaximizablePanel className="p-4 sm:p-5" label="Risk heatmap">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-[13px] font-bold text-text tracking-tight">
          Risk Heatmap — Charge Type vs Severity
        </h3>
        <span className="flex items-center gap-2"><IllustrativeChip /><MaximizeButton /></span>
      </div>

      <div className="overflow-x-auto scrollbar-sleek">
        <table className="w-full min-w-[440px]">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-subtle">Charge Type</th>
              <th className="py-2 px-3 text-center text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Low Risk</th>
              <th className="py-2 px-3 text-center text-[10px] font-semibold uppercase tracking-wider text-amber-700">Medium</th>
              <th className="py-2 px-3 text-center text-[10px] font-semibold uppercase tracking-wider text-rose-700">High Risk</th>
              <th className="py-2 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-text-subtle">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const total = r.low + r.medium + r.high;
              return (
                <tr key={r.chargeType} className="border-b border-border-subtle last:border-0 hover:bg-surface-2/40 transition-colors">
                  <td className="py-2 px-3 text-[12px] font-medium text-text">{r.chargeType}</td>
                  <td className="py-2 px-3 text-center">{cell(r.low, 'low')}</td>
                  <td className="py-2 px-3 text-center">{cell(r.medium, 'medium')}</td>
                  <td className="py-2 px-3 text-center">{cell(r.high, 'high')}</td>
                  <td className="py-2 px-3 text-right text-[12px] font-bold text-text tabular-nums">{total.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-surface-2/50">
              <td className="py-2 px-3 text-[11px] font-bold uppercase tracking-wider text-text-subtle">All</td>
              <td className="py-2 px-3 text-center text-[11.5px] font-bold text-text tabular-nums">{grand.low.toLocaleString()}</td>
              <td className="py-2 px-3 text-center text-[11.5px] font-bold text-text tabular-nums">{grand.medium.toLocaleString()}</td>
              <td className="py-2 px-3 text-center text-[11.5px] font-bold text-text tabular-nums">{grand.high.toLocaleString()}</td>
              <td className="py-2 px-3 text-right text-[12px] font-bold text-text tabular-nums">{grandTotal.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-[10.5px] text-text-subtle mt-3 leading-relaxed">
        Discount carries the most volume and the most high-risk cells, which is why the cycle's largest
        pattern is a discount failure. Tax is the smallest column and still the one to watch — its exposure
        is regulatory, not financial.
      </p>
    </MaximizablePanel>
  );
}
