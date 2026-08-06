import type { PersonaModule } from '@core/types';

/**
 * Platform Admin — "System Configuration" (spec §3, Persona B).
 *
 * Aria does not clear cycles; she sets the thresholds and watches the agents
 * that make it safe for an operator to clear one at volume.
 */
export const platformAdminPersona: PersonaModule = {
  id: 'att_platform_admin',
  identity: {
    name: 'Aria N.',
    initials: 'AN',
    role: 'Platform Admin — System Configuration',
    greeting: 'Aria',
  },
  load: () => import('./manifest'),
};
