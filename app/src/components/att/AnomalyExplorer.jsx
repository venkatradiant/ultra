/**
 * AnomalyExplorer — the raw rows, before grouping.
 *
 * The Dashboard's counterweight to the conversation. The AI collapses 207
 * anomalies into six decisions; this is where an operator who does not want to
 * take that on trust can look at individual charges with the source system
 * named on every row. The filters genuinely filter — a demo table whose
 * controls are decorative teaches the opposite of what this page argues.
 */
import { useMemo, useState } from 'react';
import { Download, Search, Filter } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

const SEVERITY_STYLE = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_STYLE = {
  Pending: 'bg-sky-50 text-sky-700 border-sky-200',
  'Auto-Fixed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Escalated: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-brand/10 text-brand border-brand/25',
  Rejected: 'bg-surface-2 text-text-muted border-border',
};

const COLUMNS = [
  { key: 'accountId', label: 'Account', align: 'left', mono: true },
  { key: 'customer', label: 'Customer', align: 'left' },
  { key: 'plan', label: 'Plan', align: 'left' },
  { key: 'chargeType', label: 'Charge Type', align: 'left' },
  { key: 'product', label: 'Product', align: 'left' },
  { key: 'prevAmt', label: 'Previous', align: 'right' },
  { key: 'currAmt', label: 'Current', align: 'right' },
  { key: 'delta', label: 'Delta', align: 'right' },
  { key: 'confidence', label: 'Confidence', align: 'right' },
  { key: 'source', label: 'Source', align: 'left' },
];

function Select({ label, value, options, onChange }) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-2/50 px-2.5 py-1.5 text-[11.5px] font-medium text-text focus:outline-none focus:border-brand/40 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o === 'All' ? `All ${label.toLowerCase()}` : o}</option>
        ))}
      </select>
    </label>
  );
}

export default function AnomalyExplorer({ rows = [] }) {
  const [status, setStatus] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [chargeType, setChargeType] = useState('All');
  const [query, setQuery] = useState('');
  const [exported, setExported] = useState(false);

  const options = useMemo(
    () => ({
      status: ['All', ...Array.from(new Set(rows.map((r) => r.status)))],
      severity: ['All', ...Array.from(new Set(rows.map((r) => r.severity)))],
      chargeType: ['All', ...Array.from(new Set(rows.map((r) => r.chargeType)))],
    }),
    [rows],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== 'All' && r.status !== status) return false;
      if (severity !== 'All' && r.severity !== severity) return false;
      if (chargeType !== 'All' && r.chargeType !== chargeType) return false;
      if (!q) return true;
      return [r.accountId, r.customer, r.product, r.source].some((v) =>
        String(v).toLowerCase().includes(q),
      );
    });
  }, [rows, status, severity, chargeType, query]);

  if (!rows.length) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-3.5 border-b border-border-subtle">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text tracking-tight mr-auto">
          <Filter className="w-4 h-4 text-brand" /> Anomaly Explorer
          <span className="ml-1 text-[11px] font-medium text-text-subtle">
            {visible.length} of {rows.length}
          </span>
        </span>

        <label className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Account, customer, source"
            className="w-[190px] rounded-lg border border-border bg-surface-2/50 pl-8 pr-2.5 py-1.5 text-[11.5px] text-text placeholder:text-text-subtle focus:outline-none focus:border-brand/40"
          />
        </label>

        <Select label="Status" value={status} options={options.status} onChange={setStatus} />
        <Select label="Severity" value={severity} options={options.severity} onChange={setSeverity} />
        <Select label="Charge types" value={chargeType} options={options.chargeType} onChange={setChargeType} />

        <button
          type="button"
          onClick={() => setExported(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/40 px-3 py-1.5 text-[11.5px] font-semibold text-text-muted hover:text-text hover:border-brand/35 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>

        <IllustrativeChip />
      </div>

      {exported && (
        <p className="px-3.5 py-2 text-[11px] text-emerald-800 bg-emerald-500/[0.07] border-b border-emerald-200">
          {visible.length} row{visible.length === 1 ? '' : 's'} staged for export with the current filters
          applied. Staged in this demo — no file was produced.
        </p>
      )}

      <div className="overflow-x-auto scrollbar-sleek">
        <table className="w-full min-w-[1040px]">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-2/60">
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className={`py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-subtle text-${c.align}`}
                >
                  {c.label}
                </th>
              ))}
              <th className="py-2.5 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-text-subtle">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.accountId} className="border-b border-border-subtle last:border-0 hover:bg-surface-2/40 transition-colors">
                {COLUMNS.map((c) => {
                  if (c.key === 'confidence') {
                    return (
                      <td key={c.key} className="py-2.5 px-3 text-right">
                        <span className="text-[11.5px] font-semibold text-text tabular-nums">{r.confidence}</span>
                      </td>
                    );
                  }
                  if (c.key === 'chargeType') {
                    return (
                      <td key={c.key} className="py-2.5 px-3">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${SEVERITY_STYLE[r.severity] || ''}`}>
                          {r.chargeType}
                        </span>
                      </td>
                    );
                  }
                  return (
                    <td
                      key={c.key}
                      className={`py-2.5 px-3 text-[11.5px] text-${c.align} ${
                        c.mono ? 'font-mono font-medium text-text' : 'text-text-muted'
                      } ${c.key === 'delta' ? 'font-semibold text-text tabular-nums' : ''}`}
                    >
                      {r[c.key]}
                    </td>
                  );
                })}
                <td className="py-2.5 px-3 text-right">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[r.status] || ''}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="py-8 text-center text-[12px] text-text-subtle">
                  No anomalies match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
