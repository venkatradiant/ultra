import type { PersonaModule } from '@core/types';

export const memberPersona: PersonaModule = {
  id: 'nfcu_member',
  identity: { name: 'Elena Ruiz', initials: 'ER', role: 'Navy Federal Member (Self-Service)', greeting: 'Elena' },
  load: () => import('./manifest'),
};
