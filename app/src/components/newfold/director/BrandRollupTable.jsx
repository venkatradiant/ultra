import metrics from '../../../data/newfold-digital/director/metrics.json';
import { useBrand } from '../../../context/BrandContext';

// Map the brand-selector ids to the brand names used in the roll-up data.
const BRAND_NAME = {
  bluehost: 'Bluehost',
  network_solutions: 'Network Solutions',
  web_com: 'Web.com',
  hostgator: 'HostGator',
  crazy_domains: 'Crazy Domains',
};

const slColor = (sl) => {
  const v = parseInt(sl);
  if (v >= 80) return 'text-emerald-600';
  if (v >= 72) return 'text-amber-600';
  return 'text-red-600';
};

const statusStyle = {
  critical: { dot: 'bg-red-500', label: 'Critical', text: 'text-red-600' },
  warning: { dot: 'bg-amber-500', label: 'Warning', text: 'text-amber-600' },
  healthy: { dot: 'bg-emerald-500', label: 'Healthy', text: 'text-emerald-600' },
};

export default function BrandRollupTable() {
  const rows = metrics.brandRollup;
  const { brand } = useBrand();
  const focusName = BRAND_NAME[brand] || null; // null = cross-brand roll-up
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">
          Service Level by Brand — {focusName ? `${focusName} (focused)` : 'Cross-Brand Roll-up'}
        </p>
        <p className="text-[10px] text-text-subtle mt-0.5">Source: Genesys Cloud (brand roll-ups) · Workforce Management</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-2">
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Brand</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Service Level</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Agents</th>
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const s = statusStyle[r.status] || statusStyle.healthy;
            const dimmed = focusName && r.brand !== focusName;
            return (
              <tr key={r.brand} className={`border-t border-border-subtle transition-colors ${dimmed ? 'opacity-35' : r.status === 'critical' ? 'bg-red-500/[0.03]' : 'hover:bg-gray-50/60'} ${focusName && r.brand === focusName ? 'bg-brand/[0.05]' : ''}`}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-text">{r.brand}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{r.note}</div>
                </td>
                <td className={`px-3 py-3 text-center font-bold text-sm ${slColor(r.serviceLevel)}`}>{r.serviceLevel}</td>
                <td className="px-3 py-3 text-center font-medium text-text-muted tabular-nums">{r.agents}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <span className={`text-[11px] font-semibold ${s.text}`}>{s.label}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-red-500/[0.04]">
        <p className="text-[10px] text-red-600 font-semibold">
          → Two brands critical at once — first dual-brand degradation in 90 days. Aggregate service level 66% (target 80%).
        </p>
      </div>
    </div>
  );
}
