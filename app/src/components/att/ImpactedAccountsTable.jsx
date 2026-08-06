/**
 * ImpactedAccountsTable — every account the bulk fix would touch.
 *
 * This is the component the demo's central claim rests on. An operator is
 * being asked to correct 87 customer bills in one action, and the only honest
 * basis for that is being able to see all 87 before she does — not a sample,
 * not an average.
 *
 * Three decisions follow from that:
 *   • Every row renders. The list scrolls rather than paginating, because a
 *     pager invites "I checked page one" and this table exists to prevent that.
 *   • The confidence filter defaults to All and the low tier is one click away.
 *     The 17 rows below 90% are the interesting ones; hiding them behind a
 *     sort would be the same as not showing them.
 *   • The footer totals the *selected* set, not the pattern. If she excludes
 *     rows, the number she is about to execute changes in front of her.
 */
import { useMemo, useState } from 'react';
import { ArrowUpDown, Check, Search } from 'lucide-react';
import ConfidencePill from './ConfidencePill';
import IllustrativeChip from './IllustrativeChip';
import { THRESHOLD_DEFAULTS } from '../../data/att/_shared/constants';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'high', label: `High ≥${THRESHOLD_DEFAULTS.high}%` },
  { id: 'medium', label: `Medium ${THRESHOLD_DEFAULTS.medium}–${THRESHOLD_DEFAULTS.high - 1}%` },
  { id: 'low', label: `Low <${THRESHOLD_DEFAULTS.medium}%` },
];

