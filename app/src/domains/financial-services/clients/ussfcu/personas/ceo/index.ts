import type { PersonaModule } from '@core/types';

export const ceoPersona: PersonaModule = {
  id: 'ussfcu_ceo',
  identity: { name: 'Timothy L. Anderson', initials: 'TA', role: 'President & Chief Executive Officer', greeting: 'Tim' },
  load: () => import('./manifest'),
};
