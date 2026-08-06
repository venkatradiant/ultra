/**
 * AssetHealthCard — the device and equipment health pattern.
 *
 * The third domain pattern this vertical expects, alongside the permit-and-
 * location fusion card and the muster board. Every asset-performance UI in the
 * field carries the same five things, so this carries them too: a health score,
 * a condition or alarm state, remaining useful life or next service, a sensor
 * sparkline, and the source and freshness of each individual reading.
 *
 * The HSE-specific part is the last block. Condition monitoring is normally a
 * maintenance concern; what makes it an HSE concern is that equipment condition
 * changes the risk of the permits *around* it. A compressor trending toward a
 * vibration trip with two hot-work permits inside its exclusion radius is not a
 * maintenance ticket, it is a decision about which permits to pull first — and
 * that link is the reason this card belongs in this product at all.
 */
import { motion } from 'framer-motion';
import { Activity, Wrench, AlertTriangle, ShieldAlert } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getAssets } from '../../data/aramco/hse-gm';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';

const BAND = {
  healthy: { label: 'Healthy', ring: 'border-emerald-300', bar: 'bg-emerald-500', text: 'text-emerald-800', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  watch: { label: 'Watch', ring: 'border-amber-300', bar: 'bg-amber-500', text: 'text-amber-800', chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  degraded: { label: 'Degraded', ring: 'border-rose-300', bar: 'bg-rose-600', text: 'text-rose-800', chip: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const READING_STATE = {
  compliant: 'text-emerald-700',
  attention: 'text-amber-700',
  alarm: 'text-rose-700',
};

/** A sensor sparkline. Inline SVG — 14 points needs no chart library. */
function Sparkline({ series, state }) {
  if (!series?.length) return null;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const w = 88;
  const h = 24;
  const pts = series
    .map((v, i) => `${(i / (series.length - 1)) * w},${h - ((v - min) / span) * (h - 4) - 2}`)
    .join(' ');
  const stroke = state === 'alarm' ? '#BE123C' : state === 'attention' ? '#B45309' : '#059669';
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-[88px] h-6 flex-shrink-0" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <circle
        cx={w}
        cy={h - ((series[series.length - 1] - min) / span) * (h - 4) - 2}
        r="2"
        fill={stroke}
      />
    </svg>
  );
}

function AssetPanel({ asset, index }) {
  const band = BAND[asset.healthBand] || BAND.healthy;
  const alarm = asset.alarmState !== 'normal';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={`rounded-2xl border bg-surface p-4 sm:p-5 ${band.ring}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-text leading-snug">
            {asset.name} <span className="font-mono text-text-muted">{asset.tag}</span>
          </p>
          <p className="text-[11px] text-text-subtle mt-0.5">
            {asset.type} · {asset.zoneName} · {asset.criticality} criticality
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-bold ${band.chip}`}>
          {alarm ? <AlertTriangle className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
          {band.label}
        </span>
      </div>

      {/* Score, alarm state, remaining useful life, next service. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div className="min-w-0">
          <p className={`text-2xl font-bold leading-none tabular-nums ${band.text}`}>{asset.healthScore}</p>
          <p className="text-[10px] text-text-subtle mt-1">Health score / 100</p>
          <div className="mt-1.5 h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${asset.healthScore}%` }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className={`h-full rounded-full ${band.bar}`}
            />
          </div>
        </div>
        <div className="min-w-0">
          <p className={`text-[13px] font-bold leading-snug ${alarm ? 'text-rose-800' : 'text-emerald-800'}`}>
            {asset.alarmLabel}
          </p>
          <p className="text-[10px] text-text-subtle mt-1">Condition / alarm state</p>
          <p className="text-[10px] text-text-muted mt-1.5 leading-snug">{asset.trendNote}</p>
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-text leading-none tabular-nums">
            {asset.remainingUsefulLife.value}
            <span className="text-[12px] font-semibold text-text-muted ml-1">{asset.remainingUsefulLife.unit}</span>
          </p>
          <p className="text-[10px] text-text-subtle mt-1">
            Remaining useful life · {asset.remainingUsefulLife.confidence}% confidence
          </p>
          <p className="text-[10px] text-text-muted mt-1.5 leading-snug">{asset.remainingUsefulLife.basis}</p>
        </div>
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text leading-snug">
            <Wrench className="w-3.5 h-3.5 text-text-subtle" /> {asset.nextService.due}
          </p>
          <p className="text-[10px] text-text-subtle mt-1">Next service</p>
          <p className="text-[10px] text-text-muted mt-1.5 leading-snug">
            {asset.nextService.type} · {asset.nextService.window}
          </p>
        </div>
      </div>

      {/* Readings, each with its own source and freshness. */}
      <div className="mt-4 pt-4 border-t border-border-subtle">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">
          Sensor readings
        </p>
        <ul className="space-y-2">
          {asset.readings.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[11.5px] text-text-muted min-w-[150px]">{r.label}</span>
              <span className={`text-[13px] font-bold tabular-nums min-w-[70px] ${READING_STATE[r.state] || 'text-text'}`}>
                {r.value}
                <span className="text-[10px] font-medium ml-0.5">{r.unit}</span>
              </span>
              <Sparkline series={r.series} state={r.state} />
              <span className="text-[10px] text-text-subtle">{r.threshold}</span>
              <span className="text-[10px] text-text-subtle ml-auto">
                {r.source} · {r.freshness}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Why an HSE product carries an equipment card at all. */}
      {asset.hseImplication && (
        <div className="mt-4 rounded-xl border border-brand/25 bg-brand/[0.045] p-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand mb-1">
            <ShieldAlert className="w-3 h-3" /> What this means for the permits around it
          </p>
          <p className="text-[12px] text-text leading-relaxed">{asset.hseImplication}</p>
          <p className="text-[10.5px] text-text-muted mt-1.5">
            {asset.linkedPermits} open permits within the exclusion radius
            {asset.linkedHighRiskPermits > 0 ? `, ${asset.linkedHighRiskPermits} of them high-risk` : ''}.
          </p>
        </div>
      )}

      <ProvenanceLine className="mt-3" source={asset.sources.join(', ')} />
    </motion.div>
  );
}

/**
 * @param {object} props
 * @param {string} [props.assetId] Defaults to the featured asset.
 * @param {boolean} [props.fleet] Render every asset instead of one.
 */
export default function AssetHealthCard({ getter = getAssets, assetId, fleet = false }) {
  const data = useAsyncData(getter);
  if (!data) return null;

  const assets = fleet
    ? data.assets
    : [data.assets.find((a) => a.id === (assetId || data.featured)) || data.assets[0]];

  return (
    <div className="space-y-3">
      {fleet && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-text-subtle">
            {data.assets.length} monitored assets · {data.note}
          </p>
          <IllustrativeDataChip />
        </div>
      )}
      {assets.map((a, i) => (
        <AssetPanel key={a.id} asset={a} index={i} />
      ))}
      {!fleet && (
        <div className="flex justify-end">
          <IllustrativeDataChip />
        </div>
      )}
    </div>
  );
}
