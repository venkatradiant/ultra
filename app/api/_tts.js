// Shared ElevenLabs text-to-speech core. Used by the Vercel serverless function
// (api/tts.js) in production and by the Vite dev middleware locally, so the API
// key only ever lives server-side — never in the client bundle.
import { createRequire } from 'node:module';

// require() of JSON works on every Node version and is reliably traced/bundled
// by Vercel (avoids import-attribute version differences).
const require = createRequire(import.meta.url);

// Narration banks, one per tenant whose deck has an audio briefing. This used to
// be a single hard-wired import of the USSFCU file, which meant ESFCU's deck
// asked for its own slide ids and was served USSFCU's script — the right voice
// reading the wrong briefing. Adding a tenant here is the only step needed to
// give a new deck its own voiceover.
//
// The lookup stays server-side and allowlisted: the client sends a tenant and a
// slide id, never text, so no caller can run up ElevenLabs usage with arbitrary
// input.
const NARRATION = {
  ussfcu: require('../src/data/ussfcu/ceo/presentationNarration.json').narration,
  esfcu: require('../src/data/esfcu/ceo/presentationNarration.json').narration,
};

// `ussfcu` is the default so existing links and any cached client build that
// omits the parameter keep working exactly as before.
const DEFAULT_TENANT = 'ussfcu';

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

function bankFor(tenant) {
  const key = typeof tenant === 'string' && tenant ? tenant : DEFAULT_TENANT;
  return NARRATION[key] || null;
}

export class TtsError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'TtsError';
    this.status = status;
  }
}

export function isValidSlide(slideId, tenant) {
  const bank = bankFor(tenant);
  return !!bank && typeof slideId === 'string' && Object.prototype.hasOwnProperty.call(bank, slideId);
}

// Render a slide's speaker notes to MP3 via ElevenLabs. Keyed by tenant +
// slideId only — the text is looked up server-side (allowlist), so the client
// can never submit arbitrary text to run up usage.
export async function synthesize(slideId, tenant) {
  const bank = bankFor(tenant);
  if (!bank) throw new TtsError(400, `Unknown tenant: ${tenant}`);
  if (!isValidSlide(slideId, tenant)) throw new TtsError(400, `Unknown slide: ${slideId}`);
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
