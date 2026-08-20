// import { useMemo } from 'react';
// import { LAYER_LABELS } from '@/data/nfcu/platform-admin/observabilityData';
// import { STATE_PRIORITY, styleForState } from './stateStyles';

// /**
//  * Jump-to control. A native <select> with <optgroup> per layer, deliberately.
//  *
//  * The reference used a searchable combobox because it had 153 components to
//  * sift; we have ~34, and the fleet table row is the primary picker anyway. Native
//  * buys keyboard navigation, type-ahead (press "s" to jump to the SLM pool —
//  * exactly what the search box was for), screen-reader support, mobile behaviour
//  * and focus management for free, with no ARIA to get wrong. The only cost is an
//  * unstyleable popup, which nobody is buying this demo for.
//  *
//  * Props: { components, value, onChange }
//  */
// const LAYER_ORDER = ['application_layer', 'data_layer', 'infrastructure_layer', 'network_layer'];

// export default function ComponentPicker({ components, value, onChange }) {
//   const groups = useMemo(() => {
//     return LAYER_ORDER.map((layer) => ({
//       layer,
//       members: (components ?? [])
//         .filter((c) => c.layer === layer)
//         .sort(
//           (a, b) =>
//             STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state] ||
//             (a.label ?? a.component).localeCompare(b.label ?? b.component),
//         ),
//     })).filter((g) => g.members.length);
//   }, [components]);

//   if (!components?.length) return null;

//   const selected = components.find((c) => c.component === value);
//   const style = selected ? styleForState(selected.state) : null;

//   return (
//     <div className="flex items-center gap-2">
//       <label htmlFor="ao-component-picker" className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
//         Component
//       </label>
//       <div className="relative flex items-center gap-2">
//         {style && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />}
//         <select
//           id="ao-component-picker"
//           value={value ?? ''}
//           onChange={(e) => onChange(e.target.value)}
//           className="text-[11.5px] font-medium text-text bg-surface border border-border rounded-lg
//                      pl-2.5 pr-7 py-1.5 cursor-pointer hover:border-brand/30 transition-colors
//                      focus:outline-none focus:ring-2 focus:ring-brand/30 appearance-none
//                      bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')]
//                      bg-[length:14px_14px] bg-[right_0.5rem_center] bg-no-repeat"
//         >
//           {groups.map(({ layer, members }) => (
//             <optgroup key={layer} label={LAYER_LABELS[layer]}>
//               {members.map((c) => (
//                 <option key={c.component} value={c.component}>
//                   {c.label ?? c.component}{c.state !== 'healthy' ? ` [${styleForState(c.state).label}]` : ''}
//                 </option>
//               ))}
//             </optgroup>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// }



import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { LAYER_LABELS } from '@/data/nfcu/platform-admin/observabilityData';
import { STATE_PRIORITY, styleForState } from './stateStyles';

const LAYER_ORDER = ['application_layer', 'data_layer', 'infrastructure_layer', 'network_layer'];

export default function ComponentPicker({ components, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!components?.length) return null;

  const selected = components.find((c) => c.component === value);
  const selectedStyle = selected ? styleForState(selected.state) : null;
  const SelectedIcon = selectedStyle?.icon;

  return (
    <div className="flex items-center gap-2" ref={ref}>
      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
        Component
      </label>

      <div className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-[11.5px] font-medium text-text bg-surface
                     border border-border rounded-lg pl-2.5 pr-2.5 py-1.5 cursor-pointer
                     hover:border-brand/30 transition-colors focus:outline-none focus:ring-2
                     focus:ring-brand/30 min-w-[220px]"
        >
          {selected ? (
            <>
              <span className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${selectedStyle.pill}`}>
                {SelectedIcon && <SelectedIcon className="w-2.5 h-2.5" />}
                {selectedStyle.label}
              </span>
              <span className="truncate flex-1 text-left">{selected.label ?? selected.component}</span>
            </>
          ) : (
            <span className="flex-1 text-left text-text-muted">Select a component</span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-text-muted flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border
                          rounded-xl shadow-lg w-[320px] max-h-[400px] overflow-y-auto">
            {groups.map(({ layer, members }) => (
              <div key={layer}>
                <div className="px-3 py-2 text-[9.5px] font-bold text-text-muted uppercase tracking-wider
                                bg-surface-2 sticky top-0 border-b border-border-subtle">
                  {LAYER_LABELS[layer]}
                </div>
                {members.map((c) => {
                  const style = styleForState(c.state);
                  const Icon = style.icon;
                  const isSelected = c.component === value;
                  return (
                    <button
                      key={c.component}
                      type="button"
                      onClick={() => { onChange(c.component); setOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left
                                  hover:bg-surface-2 transition-colors border-b border-border-subtle/50
                                  ${isSelected ? 'bg-brand/[0.06]' : ''}`}
                    >
                      <span className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${style.pill}`}>
                        <Icon className="w-2.5 h-2.5" />
                        {style.label}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-[11px] font-medium truncate ${isSelected ? 'text-brand' : 'text-text'}`}>
                          {c.label ?? c.component}
                        </div>
                        <div className="text-[9px] font-mono text-text-subtle truncate">{c.component}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}