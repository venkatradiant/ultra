/**
 * Oil & Gas market.
 *
 * Carries the client's palette. Aramco leads the identity here and TrackLynk —
 * the product — is the footer mark, so the colours are Aramco's own.
 *
 * Blue leads rather than green on purpose: this is a safety product, where
 * green already means "compliant" and "all accounted for". A green primary
 * button sitting beside green status badges would blunt both.
 */
import type { MarketManifest } from '@core/types';
import { aramcoClient } from './clients/aramco/client.manifest';

export const oilGasMarket: MarketManifest = {
  id: 'oil_gas',
  name: 'Oil & Gas',
  clients: [aramcoClient],
  defaultClientId: 'aramco',
  theme: {
    light: {
      // Aramco blue — nav, active states, buttons, chart-1.
      brand: '#0071CE',
      // Aramco green, from the emblem gradient. Accent only, never a control.
      accent: '#009639',
      // No `critical` override: with a blue brand the default red is already
      // unmistakable as hazard. (The earlier coral brand needed one.)
      chart: ['#0071CE', '#009639', '#7AB800', '#0093D0', '#D97706', '#7C3AED', '#DB2777', '#64748B'],
    },
  },
};
