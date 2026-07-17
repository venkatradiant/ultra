import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Boxes, ShieldCheck, ShieldAlert, HelpCircle } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getAgentRegistry } from '@/data/nfcu/platform-admin/agentRegistryData';

/**
 * Turn 9 + the Agent Inventory page — Enterprise Agent Inventory / Governance
 * Registry. CR-08 / spec v2 Step 9.
 *
 * Parijat's ask, literally: "whether we can scale AI across the enterprise
 * without creating another generation of fragmented, independently governed
 * solutions." Every other turn asserts one governance model over many foundries;
 * this table is the evidence — and the three ungoverned rows are the proliferation
 * risk he named, visible rather than described.
 *
 * The two pivots are local view state, not separate turns (CR-08 is explicit):
 * group by foundry proves multi-platform coverage at a glance; "not yet governed"
 * surfaces the shadow agents.
 *
 * Ungoverned rows show "—" for PII-safe and budget because outside the layer
 * those answers don't exist. Rendering them as ✗ would imply we checked.
 */
const VIEWS = [
  { id: 'all', label: 'All agents' },
  { id: 'foundry', label: 'By foundry' },
  { id: 'ungoverned', label: 'Not yet governed' },
];

function GovBadge({ governed }) {
  return governed ? (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
      <ShieldCheck className="w-2.5 h-2.5" /> Governed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
      <ShieldAlert className="w-2.5 h-2.5" /> Not governed
    </span>
  );
}

/** null = unknown, and that distinction is the point of the screen. */
function Flag({ value }) {
  if (value === null || value === undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-text-subtle" title="Unknown — this agent is not routed through the governance layer">
        <HelpCircle className="w-3 h-3" /> —
      </span>
    );
  }
  return value
    ? <span className="text-[10px] font-semibold text-emerald-700">Yes</span>
    : <span className="text-[10px] font-semibold text-red-700">No</span>;
}

function Row({ a }) {
  return (
    <tr className={`border-b border-border-subtle transition-colors ${a.governed ? 'hover:bg-surface-2/50' : 'bg-red-50/40 hover:bg-red-50/70'}`}>
      <td className="py-2 px-3">
        <div className="text-[11.5px] font-medium text-text">{a.agent}</div>
        <div className="text-[9.5px] text-text-subtle">{a.lob}</div>
      </td>
      <td className="py-2 px-3">
        <span className="text-[10.5px] font-medium text-text-muted whitespace-nowrap">{a.foundry}</span>
      </td>
      <td className="py-2 px-3 hidden lg:table-cell">
        <span className="text-[10px] text-text-muted whitespace-nowrap">{a.models}</span>
      </td>
      <td className="py-2 px-3"><GovBadge governed={a.governed} /></td>
      <td className="py-2 px-3 hidden sm:table-cell"><Flag value={a.piiSafe} /></td>
      <td className="py-2 px-3 hidden md:table-cell"><Flag value={a.withinBudget} /></td>
      <td className="py-2 px-3 hidden xl:table-cell">
        <span className="text-[10px] font-mono text-text-muted">{a.policyVersion}</span>
      </td>
      <td className="py-2 px-3 hidden lg:table-cell">
        <span className="text-[10px] text-text-subtle whitespace-nowrap">{a.lastActive}</span>
      </td>
    </tr>
  );
}

function Head() {
  const th = 'text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]';
  return (
    <thead className="sticky top-0 bg-surface z-10">
      <tr className="border-b border-border-subtle">
        <th className={th}>Agent</th>
        <th className={th}>Foundry</th>
        <th className={`${th} hidden lg:table-cell`}>Model(s)</th>
        <th className={th}>Governance</th>
        <th className={`${th} hidden sm:table-cell`}>PII-safe</th>
        <th className={`${th} hidden md:table-cell`}>In budget</th>
        <th className={`${th} hidden xl:table-cell`}>Policy</th>
        <th className={`${th} hidden lg:table-cell`}>Last active</th>
      </tr>
    </thead>
  );
}

export default function EnterpriseAgentInventory() {
  const data = useAsyncData(getAgentRegistry);
  const [view, setView] = useState('all');

  // Both pivots derive from the same rows — no second source to drift.
  const groups = useMemo(() => {
    if (!data) return [];
    if (view === 'ungoverned') {
      return [{ key: 'Not yet under governance', rows: data.rows.filter((a) => !a.governed) }];
    }
    if (view === 'foundry') {
      const order = [...new Set(data.rows.map((a) => a.foundry))];
      return order.map((f) => ({ key: f, rows: data.rows.filter((a) => a.foundry === f) }));
    }
    return [{ key: null, rows: data.rows }];
  }, [data, view]);

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-semibold text-text">Enterprise Agent Inventory</h3>
        </div>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
          {data.ungoverned} not yet governed
        </span>
      </div>
      <p className="text-xs text-text-subtle mb-3">
        {data.total} agents · {data.foundries} foundries · one governance layer
      </p>

      {/* Summary — every figure derived from the rows below it */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="rounded-lg bg-surface-2 px-3 py-2.5">
          <div className="text-base font-bold text-text tabular-nums">{data.total}</div>
          <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mt-0.5">Agents running</div>
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-2.5">
          <div className="text-base font-bold text-emerald-700 tabular-nums">{data.governed}</div>
          <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mt-0.5">Under governance</div>
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-2.5">
          <div className="text-base font-bold text-red-700 tabular-nums">{data.ungoverned}</div>
          <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mt-0.5">Shadow agents</div>
        </div>
      </div>

      {/* Pivots */}
      <div className="flex items-center gap-1.5 mb-3">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            aria-pressed={view === v.id}
            className={`text-[10.5px] font-semibold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
              view === v.id
                ? 'bg-brand text-white border-brand'
                : 'border-border text-text-muted hover:text-brand hover:border-brand/30'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto max-h-[420px] overflow-y-auto scrollbar-sleek">
        <table className="w-full text-xs">
          <Head />
          <tbody>
            {groups.map((g) => (
              <Group key={g.key ?? 'all'} label={g.key} rows={g.rows} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10.5px] text-text-muted mt-3 pt-3 border-t border-border-subtle leading-snug">
        Whatever a team builds on — Copilot Studio, Azure AI Foundry, Anthropic, OpenAI, Backbase AI — it routes
        through the same layer for PII, cost and audit. The {data.ungoverned} shadow agents are the exception, and
        why their PII and budget columns read “—”: outside the layer, those answers don’t exist.
      </p>
    </motion.div>
  );
}

/** Optional group header row + its members. */
function Group({ label, rows }) {
  const ungoverned = rows.filter((r) => !r.governed).length;
  return (
    <>
      {label && (
        <tr className="bg-surface-2">
          <td colSpan={8} className="py-1.5 px-3">
            <span className="text-[9.5px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
            <span className="text-[9.5px] text-text-subtle ml-2 tabular-nums">
              {rows.length} agent{rows.length === 1 ? '' : 's'}
              {ungoverned > 0 && <span className="text-red-700 font-semibold"> · {ungoverned} not governed</span>}
            </span>
          </td>
        </tr>
      )}
      {rows.map((a) => <Row key={a.agent} a={a} />)}
    </>
  );
}
