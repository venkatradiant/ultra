import type { PersonaModule } from '@core/types';

export const authorPersona: PersonaModule = {
  id: 'doit_author',
  identity: { name: 'Sarah Chen', initials: 'SC', role: 'Survey Author', greeting: 'Sarah' },
  load: () => import('./manifest'),
};
