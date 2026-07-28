import type { PersonaModule } from '@core/types';

export const memberPersona: PersonaModule = {
  id: 'newfold_member',
  identity: { name: 'Grace Bello', initials: 'GB', role: 'Small Business Customer (Self-Service)', greeting: 'Grace' },
  load: () => import('./manifest'),
};
