/**
 * SLED market — State, Local & Education.
 *
 * The civic identity a second SLED tenant inherits WHERE IT DOES NOT OVERRIDE.
 * AMISA, the second tenant, overrides nearly all of it: an association of
 * private international schools has no reason to wear Maryland's Charter Blue.
 * What it does inherit is the market's shape — the picker tile, the wayfinding
 * gradient, and the default client, which stays DoIT.
 *
 * Charter Blue leads
 * because it is the primary the Maryland DoIT site itself uses (#1a4480, its
 * button fill), and it is what `bg-brand text-white` controls fill with — 9.62:1
 * on white, so the contrast is load-bearing rather than decorative.
 *
 * Maryland gold is accent and chart only. At 2.08:1 on white it can never be a
 * control fill or carry body copy; it earns its place as the highest-separation
 * second chart series and as a mark colour.
 */
import type { MarketManifest } from '@core/types';
import { doitClient } from './clients/doit/client.manifest';
import { amisaClient } from './clients/amisa/client.manifest';

export const sledMarket: MarketManifest = {
  id: 'sled',
  name: 'State, Local & Education',
  clients: [doitClient, amisaClient],
  defaultClientId: 'doit',
  theme: {
    light: {
      brand: '#1a4480',
      accent: '#f0a500',
      // Deliberately clear of the emerald/amber/rose band the confidence tiers
      // own, so a chart series is never mistaken for a risk state. #2e8540 and
      // #981b1e are excluded here — they are spoken for as success and critical
      // on the client manifest.
      chart: [
        '#1a4480', // 1 Charter Blue (brand)
        '#f0a500', // 2 Maryland gold — maximum hue separation from series 1
        '#0e7490', // 3 teal
        '#7c3aed', // 4 violet
        '#0b2240', // 5 deep navy
        '#a16207', // 6 bronze
        '#be185d', // 7 magenta
        '#64748b', // 8 slate
      ],
    },
  },
};
