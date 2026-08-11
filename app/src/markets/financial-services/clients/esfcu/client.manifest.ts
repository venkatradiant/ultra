/**
 * Client: Educational Systems Federal Credit Union (ESFCU), Greenbelt, Maryland.
 *
 * A Tier-1, single-persona reference demo for Girado Smith, CPA, President and
 * CEO — the executive briefing built around one hero issue: loan demand
 * outpacing member deposit growth, with the Howard University merger and the
 * education-sector deposit seasonality fragmenting the funding picture across
 * systems.
 *
 * Two personas as of the CRO build: Girado Smith (CEO, the funding story) and
 * Renata Alvarez (CRO, the fraud and BSA story). Spec §15 of the CRO document
 * calls for exactly this — one shell, one switcher, each persona landing on its
 * own Ask the AI briefing over shared chat, trust-strip and KPI plumbing.
 *
 * Note the asymmetry the switcher has to carry honestly: Girado is ESFCU's real,
 * named CEO; Renata is a representative persona because ESFCU's actual risk
 * leader is not public. The Data Sources posture panel states that on screen.
 *
 * Palette: `#003768` is ESFCU's real navy, sampled from the mark on esfcu.org.
 * The mark's second colour is a deep maroon (#8a0d04) which is NOT used as a UI
 * accent — it sits close enough to the critical-severity red that SignalCard and
 * the trust strip use that a maroon emphasis chip would read as an alert. Maroon
 * stays in the logo lockup; the emphasis accent is a warm amber instead.
 *
 * NOTE: ESFCU brand treatment is illustrative for this build pending the brand
 * kit — the Data Sources posture panel says so on screen.
 */
import type { ClientManifest } from '@core/types';
import { ceoPersona } from './personas/ceo';
import { croPersona } from './personas/cro';

export const esfcuClient: ClientManifest = {
  id: 'esfcu',
  marketId: 'financial-services',
  branding: {
    name: 'Educational Systems Federal Credit Union',
    shortName: 'ESFCU',
    nameLines: ['Educational Systems', 'Federal Credit Union'],
    tagline: 'Executive Intelligence',
    logo: '/logos/esfcu-logo.svg',
    favicon: '/logos/esfcu-logo.svg',
    primaryColor: '#003768',
    // Pure executive altitude — the two default detail pages are reframed as the
    // business roll-up and the state-of-the-business signal set. Duplicated on
    // the persona manifest and in TopHeader's personaNavLabels; all three agree.
    navLabels: { journey: 'Business Performance', risk: 'Priority Signals' },
  },
  personas: [ceoPersona, croPersona],
  defaultPersonaId: 'esfcu_ceo',
  theme: {
    light: {
      brand: '#003768',
      // Warm amber emphasis. Deliberately not the mark's maroon (see above), and
      // deliberately warmer than the `warning` amber so brand emphasis and a
      // warning state stay distinguishable side by side.
      accent: '#B45309',
      // Led by the ESFCU navy, then the amber. The remainder stay clear of the
      // emerald/amber/rose band the confidence tiers own so a chart series is
      // never mistaken for a risk state.
      chart: ['#003768', '#B45309', '#0E7490', '#1E4FA3', '#7C3AED', '#0F766E', '#9A3412', '#64748B'],
    },
    // Editorial serif for display headlines against the clean sans for data and
    // labels (spec §15a, "Visual design direction"). Fraunces is already loaded
    // by index.css — this is the default display face, named explicitly so the
    // intent survives a future change to the base.
    fonts: { display: "'Fraunces', Georgia, serif" },
  },
};
