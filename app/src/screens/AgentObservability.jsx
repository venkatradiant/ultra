import { usePersona } from '../context/PersonaContext';
import PlatformAdminObservability from '../components/nfcu/platform-admin/observability/PlatformAdminObservability';

/**
 * Agent Observability. Persona-gated the same way Governance is: only the NFCU
 * Platform Admin lists this nav slot, so nothing else routes here, but the guard
 * keeps a hand-typed URL from rendering an empty page.
 */
export default function AgentObservability() {
  const persona = usePersona();

  if (persona.id !== 'nfcu_platform_admin') {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Agent Observability is available for the NFCU Platform Administrator only.
      </div>
    );
  }

  return <PlatformAdminObservability />;
}
