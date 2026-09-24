/**
 * Client: United States Senate Federal Credit Union (USSFCU).
 *
 * Exposes the USSFCU-only Risk & Compliance personas (Evelyn Marsh, VP Compliance,
 * and Nadia Hassan, Compliance Analyst), the executive personas (CFO, CEO), the
 * untitled Finance Team persona, plus the shared generic personas on the base flows, with the talk
 * track's golden path and one wording patch applied in ./talkTrack.ts.
 */
import type { ClientManifest, PersonaModule } from '@core/types';
import { makeOpsPersona } from '../../shared/personas/ops';
import { makeCxPersona } from '../../shared/personas/cx';
import { makeRetentionPersona } from '../../shared/personas/retention';
import { makeRiskPersona } from '../../shared/personas/risk';
import { evelynPersona } from './personas/evelyn';
import { nadiaPersona } from './personas/nadia';
import { cfoPersona } from './personas/cfo';
import { ceoPersona } from './personas/ceo';
import { financePersona } from './personas/finance';
import { withTalkTrack, USSFCU_TALK_TRACK } from './talkTrack';

const CLIENT_ID = 'ussfcu';

/**
 * USSFCU's conversation column. The workspace default (max-w-3xl, 768px) is
 * the measure for a text-first persona; USSFCU's answers carry wide tables
 * and charts, so every persona on this client gets more room. A persona that
 * sets its own `ui.contentMaxWidth` keeps it.
 */
export const USSFCU_CONTENT_MAX_WIDTH = 'max-w-5xl';

/** Applies the USSFCU column width on this client's registration only. */
function withUssfcuLayout(module: PersonaModule): PersonaModule {
  return {
    ...module,
    load: async () => {
      const { default: manifest } = await module.load();
      // A new object: the shared personas' manifests are loaded by other
      // tenants too, and must not change underneath them.
      return {
        default: {
          ...manifest,
          ui: { ...manifest.ui, contentMaxWidth: manifest.ui.contentMaxWidth ?? USSFCU_CONTENT_MAX_WIDTH },
        },
      };
    },
  };
}

export const ussfcuClient: ClientManifest = {
  id: CLIENT_ID,
  marketId: 'financial-services',
  branding: {
    name: 'United States Senate Federal Credit Union',
    shortName: 'USSFCU',
    nameLines: ['United States Senate', 'Federal Credit Union'],
    tagline: 'AI Platform',
    logo: '/ussfcu-seal.png',
    favicon: '/ussfcu-seal.png',
    primaryColor: '#003087',
    navLabels: { journey: 'Member Journey', risk: 'Risk Signals' },
  },
  // Oral Demo Talk Track v3 order: Part 1 (James, Evelyn, Nadia, Tim, Sylvia),
  // then Part 2 (Maya, Priya K., Derek T.). The talk track opens with James, so
  // he is the default. The shared personas follow the talk track via
  // withTalkTrack, on this registration only.
  personas: [
    withTalkTrack(makeRiskPersona(CLIENT_ID), USSFCU_TALK_TRACK.risk),
    evelynPersona,
    nadiaPersona,
    ceoPersona,
    cfoPersona,
    // Finance Team: the narrative prepared for Lauren (six approved finance
    // questions). Not part of Talk Track v3, so it follows Part 1 and leaves
    // the talk track's order and its opening persona unchanged.
    financePersona,
    withTalkTrack(makeOpsPersona(CLIENT_ID), USSFCU_TALK_TRACK.ops),
    withTalkTrack(makeCxPersona(CLIENT_ID), USSFCU_TALK_TRACK.cx),
    withTalkTrack(makeRetentionPersona(CLIENT_ID), USSFCU_TALK_TRACK.retention),
  ].map(withUssfcuLayout),
  defaultPersonaId: 'risk',
};
