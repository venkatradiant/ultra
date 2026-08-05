import type { PersonaModule } from '@core/types';

/**
 * Complex Manager (site VP) — the highest altitude.
 *
 * Demonstrates the same intelligence rolled up across units: exposure per unit,
 * the schedule-versus-safety trade-off, and the figures that leave the site for
 * the regulator and the board's safety committee.
 */
export const complexManagerPersona: PersonaModule = {
  id: 'aramco_complex_manager',
  identity: {
    name: 'Complex Manager',
    initials: 'CM',
    role: 'Complex Manager, Refining and Petrochemical Site',
    greeting: 'Complex Manager',
  },
  load: () => import('./manifest'),
};
