import { lazy, Suspense } from 'react';
import { usePersona } from '../context/PersonaContext';
import PlatformAdminObservability from '../components/nfcu/platform-admin/observability/PlatformAdminObservability';

/**
 * Agent Observability. Persona-gated the same way Governance is: only personas
 * that list this nav slot route here, but the guard keeps a hand-typed URL from
 * rendering an empty page.
 *
 * Two consoles share the route because both answer "is the AI fleet healthy?" —
 * but they watch different fleets (NFCU: gateway, SLM, KAG, routing; AT&T: the
 * four billing-pipeline agents) over data shapes with nothing in common, so
 * each has its own container rather than one component with a prop per
 * difference.
 */
const WorkbenchObservability = lazy(() => import('../components/att/WorkbenchObservability'));

export default function AgentObservability() {
  const persona = usePersona();

  if (persona.id === 'att_platform_admin') {
    return (
      <Suspense fallback={<div className="flex-1 bg-bg" />}>
        <WorkbenchObservability />
      </Suspense>
    );
  }

  // Both governance personas render the same live platform-infra telemetry
  // (gateway, SLM, KAG, routing/cost logs) — the observability stack is the same
  // for every tenant, so the fleet-health view is shared.
  const GOVERNANCE_PERSONAS = ['nfcu_platform_admin'];
  if (!GOVERNANCE_PERSONAS.includes(persona.id)) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Agent Observability is available for the AI Governance Admin only.
      </div>
    );
  }

  return <PlatformAdminObservability />;
}
