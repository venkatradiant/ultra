import type { PersonaModule } from '@core/types';

/**
 * Hussain — Complex Manager (site VP), the highest altitude.
 *
 * Demonstrates the same intelligence rolled up across units: exposure per unit,
 * the schedule-versus-safety trade-off, and the figures that leave the site for
 * the regulator and the board's safety committee.
 */
export const complexManagerPersona: PersonaModule = {
  id: 'adnoc_complex_manager',
  identity: {
    name: 'Hussain',
    initials: 'HU',
    role: 'Complex Manager, Ruwais Industrial Complex',
    greeting: 'Hussain',
  },
  load: () => import('./manifest'),
};
