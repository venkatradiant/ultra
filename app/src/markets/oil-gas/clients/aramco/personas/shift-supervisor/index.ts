import type { PersonaModule } from '@core/types';

/**
 * Shift Supervisor — ground altitude, Unit 2 and Unit 3.
 *
 * Title only, matching the HSE GM. Owns the crews and permits on their units
 * and receives the actions the GM hands down, so the same evidence the GM saw
 * arrives attached rather than re-explained.
 */
export const shiftSupervisorPersona: PersonaModule = {
  id: 'aramco_shift_supervisor',
  identity: {
    name: 'Shift Supervisor',
    initials: 'SS',
    role: 'Shift Supervisor, Units 2 and 3',
    greeting: 'Supervisor',
  },
  load: () => import('./manifest'),
};
