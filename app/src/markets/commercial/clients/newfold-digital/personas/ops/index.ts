import type { PersonaModule } from '@core/types';

export const opsPersona: PersonaModule = {
  id: 'newfold_ops',
  identity: { name: 'Sofia Reyes', initials: 'SR', role: 'Contact Center Operations Manager', greeting: 'Sofia' },
  load: () => import('./manifest'),
};
