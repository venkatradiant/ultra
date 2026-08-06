/**
 * Telecommunications market — the AI Billing Workbench, AT&T-branded.
 *
 * The palette is AT&T's own, sampled from the globe the client supplied:
 * #3EB1EA. That exact blue cannot be the `brand` token — brand is what the
 * sidebar's active nav and every primary button fill with white text on top,
 * and #3EB1EA against white text is roughly 2.2:1, well under any readable
 * threshold. So the globe blue becomes `accent` (marks, highlights, chart-1)
 * and the brand is AT&T's deeper interface blue #0568AE, which clears 4.5:1
 * and still reads unmistakably as AT&T beside the mark.
 *
 * This supersedes spec §12's "navy primary, gold accent": the spec wrote that
 * before a client brand was chosen, and an AT&T-branded demo in Radiant navy
 * would be neither.
 */
import type { MarketManifest } from '@core/types';
import { attClient } from './clients/att/client.manifest';

export const telecomMarket: MarketManifest = {
  id: 'telecom',
  name: 'Telecommunications',
  clients: [attClient],
  defaultClientId: 'att',
  theme: {
    light: {
      // AT&T deep interface blue — controls, active nav, primary buttons.
      brand: '#0568AE',
      // The globe blue itself. Accent only: never a surface behind white text.
      accent: '#3EB1EA',
      // Led by the two AT&T blues. The rest stay clear of the emerald/amber/rose
      // band the confidence tiers own, so a chart series is never mistaken for
      // a risk state.
      chart: ['#0568AE', '#3EB1EA', '#00388F', '#7C3AED', '#0F766E', '#C79214', '#DB2777', '#64748B'],
    },
  },
};
