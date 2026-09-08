import type { PersonaModule } from '@core/types';

/**
 * Fassy — ground altitude, RFCC-2 and DCU-3.
 *
 * Named on the same alliterative convention as Abidul. Owns the crews and
 * permits on her units and receives the actions the GM hands down, so the same
 * evidence the GM saw arrives attached rather than re-explained.
 */
export const shiftSupervisorPersona: PersonaModule = {
  id: 'adnoc_shift_supervisor',
  identity: {
    name: 'Fassy',
    initials: 'FA',
    role: 'Shift Supervisor, RFCC-2 and DCU-3',
    greeting: 'Fassy',
  },
  load: () => import('./manifest'),
};
