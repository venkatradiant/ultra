/**
 * USSFCU's wider conversation column applies to every USSFCU persona — its own
 * and the shared ones it registers — and to no other tenant. The shared
 * ops/cx/retention/risk manifests are loaded by PenFed and the Financial
 * Services client as well, so the width must be applied to USSFCU's
 * registration only, never to the shared objects.
 */
import { describe, it, expect } from 'vitest';
import type { ClientManifest, PersonaManifest } from '@core/types';
import { ussfcuClient, USSFCU_CONTENT_MAX_WIDTH } from '@/markets/financial-services/clients/ussfcu/client.manifest';
import { penfedClient } from '@/markets/financial-services/clients/penfed/client.manifest';
import { financialServicesClient } from '@/markets/financial-services/clients/financial-services/client.manifest';

async function loadAll(client: ClientManifest): Promise<PersonaManifest[]> {
  return Promise.all(client.personas.map(async (p) => (await p.load()).default));
}

describe('USSFCU conversation width', () => {
  it('widens the column for every USSFCU persona', async () => {
    expect(USSFCU_CONTENT_MAX_WIDTH).toBe('max-w-5xl');
    const manifests = await loadAll(ussfcuClient);
    expect(manifests).toHaveLength(9);
    for (const m of manifests) expect(m.ui.contentMaxWidth, m.id).toBe(USSFCU_CONTENT_MAX_WIDTH);
  });

  it.each([
    ['penfed', penfedClient],
    ['financial-services', financialServicesClient],
  ] as const)('leaves %s on the default width', async (_name, client) => {
    await loadAll(ussfcuClient); // loaded first, so a leak into shared objects would show
    for (const m of await loadAll(client)) expect(m.ui.contentMaxWidth, m.id).not.toBe(USSFCU_CONTENT_MAX_WIDTH);
  });
});
