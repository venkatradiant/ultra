/**
 * Market: Commercial — the third market. Groups commercial / SMB-services tenants
 * (web hosting, domains, subscriptions) exactly like financial-services groups
 * credit unions and healthcare groups care providers.
 *
 * First client: Newfold Digital (cross-brand customer-care intelligence).
 */
import type { MarketManifest } from '@core/types';
import { newfoldDigitalClient } from './clients/newfold-digital/client.manifest';

export const commercialMarket: MarketManifest = {
  id: 'commercial',
  name: 'Commercial',
  clients: [newfoldDigitalClient],
  defaultClientId: 'newfold_digital',
  // Market-wide brand theme — Newfold orange identity + a care-forward palette.
  // Clients may override via their own theme.
  theme: {
    light: {
      brand: '#F27121',
      accent: '#E94057',
      chart: ['#F27121', '#E94057', '#8A2387', '#0ea5e9', '#f59e0b', '#14b8a6', '#ef4444', '#64748b'],
    },
  },
};
