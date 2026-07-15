/**
 * Market: Financial Services — the first (and, pre-refactor, only implicit)
 * market. Groups the credit-union tenants. Additional clients (nfcu, penfed,
 * ussfcu) are added here as they migrate (Phase 4).
 */
import type { MarketManifest } from '@core/types';
import { financialServicesClient } from './clients/financial-services/client.manifest';
import { penfedClient } from './clients/penfed/client.manifest';
import { ussfcuClient } from './clients/ussfcu/client.manifest';
import { nfcuClient } from './clients/nfcu/client.manifest';

export const financialServicesMarket: MarketManifest = {
  id: 'financial-services',
  name: 'Financial Services',
  clients: [financialServicesClient, penfedClient, ussfcuClient, nfcuClient],
  defaultClientId: 'financial_services',
};
