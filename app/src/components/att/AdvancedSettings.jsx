/**
 * AdvancedSettings — nine toggles across three groups.
 *
 * Each toggle carries a one-line consequence rather than only a name. "Enable
 * Pattern Grouping" tells an admin nothing about what turning it off does; "off,
 * 207 anomalies arrive ungrouped and the operator is back to individual
 * investigation" tells them exactly what they are about to cost someone.
 *
 * Save and Reset both stage rather than persist, and say so — the alternative
 * is a Save button that appears to work and does not.
 */
import { useState } from 'react';
import { Settings2, CheckCircle2, RotateCcw } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

function Toggle({ setting, checked, onToggle }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onToggle(setting.id)}
        className={`mt-0.5 w-9 h-5 rounded-full flex-shrink-0 transition-colors cursor-pointer ${
          checked ? 'bg-brand' : 'bg-surface-2 border border-border'
        }`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className="min-w-0">
        <span className="block text-[12px] font-medium text-text leading-snug">{setting.label}</span>
        <span className="block text-[10.5px] text-text-subtle leading-snug mt-0.5">{setting.note}</span>
      </span>
    </li>
  );
}

export default function AdvancedSettings({ groups = [] }) {
  const initial = () =>
    Object.fromEntries(groups.flatMap((g) => g.settings.map((s) => [s.id, s.enabled])));
  const [state, setState] = useState(initial);
  const [saved, setSaved] = useState(false);

  if (!groups.length) return null;

  const toggle = (id) => {
    setSaved(false);
    setState((s) => ({ ...s, [id]: !s[id] }));
  };

  const dirty = groups
    .flatMap((g) => g.settings)
    .some((s) => state[s.id] !== s.enabled);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text tracking-tight">
            <Settings2 className="w-4 h-4 text-brand" /> Advanced System Settings
          </h3>
          <p className="text-[11px] text-text-subtle mt-0.5">
            What each switch costs, not just what it is called.
          </p>
        </div>
        <IllustrativeChip />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {groups.map((g) => (
          <div key={g.group} className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-1.5">
              {g.group}
            </p>
            <ul className="divide-y divide-border-subtle">
              {g.settings.map((s) => (
                <Toggle key={s.id} setting={s} checked={!!state[s.id]} onToggle={toggle} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={() => setSaved(true)}
          disabled={!dirty}
          className={`rounded-lg px-3.5 py-2 text-[11.5px] font-semibold transition-all ${
            dirty ? 'bg-brand text-white hover:brightness-110 cursor-pointer' : 'bg-surface-2 text-text-subtle cursor-not-allowed'
          }`}
        >
          Save Configuration
        </button>
        <button
          type="button"
          onClick={() => { setState(initial()); setSaved(false); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-[11.5px] font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> Staged — in-session only, resets on reload
          </span>
        )}
      </div>
    </div>
  );
}
