import type { PersonaModule } from '@core/types';

export const nadiaPersona: PersonaModule = {
  id: 'ussfcu_nadia',
  identity: { name: 'Nadia Hassan', initials: 'NH', role: 'Compliance Analyst', greeting: 'Nadia' },
  load: () => import('./manifest'),
};
