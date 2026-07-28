import { usePersona } from '../context/PersonaContext';
import PlatformAdminObservability from '../components/nfcu/platform-admin/observability/PlatformAdminObservability';

/**
 * Agent Observability. Persona-gated the same way Governance is: only the NFCU
 * Platform Admin lists this nav slot, so nothing else routes here, but the guard
 * keeps a hand-typed URL from rendering an empty page.
 */
export default function AgentObservability() {
  const persona = usePersona();

  // Both governance personas render the same live platform-infra telemetry
  // (gateway, SLM, KAG, routing/cost logs) — the observability stack is the same
  // for every tenant, so the fleet-health view is shared.
  const GOVERNANCE_PERSONAS = ['nfcu_platform_admin', 'newfold_governance'];
  if (!GOVERNANCE_PERSONAS.includes(persona.id)) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Agent Observability is available for the AI Governance Admin only.
      </div>
    );
  }

  return <PlatformAdminObservability />;
}
