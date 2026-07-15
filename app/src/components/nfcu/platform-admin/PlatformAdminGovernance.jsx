import { motion } from 'framer-motion';
import { ShieldCheck, Coins, Eye } from 'lucide-react';
import governance from '../../../data/nfcu/platform-admin/governance.json';
import ModelRoutingProvenanceTrace from './ModelRoutingProvenanceTrace';
import SensitiveFieldRegistry from './SensitiveFieldRegistry';
import KagNodeView from './KagNodeView';
import TokenomicsDashboard from './TokenomicsDashboard';
import CostCard from './CostCard';
import AgentObservabilityPanel from './AgentObservabilityPanel';
import SystemMetricChart from './SystemMetricChart';

/**
 * Governance & Observability — the Platform Admin's standing module page. A single
 * pane over the same governance artifacts the guided conversation walks through:
 * sovereignty routing, KAG provenance, tokenomics, and agent observability.
 */
const HEADER_KPIS = [
  { label: 'Sensitive → SLM', value: '100%' },
  { label: 'PII → LLM', value: '0' },
  { label: 'SLM / LLM split', value: '78 / 22' },
  { label: 'Cache hit rate', value: '63%' },
  { label: 'Avg cost / query', value: '$0.11' },
  { label: 'Actions w/ citation', value: '96%' },
];

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-brand" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-text leading-tight">{title}</h2>
          <p className="text-[11px] text-text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function PlatformAdminGovernance() {
  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <h1 className="text-lg font-bold text-text">Governance &amp; Observability</h1>
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">
            Sovereignty-aware routing, KAG sensitivity &amp; provenance, tokenomics, and agent observability — one pane, live against the same data the business personas use.
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {HEADER_KPIS.map((k) => (
              <div key={k.label} className="rounded-xl bg-surface border border-border-subtle px-3 py-2.5">
                <div className="text-base font-bold text-text tabular-nums leading-none">{k.value}</div>
                <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mt-1">{k.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sovereignty */}
        <Section icon={ShieldCheck} title="Sovereignty & Provenance" subtitle="Which model processed what, why it was flagged sensitive, and where it originates">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ModelRoutingProvenanceTrace data={governance.routingTrace} />
            <SensitiveFieldRegistry data={governance.sensitiveFields} />
          </div>
          <KagNodeView data={governance.kagGraph} />
        </Section>

        {/* Tokenomics */}
        <Section icon={Coins} title="Tokenomics & Cost Governance" subtitle="Cost per query and per person, token split, and savings versus LLM-only">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <TokenomicsDashboard data={governance.tokenomics} />
            <CostCard data={governance.costQuery} />
          </div>
        </Section>

        {/* Observability */}
        <Section icon={Eye} title="Agent Observability" subtitle="Each agent action explained against the policy that drove it — plus admin portal health">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <AgentObservabilityPanel data={governance.observability} />
            <SystemMetricChart data={governance.systemMetric} />
          </div>
        </Section>
      </div>
    </div>
  );
}
