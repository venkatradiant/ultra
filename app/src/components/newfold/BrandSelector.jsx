import { useState, useRef, useEffect } from 'react';
import { Layers, Check, ChevronDown } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { BRANDS } from '../../data/newfold-digital/_shared/constants';

/**
 * Brand-context selector — Newfold Digital top bar. Default is the cross-brand
 * roll-up; picking a brand narrows brand-aware surfaces to it.
 */
export default function BrandSelector() {
  const { brand, setBrand } = useBrand();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = BRANDS.find((b) => b.id === brand) || BRANDS[0];

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onClick);
      return () => document.removeEventListener('mousedown', onClick);
    }
  }, [open]);

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl border border-border-subtle hover:border-brand/40 hover:bg-brand/[0.03] transition-colors cursor-pointer"
        title="Brand context"
      >
        <Layers className="w-3.5 h-3.5 text-brand flex-shrink-0" />
        <span className="text-[11px] font-semibold text-text leading-tight max-w-[150px] truncate">{active.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-subtle transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-surface rounded-xl border border-border shadow-xl z-[60] overflow-hidden">
          <div className="px-3 py-2 border-b border-border-subtle">
            <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider">Brand Context</p>
          </div>
          <div className="py-1">
            {BRANDS.map((b) => {
              const isActive = b.id === brand;
              return (
                <button
                  key={b.id}
                  onClick={() => { setBrand(b.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${isActive ? 'bg-brand/[0.06]' : 'hover:bg-surface-2 cursor-pointer'}`}
                >
                  <span className={`text-xs font-medium flex-1 ${isActive ? 'text-brand' : 'text-text'}`}>{b.name}</span>
                  {isActive ? <Check className="w-3.5 h-3.5 text-brand flex-shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
