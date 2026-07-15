import { Gauge, Activity, Headphones } from 'lucide-react';

const TIERS = [
  { id: 'executive',  label: 'Executive',  Icon: Gauge },
  { id: 'supervisor', label: 'Supervisor', Icon: Activity },
  { id: 'agent',      label: 'Agent',      Icon: Headphones },
];

export default function TierSelector({ tier, onChange, availableTiers = ['supervisor'] }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">
      {TIERS.map(({ id, label, Icon }) => {
        const enabled = availableTiers.includes(id);
        const active = tier === id && enabled;
        return (
          <button
            key={id}
            type="button"
            disabled={!enabled}
            onClick={() => enabled && onChange(id)}
            title={enabled ? `${label} view` : `${label} view — coming soon`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              active
                ? 'bg-brand text-white'
                : enabled
                ? 'text-text-muted hover:bg-surface-2 cursor-pointer'
                : 'text-text-subtle cursor-not-allowed'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
