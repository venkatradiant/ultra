import type { PersonaModule } from '@core/types';

/**
 * Sally "Shift Super" — ground altitude, Unit 2 and Unit 3.
 *
 * Named on the same alliterative convention as Gina "GM". Owns the crews and
 * permits on her units and receives the actions the GM hands down, so the same
 * evidence the GM saw arrives attached rather than re-explained.
 */
export const shiftSupervisorPersona: PersonaModule = {
  id: 'aramco_shift_supervisor',
  identity: {
    name: 'Sally "Shift Super"',
    initials: 'SS',
    role: 'Shift Supervisor, Units 2 and 3',
    greeting: 'Sally',
  },
  load: () => import('./manifest'),
};
