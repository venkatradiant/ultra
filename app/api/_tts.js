// Shared ElevenLabs text-to-speech core. Used by the Vercel serverless function
// (api/tts.js) in production and by the Vite dev middleware locally, so the API
// key only ever lives server-side — never in the client bundle.
import { createRequire } from 'node:module';

// require() of JSON works on every Node version and is reliably traced/bundled
// by Vercel (avoids import-attribute version differences).
const require = createRequire(import.meta.url);
const { narration } = require('../src/data/ussfcu/ceo/presentationNarration.json');

// Default voice for the CEO briefing. Override with ELEVENLABS_VOICE_ID to use
// any voice from your account.
const DEFAULT_VOICE_ID = 'D3VCLJOhFBmI8f7VjA5S';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

export class TtsError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'TtsError';
    this.status = status;
  }
}

export function isValidSlide(slideId) {
  return typeof slideId === 'string' && Object.prototype.hasOwnProperty.call(narration, slideId);
}

// Render a slide's speaker notes to MP3 via ElevenLabs. Keyed by slideId only —
// the text is looked up server-side (allowlist), so the client can never submit
// arbitrary text to run up usage.
export async function synthesize(slideId) {
  if (!isValidSlide(slideId)) throw new TtsError(400, `Unknown slide: ${slideId}`);
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new TtsError(503, 'ELEVENLABS_API_KEY is not configured');

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text: narration[slideId],
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
