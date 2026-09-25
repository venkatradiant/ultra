import type { PersonaModule } from '@core/types';

export const financePersona: PersonaModule = {
  id: 'ussfcu_finance',
  identity: { name: 'Fiona F', initials: 'FI', role: 'Finance Team', greeting: 'Fiona' },
  load: () => import('./manifest'),
};
