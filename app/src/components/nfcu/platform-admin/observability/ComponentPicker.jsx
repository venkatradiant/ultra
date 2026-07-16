import { useMemo } from 'react';
import { LAYER_LABELS } from '@/data/nfcu/platform-admin/observabilityData';
import { STATE_PRIORITY, styleForState } from './stateStyles';

/**
 * Jump-to control. A native <select> with <optgroup> per layer, deliberately.
 *
 * The reference used a searchable combobox because it had 153 components to
 * sift; we have ~34, and the fleet table row is the primary picker anyway. Native
 * buys keyboard navigation, type-ahead (press "s" to jump to the SLM pool —
 * exactly what the search box was for), screen-reader support, mobile behaviour
 * and focus management for free, with no ARIA to get wrong. The only cost is an
 * unstyleable popup, which nobody is buying this demo for.
 *
 * Props: { components, value, onChange }
 */
const LAYER_ORDER = ['application_layer', 'data_layer', 'infrastructure_layer', 'network_layer'];

export default function ComponentPicker({ components, value, onChange }) {
  const groups = useMemo(() => {
    return LAYER_ORDER.map((layer) => ({
      layer,
      members: (components ?? [])
        .filter((c) => c.layer === layer)
        .sort(
          (a, b) =>
            STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state] ||
            (a.label ?? a.component).localeCompare(b.label ?? b.component),
        ),
    })).filter((g) => g.members.length);
  }, [components]);

  if (!components?.length) return null;

  const selected = components.find((c) => c.component === value);
  const style = selected ? styleForState(selected.state) : null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="ao-component-picker" className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
        Component
      </label>
      <div className="relative flex items-center gap-2">
        {style && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />}
        <select
          id="ao-component-picker"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="text-[11.5px] font-medium text-text bg-surface border border-border rounded-lg
                     pl-2.5 pr-7 py-1.5 cursor-pointer hover:border-brand/30 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-brand/30 appearance-none
                     bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')]
                     bg-[length:14px_14px] bg-[right_0.5rem_center] bg-no-repeat"
        >
          {groups.map(({ layer, members }) => (
            <optgroup key={layer} label={LAYER_LABELS[layer]}>
              {members.map((c) => (
                <option key={c.component} value={c.component}>
                  {c.label ?? c.component}
                  {c.state !== 'healthy' ? ` — ${styleForState(c.state).label}` : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}
