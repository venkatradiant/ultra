import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import ModelAccuracyTile from '../components/nfcu/governance/ModelAccuracyTile';
import ConfidenceDistributionChart from '../components/nfcu/governance/ConfidenceDistributionChart';
import DriftIndicatorCard from '../components/nfcu/governance/DriftIndicatorCard';
import EscalationRateTile from '../components/nfcu/governance/EscalationRateTile';
import AccuracyTimelinePanel from '../components/nfcu/governance/AccuracyTimelinePanel';
import BiasCheckCard from '../components/nfcu/governance/BiasCheckCard';
import AuditTrailFeed from '../components/nfcu/governance/AuditTrailFeed';
import EscalationPolicyBar from '../components/nfcu/governance/EscalationPolicyBar';
import PlatformAdminGovernance from '../components/nfcu/platform-admin/PlatformAdminGovernance';

import supervisorGov from '../data/nfcu/supervisor/governance.json';
import analystGov from '../data/nfcu/analyst/governance.json';
import workforceGov from '../data/nfcu/workforce/governance.json';
import directorGov from '../data/nfcu/director/governance.json';

const GOVERNANCE_BY_PERSONA = {
  nfcu_supervisor: supervisorGov,
  nfcu_analyst: analystGov,
  nfcu_workforce: workforceGov,
  nfcu_director: directorGov,
};

export default function Governance() {
  const persona = usePersona();
  const [data, setData] = useState(() => GOVERNANCE_BY_PERSONA[persona.id]);

  useEffect(() => {
    setData(GOVERNANCE_BY_PERSONA[persona.id]);
  }, [persona.id]);

  // Platform Admin has its own governance surface (sovereignty routing, KAG
  // provenance, tokenomics, observability) — distinct from the model-accuracy view.
  if (persona.id === 'nfcu_platform_admin') {
    return <PlatformAdminGovernance />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Model Governance is available for NFCU personas only.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <div className="max-w-[1400px] mx-auto px-6 py-5 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <h1 className="text-lg font-bold text-text">Model Governance — {persona.name}</h1>
            </div>
            <p className="text-[12px] text-text-muted mt-0.5">
              Live observability for the AI models grounding your recommendations.
            </p>
            <EscalationPolicyBar governance={data} />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-surface border border-border-subtle px-4 py-2.5"
               style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Cpu className="w-4 h-4 text-brand" />
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-text-subtle">Model</div>
              <div className="text-[12px] font-semibold text-text leading-tight">{data.model.name}</div>
              <div className="text-[10px] font-mono text-text-muted">{data.model.version} · {data.model.domain}</div>
            </div>
          </div>
        </motion.div>

        {/* Top tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ModelAccuracyTile accuracy={data.accuracy} />
          <ConfidenceDistributionChart distribution={data.confidence_distribution} />
          <DriftIndicatorCard drift={data.drift} />
          <EscalationRateTile escalation={data.escalation_rate} />
        </div>

        {/* Timeline + side column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-3">
            <AccuracyTimelinePanel series={data.accuracy_timeline_14d} />
            <BiasCheckCard checks={data.bias_checks} />
          </div>
          <div id="audit-trail-anchor" className="scroll-mt-4">
            <AuditTrailFeed baseEntries={data.audit_trail} />
          </div>
        </div>
      </div>
    </div>
  );
}
