import type { PersonaModule } from '@core/types';

export const ceoPersona: PersonaModule = {
  id: 'esfcu_ceo',
  identity: { name: 'Girado Smith', initials: 'GS', role: 'President & Chief Executive Officer', greeting: 'Girado' },
  load: () => import('./manifest'),
};
