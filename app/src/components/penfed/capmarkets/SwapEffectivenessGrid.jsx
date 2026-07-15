import swaps from '../../../data/penfed/capmarkets/swaps.json';

const pct = (n) => `${(n * 100).toFixed(1)}%`;
const usdM = (n) => `$${(n / 1e6).toFixed(0)}M`;

const statusColor = {
  fails_80: { bar: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'FAILS' },
  near_threshold: { bar: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', label: 'NEAR' },
  ok: { bar: 'bg-emerald-500', text: 'text-text-muted', badge: 'bg-emerald-50 text-emerald-700', label: 'OK' },
};

export default function SwapEffectivenessGrid() {
  return (
    <div className="bg-surface-2 rounded-xl p-4 border border-border-subtle">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs font-semibold text-text-muted">
          Swap Portfolio Effectiveness — 12 Active Positions
        </p>
        <p className="text-[10px] text-text-subtle">
          Portfolio: {pct(swaps.portfolio_effectiveness_current)} (was {pct(swaps.portfolio_effectiveness_prior)})
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {swaps.positions.map((p) => {
          const c = statusColor[p.status];
          const widthPct = Math.min(100, Math.max(40, p.effectiveness * 100));
          return (
            <div key={p.id} className="bg-surface rounded-lg p-2 border border-border-subtle">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-text-muted">{p.id}</p>
                <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${c.badge}`}>{c.label}</span>
              </div>
              <p className={`text-[14px] font-bold leading-none ${c.text}`}>{pct(p.effectiveness)}</p>
              <p className="text-[9px] text-text-subtle mt-0.5">{p.tenor} • {usdM(p.notional_usd)} • {p.entered}</p>
              <div className="mt-1.5 h-1 bg-surface-2 rounded overflow-hidden relative">
                <div className={`h-full ${c.bar}`} style={{ width: `${widthPct}%` }} />
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-400"
                  style={{ left: `${swaps.fasb_minimum * 100}%` }}
                  title="FASB 80%"
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-text-subtle mt-3">
        Yield curve steepening: +{swaps.yield_curve_2_10_steepening_bps_since_march} bps (2y-10y) since March. At-risk P&L if de-designated:{' '}
        <span className="font-semibold text-red-600">{usdM(swaps.at_risk_pnl_if_dedesignated_usd)}</span>.
      </p>
    </div>
  );
}
