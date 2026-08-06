import type { PersonaModule } from '@core/types';

/**
 * Penny "Permit" — owns permit quality and the issue-to-close cycle.
 *
 * The altitude where the two failure modes the permit book structurally cannot
 * show you become visible: a permit that reads closed while the work continues,
 * and a valid permit whose crew has walked somewhere it does not authorize.
 */
export const permitIssuerPersona: PersonaModule = {
  id: 'aramco_permit_issuer',
  identity: {
    name: 'Penny "Permit"',
    initials: 'PP',
    role: 'Permit Issuing Authority, Turnaround',
    greeting: 'Penny',
  },
  load: () => import('./manifest'),
};
