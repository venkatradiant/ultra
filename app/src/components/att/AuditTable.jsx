/**
 * AuditTable — the governance record, written as the operator acts.
 *
 * The nine columns are the nine things an auditor asks: which account, what was
 * wrong, what was decided, at what confidence tier, by whom, when, under which
 * rebill ID, and what the amount was before and after. Nothing is derived at
 * render time — each row is what was written at the moment of the action, which
 * is the difference between an audit trail and a reconstruction.
 *
 * Rows that changed no money (false positives, escalations) carry "N/A" in the
 * rebill column rather than being hidden. A decision not to act is still a
 * decision, and leaving it out is how audit trails end up looking cleaner than
 * the cycle actually was.
 */
import { useMemo, useState } from 'react';
import { Search, Download } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

const STATUS_STYLE = {
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-surface-2 text-text-muted border-border',
  Escalated: 'bg-amber-50 text-amber-700 border-amber-200',
  Deferred: 'bg-sky-50 text-sky-700 border-sky-200',
};

const TIER_STYLE = {
  High: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-rose-50 text-rose-700 border-rose-200',
};

/**
 * @param {object} props
 * @param {Array<Record<string, string>>} [props.records]
 * @param {(() => void)} [props.onExport] Omit to hide the export action.
 */
export default function AuditTable({ records = [], onExport }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  const statuses = useMemo(
    () => ['All', ...Array.from(new Set(records.map((r) => r.status)))],
    [records],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (status !== 'All' && r.status !== status) return false;
      if (!q) return true;
      return [r.accountId, r.issue, r.action, r.user, r.rebillId].some((v) =>
        String(v).toLowerCase().includes(q),
      );
    });
  }, [records, query, status]);

  if (!records.length) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-3.5 border-b border-border-subtle">
        <span className="text-[13px] font-bold text-text tracking-tight mr-auto">
          Audit Log
          <span className="ml-2 text-[11px] font-medium text-text-subtle">
            {visible.length} of {records.length} row{records.length === 1 ? '' : 's'}
          </span>
        </span>

        <label className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Account, issue, rebill ID"
            className="w-[190px] rounded-lg border border-border bg-surface-2/50 pl-8 pr-2.5 py-1.5 text-[11.5px] text-text placeholder:text-text-subtle focus:outline-none focus:border-brand/40"
          />
        </label>

        <div className="flex flex-wrap gap-1">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                status === s ? 'bg-brand text-white' : 'bg-surface-2 text-text-muted hover:text-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/40 px-3 py-1.5 text-[11.5px] font-semibold text-text-muted hover:text-text hover:border-brand/35 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Audit Report
          </button>
        )}

        <IllustrativeChip />
      </div>

      <div className="overflow-x-auto scrollbar-sleek">
        <table className="w-full min-w-[880px]">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-2/60">
              {['Account', 'Issue', 'Action', 'Tier', 'Operator', 'Timestamp', 'Rebill ID', 'Before', 'After', 'Status'].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-subtle ${
                      i >= 7 && i <= 8 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2/40 transition-colors">
                <td className="py-2.5 px-3 text-[11.5px] font-mono font-medium text-text">{r.accountId}</td>
                <td className="py-2.5 px-3 text-[11.5px] text-text-muted">{r.issue}</td>
                <td className="py-2.5 px-3 text-[11.5px] text-text">{r.action}</td>
                <td className="py-2.5 px-3">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${TIER_STYLE[r.confidenceTier] || ''}`}>
                    {r.confidenceTier}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[11.5px] text-text-muted">{r.user}</td>
                <td className="py-2.5 px-3 text-[11px] text-text-subtle whitespace-nowrap">{r.timestamp}</td>
                <td className="py-2.5 px-3 text-[11.5px] font-mono text-text-muted">{r.rebillId}</td>
                <td className="py-2.5 px-3 text-[11.5px] text-text-muted text-right tabular-nums">{r.beforeAmount}</td>
                <td className="py-2.5 px-3 text-[11.5px] font-semibold text-text text-right tabular-nums">{r.afterAmount}</td>
                <td className="py-2.5 px-3">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[r.status] || ''}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-[12px] text-text-subtle">
                  No resolutions match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
