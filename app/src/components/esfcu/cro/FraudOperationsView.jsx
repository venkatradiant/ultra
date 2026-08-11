import { Siren, ListFilter, Network, FileText } from 'lucide-react';
import AlertQueue from './AlertQueue';
import CaseTriagePanel from './CaseTriagePanel';
import FraudLinkGraph from './FraudLinkGraph';
import CroDataTrustStrip from './CroDataTrustStrip';
import queue from '../../../data/esfcu/cro/alertQueue.json';
import cases from '../../../data/esfcu/cro/cases.json';
import linkGraph from '../../../data/esfcu/cro/linkGraph.json';
import sarItems from '../../../data/esfcu/cro/sarItems.json';
import { STATE_COLOR } from '../tokens';

/**
 * `/fraud-operations` (spec §12) — the queue, the cases and the link graph.
 *
 * Ordered the way the work actually runs rather than the way the spec lists
 * them: the queue first (what needs working), then triage (what you found),
 * then the graph (what connects it). The trust strip sits at the top in its
 * compact form, because everything below it is only as good as the feeds
 * behind it, and the coverage gap is exactly what this page cannot see.
 */

function Stat({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-border-subtle bg-surface p-3">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand/[0.07] text-brand">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">{label}</p>
        <p className="text-[16px] font-bold leading-tight tabular-nums" style={tone ? { color: STATE_COLOR[tone] } : undefined}>
          {value}
        </p>
        <p className="text-[9.5px] leading-snug text-text-subtle">{sub}</p>
      </div>
    </div>
  );
}

export default function FraudOperationsView() {
  const dueSoon = sarItems.items.filter((s) => s.daysToDeadline <= 7).length;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-sleek px-4 pb-10 pt-6 sm:px-6">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">Fraud Operations</h2>
      <p className="mb-4 max-w-2xl text-[12px] text-text-muted">
        The working surface behind the briefing: the re-ranked alert queue, the cases opened against
        the campaign, and the receiving accounts that connect them. Every figure is illustrative and
        internally consistent with the risk briefing.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={ListFilter}
          label="Open alerts"
          value={queue.open_total}
          sub={`${queue.false_positive_pct}% false positive · ${queue.fraud_likely_count} fraud-likely`}
        />
        <Stat
          icon={Siren}
          label="Open cases"
          value={cases.open_total}
          sub={`${cases.shown} shown · campaign window`}
          tone="warning"
        />
        <Stat
          icon={Network}
          label="Flagged accounts"
          value={linkGraph.flagged_accounts}
          sub={`${linkGraph.repeating_receivers} receivers repeating`}
          tone="warning"
        />
        <Stat
          icon={FileText}
          label="Open SARs"
          value={sarItems.open_count}
          sub={`${dueSoon} due within 7 days · ${sarItems.on_time_pct}% on-time`}
          tone="warning"
        />
      </div>

      <div className="mb-4">
        <CroDataTrustStrip compact />
      </div>

      <div className="space-y-4">
        <AlertQueue />
        <CaseTriagePanel />
        <FraudLinkGraph />
      </div>
    </div>
  );
}
