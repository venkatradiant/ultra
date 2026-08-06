import type { PersonaModule } from '@core/types';

/**
 * Connor "Complex" — Complex Manager (site VP), the highest altitude.
 *
 * Demonstrates the same intelligence rolled up across units: exposure per unit,
 * the schedule-versus-safety trade-off, and the figures that leave the site for
 * the regulator and the board's safety committee.
 */
export const complexManagerPersona: PersonaModule = {
  id: 'aramco_complex_manager',
  identity: {
    name: 'Connor "Complex"',
    initials: 'CC',
    role: 'Complex Manager, Refining and Petrochemical Site',
    greeting: 'Connor',
  },
  load: () => import('./manifest'),
};
