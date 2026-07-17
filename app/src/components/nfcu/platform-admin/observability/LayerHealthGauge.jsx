import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

/**
 * Half-donut gauge for the Layer Health card. CR-02.
 *
 * WHY THIS EXISTS RATHER THAN REUSING @/components/charts/MiniGauge:
 * MiniGauge has a geometry bug — it sizes its box to `size/2 + 4` but draws a
 * `size`-tall SVG with `cy="100%"`, so the arc renders at y ∈ [0.52·size, size]:
 * ~24px outside its own container, with the value (`absolute bottom-0`) landing
 * on the stroke. That is exactly the collision CR-02 reports.
 *
 * MiniGauge is shared with RegulatoryGaugePanel, which belongs to the *shared*
 * risk persona used by PenFed / USSFCU / financial-services. Fixing it in place
 * would change three other clients' Risk pages, which is out of scope for an
 * NFCU-only change set. So Daniel owns his gauge and MiniGauge is left alone.
 * (The same latent bug still exists there — logged separately.)
 *
 * Geometry here is honest: the arc's baseline sits at `size/2` from the top, so
 * the half-donut occupies y ∈ [size/2 - 0.48·size, size/2] — the top half of the
 * box — and the value gets its own band underneath. `height` and `cy` must stay
 * in agreement if either is touched.
 *
 * Props: { score, status: 'green'|'amber'|'red', size = 56 }
 */
const STATUS_COLORS = {
  green: '#16A34A',
  amber: '#D97706',
  red: '#DC2626',
};

const TRACK = '#E5E7EB';

/** Vertical band reserved for the value beneath the arc (text-sm + breathing). */
const LABEL_H = 18;
/** Clear air between the arc's baseline and the top of the value. */
const GAP = 3;

export default function LayerHealthGauge({ score, status, size = 56 }) {
  const colour = STATUS_COLORS[status] ?? STATUS_COLORS.green;
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const data = [{ value: clamped }, { value: 100 - clamped }];
  const baseline = size / 2;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: baseline + GAP + LABEL_H }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* margin 0 is load-bearing: PieChart defaults to a 5px margin, which
            offsets the plot area and silently renders `cy` 5px lower than asked
            — enough to push the arc back onto the value. */}
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy={baseline}
            startAngle={180}
            endAngle={0}
            innerRadius={size * 0.32}
            outerRadius={size * 0.48}
            dataKey="value"
            stroke="none"
            // The arc must never depend on an animation frame firing: recharts
            // renders zero sectors until its mount animation runs, and a
            // backgrounded/throttled tab can leave the gauge permanently blank.
            isAnimationActive={false}
          >
            <Cell fill={colour} />
            <Cell fill={TRACK} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div
        className="absolute inset-x-0 text-center leading-none"
        style={{ top: baseline + GAP, height: LABEL_H }}
      >
        <span className="text-sm font-bold tabular-nums" style={{ color: colour }}>{score}</span>
      </div>
    </div>
  );
}
