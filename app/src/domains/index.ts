/**
 * The domain registry — every domain the platform can render.
 *
 * This is the ONE place new domains are registered. The runtime reads from here
 * and never imports a tenant directly. Populated per-tenant during the strangler
 * migration (plan Phases 3–6); empty entries are fine while the old runtime
 * still serves un-migrated personas.
 */
import type { DomainRegistry } from '@core/types';
import { financialServicesDomain } from './financial-services/domain.manifest';
import { healthcareDomain } from './healthcare/domain.manifest';

export const domainRegistry: DomainRegistry = [
  financialServicesDomain,
  healthcareDomain,
];
