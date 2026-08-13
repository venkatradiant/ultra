import type { PersonaModule } from '@core/types';

/**
 * `MJ` is also the generic ops persona's initials (Maya J.). That is legal —
 * nothing in the codebase asserts initials uniqueness at any level, and
 * manifests.test only checks persona-id uniqueness within a client. Left as-is
 * deliberately; please don't "fix" it.
 */
export const adminPersona: PersonaModule = {
  id: 'doit_admin',
  identity: { name: 'Marcus Johnson', initials: 'MJ', role: 'Survey Administrator', greeting: 'Marcus' },
  load: () => import('./manifest'),
};
