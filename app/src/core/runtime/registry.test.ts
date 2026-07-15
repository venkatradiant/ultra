import { describe, it, expect } from 'vitest';
import { getDomains, findClient, getPersonaModule } from './registry';

describe('registry (multi-domain)', () => {
  it('registers more than one domain', () => {
    const ids = getDomains().map((d) => d.id);
    expect(ids).toContain('financial-services');
    expect(ids).toContain('healthcare');
  });

  it('resolves a client from the financial-services domain', () => {
    const found = findClient('nfcu');
    expect(found?.domain.id).toBe('financial-services');
  });

  it('resolves a client from the healthcare domain', () => {
    const found = findClient('riverside_health');
    expect(found?.domain.id).toBe('healthcare');
    expect(found?.client.defaultPersonaId).toBe('care_ops');
  });

  it('finds a persona module across domains', () => {
    expect(getPersonaModule('riverside_health', 'care_ops')?.id).toBe('care_ops');
    expect(getPersonaModule('nfcu', 'nfcu_supervisor')?.id).toBe('nfcu_supervisor');
  });

  it('returns null for an unknown client', () => {
    expect(findClient('does_not_exist')).toBeNull();
  });
});