// Thousands separators matter here: this is a billing table, and "$1046.75"
// versus "$1,046.75" is the difference between a figure you scan and one you
// have to count digits on.
function money(n) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ImpactedAccountsTable({
  rows = [],
  selectedIds = null,
  onSelectionChange = null,
  maxHeight = 'max-h-[420px]',
}) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'confidence', dir: 'desc' });
  const [query, setQuery] = useState('');
  // Uncontrolled fallback so the table is useful on its own (e.g. inline in a
  // chat message) without an owner wiring selection state.
  const [ownSelection, setOwnSelection] = useState(null);
  const selection = selectedIds ?? ownSelection;
  const setSelection = onSelectionChange ?? setOwnSelection;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      const tierOk =
        filter === 'all' ||
        (filter === 'high' && r.confidence >= THRESHOLD_DEFAULTS.high) ||
        (filter === 'medium' && r.confidence >= THRESHOLD_DEFAULTS.medium && r.confidence < THRESHOLD_DEFAULTS.high) ||
        (filter === 'low' && r.confidence < THRESHOLD_DEFAULTS.medium);
      if (!tierOk) return false;
      if (!q) return true;
      return r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = sort.key === 'delta' ? Math.abs(a.correctedAmount - a.currentAmount) : a[sort.key];
      const bv = sort.key === 'delta' ? Math.abs(b.correctedAmount - b.currentAmount) : b[sort.key];
      if (typeof av === 'string') return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
  }, [rows, filter, sort, query]);

  // `null` selection means "the whole pattern" — the default, and what Apply
  // Fix to All executes. An explicit Set means the operator has narrowed it.
  const effective = selection ? rows.filter((r) => selection.has(r.id)) : rows;
  const total = effective.reduce((s, r) => s + Math.abs(r.correctedAmount - r.currentAmount), 0);
  const avgConf = effective.length
    ? Math.round(effective.reduce((s, r) => s + r.confidence, 0) / effective.length)
    : 0;
  const belowThreshold = rows.filter((r) => r.confidence < THRESHOLD_DEFAULTS.high).length;

  const toggleRow = (id) => {
    const next = new Set(selection ?? rows.map((r) => r.id));
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelection(next.size === rows.length ? null : next);
  };

  const toggleAll = () => setSelection(selection ? null : new Set());

  const sortBy = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));

  const th = (key, label, align = 'left') => (
    <th className={`py-2 px-3 text-${align}`}>
      <button
        type="button"
        onClick={() => sortBy(key)}
        className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
          sort.key === key ? 'text-brand' : 'text-text-subtle hover:text-text-muted'
        }`}
      >
        {label} <ArrowUpDown className="w-2.5 h-2.5" />
      </button>
    </th>
  );

  if (!rows.length) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface overflow-hidden">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 p-3.5 border-b border-border-subtle">
        <span className="text-[13px] font-bold text-text tracking-tight mr-auto">
          Impacted Accounts
          <span className="ml-2 text-[11px] font-medium text-text-subtle">
            {rows.length} rows · {belowThreshold} below {THRESHOLD_DEFAULTS.high}%
          </span>
        </span>

        <label className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Account or name"
            className="w-[168px] rounded-lg border border-border bg-surface-2/50 pl-8 pr-2.5 py-1.5 text-[11.5px] text-text placeholder:text-text-subtle focus:outline-none focus:border-brand/40"
          />
        </label>

        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                filter === f.id
                  ? 'bg-brand text-white'
                  : 'bg-surface-2 text-text-muted hover:text-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <IllustrativeChip />
      </div>

      {/* Rows */}
      <div className={`overflow-auto scrollbar-sleek ${maxHeight}`}>
        <table className="w-full min-w-[640px]">
          <thead className="sticky top-0 z-10 bg-surface-2/90 backdrop-blur-sm">
            <tr className="border-b border-border-subtle">
              <th className="py-2 pl-3 pr-1 w-8">
                <button
                  type="button"
                  onClick={toggleAll}
                  title={selection ? 'Select all' : 'Clear selection'}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                    selection ? 'border-border bg-surface' : 'border-brand bg-brand'
                  }`}
                >
                  {!selection && <Check className="w-3 h-3 text-white" />}
                </button>
              </th>
              {th('id', 'Account')}
              {th('name', 'Customer')}
              {th('currentAmount', 'Current', 'right')}
              {th('correctedAmount', 'Corrected', 'right')}
              {th('delta', 'Delta', 'right')}
              {th('confidence', 'Confidence', 'right')}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const delta = Math.abs(r.correctedAmount - r.currentAmount);
              const isSelected = !selection || selection.has(r.id);
              const isLow = r.confidence < THRESHOLD_DEFAULTS.high;
              return (
                <tr
                  key={r.id}
                  className={`border-b border-border-subtle last:border-0 transition-colors ${
                    isSelected ? '' : 'opacity-45'
                  } ${isLow ? 'bg-amber-500/[0.04]' : 'hover:bg-surface-2/40'}`}
                >
                  <td className="py-1.5 pl-3 pr-1">
                    <button
                      type="button"
                      onClick={() => toggleRow(r.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                        isSelected ? 'border-brand bg-brand' : 'border-border bg-surface'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  </td>
                  <td className="py-1.5 px-3 text-[11.5px] font-mono font-medium text-text">{r.id}</td>
                  <td className="py-1.5 px-3 text-[11.5px] text-text-muted truncate max-w-[160px]">{r.name}</td>
                  <td className="py-1.5 px-3 text-[11.5px] text-text-muted text-right tabular-nums">{money(r.currentAmount)}</td>
                  <td className="py-1.5 px-3 text-[11.5px] font-semibold text-text text-right tabular-nums">{money(r.correctedAmount)}</td>
                  <td className="py-1.5 px-3 text-[11.5px] font-semibold text-emerald-700 text-right tabular-nums">−{money(delta)}</td>
                  <td className="py-1.5 px-3 text-right">
                    <ConfidencePill value={r.confidence} size="sm" />
                  </td>
                </tr>
              );
            })}
            {!visible.length && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[12px] text-text-subtle">
                  No accounts match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer totals — of the selection, not the pattern */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 border-t border-border-subtle bg-surface-2/40">
        <span className="text-[11.5px] font-semibold text-text">
          Total ({effective.length} account{effective.length === 1 ? '' : 's'})
          {selection && (
            <span className="ml-1.5 text-[10.5px] font-medium text-amber-700">selection</span>
          )}
        </span>
        <span className="text-[11.5px] text-text-muted tabular-nums">
          <span className="font-bold text-text">{money(total)}</span> · Avg:{' '}
          <span className="font-bold text-text">{avgConf}%</span>
        </span>
      </div>
    </div>
  );
}
