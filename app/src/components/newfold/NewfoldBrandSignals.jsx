import TopInsightsBar from '../chat/TopInsightsBar';
import { useBrand } from '../../context/BrandContext';
import { BRANDS } from '../../data/newfold-digital/_shared/constants';

/**
 * Newfold priority-signals strip with brand-context filtering (spec Build
 * Instructions → Branding: "priority signals … can render per brand, defaulting
 * to a cross-brand roll-up"). Wraps the standard TopInsightsBar: when a specific
 * brand is selected, only signals tagged for that brand show; the cross-brand
 * default ('all') shows everything. A signal with no `brands` tag is treated as
 * portfolio-wide and always shown.
 */
export default function NewfoldBrandSignals({ signals, ...rest }) {
  const { brand } = useBrand();
  const filtered = brand === 'all'
    ? signals
    : (signals || []).filter((s) => !s.brands || s.brands.includes(brand));

  if (rest.visible && brand !== 'all' && filtered.length === 0) {
    const name = (BRANDS.find((b) => b.id === brand) || {}).name || brand;
    return (
      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-500/[0.05] px-4 py-3">
        <p className="text-xs font-semibold text-emerald-700">All clear for {name}</p>
        <p className="text-[11px] text-text-muted mt-0.5">No priority signals for this brand right now — it is holding above target. Switch to the cross-brand roll-up to see the full portfolio.</p>
      </div>
    );
  }

  return <TopInsightsBar signals={filtered} {...rest} />;
}
