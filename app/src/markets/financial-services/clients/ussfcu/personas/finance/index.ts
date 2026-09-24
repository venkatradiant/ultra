import type { PersonaModule } from '@core/types';

export const financePersona: PersonaModule = {
  id: 'ussfcu_finance',
  identity: { name: 'Finance Team', initials: 'FT', role: 'USS FCU Finance', greeting: 'Finance Team' },
  load: () => import('./manifest'),
};
