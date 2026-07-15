import type { PersonaModule } from '@core/types';

export const supervisorPersona: PersonaModule = {
  id: 'nfcu_supervisor',
  identity: { name: 'Priya Kapoor', initials: 'PK', role: 'Contact Center Operations Manager', greeting: 'Priya' },
  load: () => import('./manifest'),
};
