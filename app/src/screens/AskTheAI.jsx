/**
 * AskTheAI — the /ask route. A thin router over the domain registry: it resolves
 * the active persona from the session's client + the URL persona and renders the
 * generic, manifest-driven PersonaWorkspace.
 *
 * (Was a 1,276-line god-screen with ~40 static tenant imports and hand-maintained
 * per-persona registries; the North Star refactor moved all of that into
 * per-persona manifest modules under src/domains — see the plan.)
 */

import { usePersona } from '../context/PersonaContext';
import { useBranding } from '../context/BrandingContext';
import { useActivePersona } from '@core/runtime/useActivePersona';
import PersonaWorkspace from '../shared/workspace/PersonaWorkspace';

export default function AskTheAI() {
  const persona = usePersona();
  const { clientId } = useBranding();
  const active = useActivePersona(clientId, persona.id);

  if (active.status === 'ready' && active.manifest) {
    return <PersonaWorkspace manifest={active.manifest} />;
  }
  // Briefly null while the persona's chunk loads. Every selectable persona is
  // registered, so `unregistered` is not reachable in normal operation.
  return null;
}
