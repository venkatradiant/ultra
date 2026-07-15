import { describe, it, expect } from 'vitest';
import { getMarkets, findClient, getPersonaModule } from './registry';

describe('registry (multi-market)', () => {
  it('registers more than one market', () => {
    const ids = getMarkets().map((d) => d.id);
    expect(ids).toContain('financial-services');
    expect(ids).toContain('healthcare');
  });

  it('resolves a client from the financial-services market', () => {
    const found = findClient('nfcu');
    expect(found?.market.id).toBe('financial-services');
  });

  it('resolves a client from the healthcare market', () => {
    const found = findClient('riverside_health');
    expect(found?.market.id).toBe('healthcare');
    expect(found?.client.defaultPersonaId).toBe('care_ops');
  });

  it('finds a persona module across markets', () => {
    expect(getPersonaModule('riverside_health', 'care_ops')?.id).toBe('care_ops');
    expect(getPersonaModule('nfcu', 'nfcu_supervisor')?.id).toBe('nfcu_supervisor');
  });

  it('returns null for an unknown client', () => {
    expect(findClient('does_not_exist')).toBeNull();
  });
});
