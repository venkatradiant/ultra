// Shared ElevenLabs text-to-speech core. Used by the Vercel serverless function
// (api/tts.js) in production and by the Vite dev middleware locally, so the API
// key only ever lives server-side — never in the client bundle.
import { createRequire } from 'node:module';

// require() of JSON works on every Node version and is reliably traced/bundled
// by Vercel (avoids import-attribute version differences).
const require = createRequire(import.meta.url);

// Narration banks, keyed tenant → persona. This used to be a single hard-wired
// import of the USSFCU file, which meant ESFCU's deck asked for its own slide
// ids and was served USSFCU's script — the right voice reading the wrong
// briefing. It then became tenant-keyed, which was enough until one tenant had
// two decks.
//
// ESFCU's CEO and CRO decks share slide ids (`assurance`, `nextSteps`), and
// api/tts.js sets `Cache-Control: immutable, s-maxage=31536000` — so the URL is
// the cache key and whichever deck played first would pin its MP3 for a year for
// both. A wrong-briefing failure with no error, no log, and a one-year lifetime.
// Hence the second level.
//
// The lookup stays server-side and allowlisted: the client sends a tenant, a
// persona and a slide id — never text — so no caller can run up ElevenLabs usage
// with arbitrary input. Adding a deck is one line here.
const NARRATION = {
  ussfcu: {
    ceo: require('../src/data/ussfcu/ceo/presentationNarration.json').narration,
  },
  esfcu: {
    ceo: require('../src/data/esfcu/ceo/presentationNarration.json').narration,
    cro: require('../src/data/esfcu/cro/presentationNarration.json').narration,
  },
};

// These defaults are load-bearing for compatibility, not laziness: existing
// links and any cached client build that omits a parameter must keep resolving
// to exactly what they resolved to before, or a year of cached audio 400s.
const DEFAULT_TENANT = 'ussfcu';
const DEFAULT_PERSONA = 'ceo';

// Shared voice for every CEO briefing — ESFCU is deliberately the same voice as
// USSFCU. Override with ELEVENLABS_VOICE_ID to use any voice from your account.
//
// A voice id is an identifier, not a credential: it selects a voice and cannot
// authenticate anything, which is why it can live here while the API key can
// only ever come from the environment.
//
// Changing this REQUIRES bumping NARRATION_VERSION in both decks' useNarration.js
// — responses are CDN-cached by URL and the URL does not include the voice, so
// stale clips in the previous voice would keep being served.
const DEFAULT_VOICE_ID = 'cz6NPALEx89fUgSSZqam';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

function bankFor(tenant, persona) {
  const t = typeof tenant === 'string' && tenant ? tenant : DEFAULT_TENANT;
  const p = typeof persona === 'string' && persona ? persona : DEFAULT_PERSONA;
  return NARRATION[t]?.[p] || null;
}

export class TtsError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'TtsError';
    this.status = status;
  }
}

export function isValidSlide(slideId, tenant, persona) {
  const bank = bankFor(tenant, persona);
  return !!bank && typeof slideId === 'string' && Object.prototype.hasOwnProperty.call(bank, slideId);
}

// Render a slide's speaker notes to MP3 via ElevenLabs. Keyed by tenant +
// persona + slideId only — the text is looked up server-side (allowlist), so the
// client can never submit arbitrary text to run up usage.
export async function synthesize(slideId, tenant, persona) {
  const bank = bankFor(tenant, persona);
  if (!bank) throw new TtsError(400, `Unknown deck: ${tenant}/${persona}`);
  if (!isValidSlide(slideId, tenant, persona)) throw new TtsError(400, `Unknown slide: ${slideId}`);
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new TtsError(503, 'ELEVENLABS_API_KEY is not configured');

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text: bank[slideId],
      model_id: modelId,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new TtsError(502, `ElevenLabs error ${resp.status}: ${detail.slice(0, 300)}`);
  }
  return { buffer: Buffer.from(await resp.arrayBuffer()), contentType: 'audio/mpeg' };
}
