/**
 * Market: Healthcare — the second market, proving the platform's top axis. It
 * groups healthcare tenants exactly like financial-services groups credit unions.
 */
import type { MarketManifest } from '@core/types';
import { riversideHealthClient } from './clients/riverside-health/client.manifest';

export const healthcareMarket: MarketManifest = {
  id: 'healthcare',
  name: 'Healthcare',
  clients: [riversideHealthClient],
  defaultClientId: 'riverside_health',
  // Market-wide brand theme — teal identity + a care-forward chart palette.
  // Clients may override. Demonstrates the BrandTheme contract (colors + chart palette).
  theme: {
    light: {
      brand: '#0f766e',
      accent: '#0ea5e9',
      chart: ['#0f766e', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6', '#ec4899', '#64748b'],
    },
  },
};
