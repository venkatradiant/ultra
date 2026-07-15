// GET /api/tts?slide=<slideId> → ElevenLabs MP3 for that slide's speaker notes.
// The API key stays server-side (ELEVENLABS_API_KEY). Responses are CDN-cached
// so ElevenLabs is billed ~once per slide per deploy, not per playback.
import { synthesize, TtsError } from './_tts.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const slide = req.query?.slide;
  try {
    const { buffer, contentType } = await synthesize(slide);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, s-maxage=31536000, max-age=86400, immutable');
    res.status(200).send(buffer);
  } catch (err) {
    const status = err instanceof TtsError ? err.status : 500;
    // No caching of errors, so a transient failure can be retried.
    res.setHeader('Cache-Control', 'no-store');
    res.status(status).json({ error: err?.message || 'TTS failed' });
  }
}
