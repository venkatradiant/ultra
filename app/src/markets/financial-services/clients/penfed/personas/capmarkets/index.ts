import type { PersonaModule } from '@core/types';

export const capmarketsPersona: PersonaModule = {
  id: 'capmarkets',
  identity: { name: 'Sowmya Ha', initials: 'SH', role: 'Capital Markets Risk', greeting: 'Sowmya' },
  load: () => import('./manifest'),
};
