import type { PersonaModule } from '@core/types';

export function makeRetentionPersona(clientId: string): PersonaModule {
  return {
    id: 'retention',
    identity: { name: 'Derek T.', initials: 'DT', role: 'Member Retention', greeting: 'Derek' },
    load: () => import('./manifest').then((m) => ({ default: m.default(clientId) })),
  };
}
