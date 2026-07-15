/**
 * useActivePersona — resolves and lazily loads the active persona's manifest.
 *
 * Given the session's clientId and the URL's persona id, it resolves via the
 * registry and dynamically imports the persona module (per-tenant code-split).
 * Returns `status: 'unregistered'` when the client hasn't been migrated into the
 * new registry yet — the caller then falls back to the legacy runtime. This is
 * the seam that lets old and new render paths coexist during the migration.
 */

import { useEffect, useMemo, useState } from 'react';
import { resolveActive } from './resolveActive';
import type { PersonaManifest } from '../types';

export type ActivePersonaStatus = 'unregistered' | 'loading' | 'ready';

export interface ActivePersonaState {
  status: ActivePersonaStatus;
  manifest: PersonaManifest | null;
  /** The resolved persona id (may differ from requested when a default kicks in). */
  personaId: string | null;
  clientId: string | null;
}

export function useActivePersona(
  clientId: string | null | undefined,
  requestedPersonaId?: string | null,
): ActivePersonaState {
  const resolution = useMemo(
    () => resolveActive(clientId, requestedPersonaId),
    [clientId, requestedPersonaId],
  );

  const [loaded, setLoaded] = useState<{ key: string; manifest: PersonaManifest } | null>(null);

  useEffect(() => {
    if (!resolution) return;
    let cancelled = false;
    resolution.persona.load().then((mod) => {
      if (!cancelled) setLoaded({ key: resolution.persona.id, manifest: mod.default });
    });
    return () => {
      cancelled = true;
    };
  }, [resolution]);

  if (!resolution) {
    return { status: 'unregistered', manifest: null, personaId: requestedPersonaId ?? null, clientId: clientId ?? null };
  }

  const ready = loaded?.key === resolution.persona.id;
  return {
    status: ready ? 'ready' : 'loading',
    manifest: ready ? loaded!.manifest : null,
    personaId: resolution.persona.id,
    clientId: clientId ?? null,
  };
}
