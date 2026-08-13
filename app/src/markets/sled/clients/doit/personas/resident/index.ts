import type { PersonaModule } from '@core/types';

export const residentPersona: PersonaModule = {
  id: 'doit_resident',
  identity: { name: 'Maryland Resident', initials: 'MR', role: 'Resident — anonymous', greeting: 'there' },
  load: () => import('./manifest'),
};
