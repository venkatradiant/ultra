/**
 * Domain: Healthcare — the second domain, proving the platform's top axis. It
 * groups healthcare tenants exactly like financial-services groups credit unions.
 */
import type { DomainManifest } from '@core/types';
import { riversideHealthClient } from './clients/riverside-health/client.manifest';

export const healthcareDomain: DomainManifest = {
  id: 'healthcare',
  name: 'Healthcare',
  clients: [riversideHealthClient],
  defaultClientId: 'riverside_health',
  // Domain-wide brand theme — teal identity + a care-forward chart palette, with
  // a brighter brand for dark mode. Clients may override. Demonstrates the full
  // BrandTheme contract (colors + dark variant + chart palette).
  theme: {
    light: {
      brand: '#0f766e',
      accent: '#0ea5e9',
      chart: ['#0f766e', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6', '#ec4899', '#64748b'],
    },
    dark: {
      brand: '#2dd4bf',
      accent: '#38bdf8',
    },
  },
};
