/**
 * Client: United States Senate Federal Credit Union (USSFCU).
 *
 * Exposes the USSFCU-only Risk & Compliance personas (Evelyn Marsh, VP Compliance,
 * and Nadia Hassan, Compliance Analyst) and the executive personas
 * (CFO, CEO), plus the shared generic personas on the base flows, with the talk
 * track's golden path and one wording patch applied in ./talkTrack.ts.
 */
import type { ClientManifest } from '@core/types';
import { makeOpsPersona } from '../../shared/personas/ops';
import { makeCxPersona } from '../../shared/personas/cx';
import { makeRetentionPersona } from '../../shared/personas/retention';
import { makeRiskPersona } from '../../shared/personas/risk';
import { evelynPersona } from './personas/evelyn';
import { nadiaPersona } from './personas/nadia';
import { cfoPersona } from './personas/cfo';
import { ceoPersona } from './personas/ceo';
import { withTalkTrack, USSFCU_TALK_TRACK } from './talkTrack';

const CLIENT_ID = 'ussfcu';

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
    withTalkTrack(makeOpsPersona(CLIENT_ID), USSFCU_TALK_TRACK.ops),
    withTalkTrack(makeCxPersona(CLIENT_ID), USSFCU_TALK_TRACK.cx),
    withTalkTrack(makeRetentionPersona(CLIENT_ID), USSFCU_TALK_TRACK.retention),
  ],
  defaultPersonaId: 'risk',
};
