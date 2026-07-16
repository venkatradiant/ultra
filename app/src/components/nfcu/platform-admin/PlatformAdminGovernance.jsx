import { motion } from 'framer-motion';
import { ShieldCheck, Coins, Activity } from 'lucide-react';
import { GOVERNANCE_KPIS } from '../../../data/nfcu/platform-admin/governanceData';
import FieldSovereigntyLedger from './FieldSovereigntyLedger';
import KagNodeView from './KagNodeView';
import RoutingDiagram from './RoutingDiagram';
import LlmCostUsageReport from './LlmCostUsageReport';
import AgentObservabilityGovernanceDashboard from './AgentObservabilityGovernanceDashboard';

/**
 * Governance — the Platform Admin's standing module page. The same five Gen UI
 * components the guided conversation walks through, laid out as a
 * continuous-governance pane. KPIs come from the shared data layer, so there is
 * exactly one place to change a number.
 *
 * Live operational telemetry (fleet health, RCA, event history) lives on the
 * separate Agent Observability page; this page is sovereignty, cost and policy.
 */
function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-brand" />
        </span>
        <div className="min-w-0">
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
            <h1 className="text-lg font-bold text-text">Governance</h1>
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">
            Two gates — safe to send, then worth sending. Member data resolves in-environment; the frontier model is used
            only where a task earns it, and every use is measured.
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {GOVERNANCE_KPIS.map((k) => (
              <div key={k.id} className="rounded-xl bg-surface border border-border-subtle px-3 py-2.5">
                <div className="text-base font-bold text-text tabular-nums leading-none">{k.value}</div>
                <div className="text-[9.5px] text-text-subtle uppercase tracking-wide mt-1 leading-tight">{k.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sovereignty */}
        <Section
          icon={ShieldCheck}
          title="Field Sovereignty & Provenance"
          subtitle="Where every field went, why a borderline field stayed local, and the two gates that decided"
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <FieldSovereigntyLedger />
            <RoutingDiagram />
          </div>
          <KagNodeView />
        </Section>

        {/* Cost */}
        <Section
          icon={Coins}
          title="LLM Cost and Usage"
          subtitle="Per-task routing and cost, with the all-frontier counterfactual"
        >
          <LlmCostUsageReport />
        </Section>

        {/* Observability */}
        <Section
          icon={Activity}
          // Retitled from "Agent Observability" — that name now belongs to the
          // dedicated page. This section is the turn-6 summary (health, spend,
          // policy), not the live telemetry view; the content is unchanged.
          title="Agent Activity & Policy"
          subtitle="Agent health, frontier share and spend trend — every action explainable against its policy"
        >
          <AgentObservabilityGovernanceDashboard />
        </Section>
      </div>
    </div>
  );
}
