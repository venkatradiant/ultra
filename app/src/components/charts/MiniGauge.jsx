import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

/**
 * Half-donut gauge. Extracted verbatim from RegulatoryGaugePanel (where it was
 * module-local) so the NFCU layer-health gauges reuse it instead of adding a
 * third gauge implementation to the codebase — there was already a duplicate
 * hand-rolled SVG arc in NFCUQualityCards.
 *
 * Props: { score, status: 'green'|'amber'|'red', size = 64, label? }
 */
export const STATUS_COLORS = {
  green: '#16A34A',
  amber: '#D97706',
  red: '#DC2626',
};

/** Health % → gauge status band. */
export function statusForScore(score) {
  if (score >= 90) return 'green';
  if (score >= 75) return 'amber';
  return 'red';
}

export default function MiniGauge({ score, status, size = 64 }) {
  const data = [
    { value: score },
    { value: 100 - score },
  ];
  return (
    <div className="relative" style={{ width: size, height: size / 2 + 4 }}>
      <ResponsiveContainer width="100%" height={size}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={size * 0.32}
            outerRadius={size * 0.48}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={STATUS_COLORS[status]} />
            <Cell fill="#E5E7EB" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="text-sm font-bold" style={{ color: STATUS_COLORS[status] }}>{score}</span>
      </div>
    </div>
  );
}
