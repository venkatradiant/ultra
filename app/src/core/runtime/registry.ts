/**
 * Registry accessors — the runtime's read API over the domain registry.
 *
 * The app never imports a tenant module directly; it asks the registry. Client
 * ids are unique across domains, so client/persona lookups search all domains
 * (until the Domain axis becomes an explicit selection in Phase 6).
 */

import { domainRegistry } from '@domains';
import type { ClientManifest, DomainManifest, PersonaModule } from '../types';

export function getDomains(): DomainManifest[] {
  return domainRegistry;
}

export function getDomain(domainId: string): DomainManifest | null {
  return domainRegistry.find((d) => d.id === domainId) ?? null;
}

/** Find a client (and its owning domain) by client id, across all domains. */
export function findClient(
  clientId: string,
): { domain: DomainManifest; client: ClientManifest } | null {
  for (const domain of domainRegistry) {
    const client = domain.clients.find((c) => c.id === clientId);
    if (client) return { domain, client };
  }
  return null;
}

/** Whether a client has been migrated into the new registry yet. */
export function isClientRegistered(clientId: string): boolean {
  return findClient(clientId) !== null;
}

/** Persona modules a client exposes, in display order. */
export function getClientPersonas(clientId: string): PersonaModule[] {
  return findClient(clientId)?.client.personas ?? [];
}

export function getPersonaModule(clientId: string, personaId: string): PersonaModule | null {
  return getClientPersonas(clientId).find((p) => p.id === personaId) ?? null;
}
