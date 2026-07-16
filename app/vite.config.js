import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Path aliases — keep in sync with tsconfig.json "paths".
const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
  '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
  '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
  '@markets': fileURLToPath(new URL('./src/markets', import.meta.url)),
  '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
}

// Dev-only shim: serve /api/tts locally (mirrors the Vercel function) so the real
// ElevenLabs voice plays under `vite` dev. The key is read from .env via loadEnv
// and kept server-side (process.env) — it is NOT exposed to the client bundle.
function ttsDevServer(env) {
  return {
    name: 'ussfcu-tts-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      for (const k of ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'ELEVENLABS_MODEL_ID']) {
        if (env[k] && !process.env[k]) process.env[k] = env[k];
      }
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/tts')) return next();
        try {
          const slide = new URL(req.url, 'http://localhost').searchParams.get('slide');
          const { synthesize } = await import('./api/_tts.js');
          const { buffer, contentType } = await synthesize(slide);
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'no-store');
          res.statusCode = 200;
          res.end(buffer);
        } catch (err) {
          res.statusCode = err?.status || 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'TTS failed' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), ttsDevServer(env)],
    resolve: { alias },
    build: {
      rolldownOptions: {
        output: {
          advancedChunks: {
            groups: [
              // personaFlowConfigs is ~562kB of scripted demo dialogue reached
              // only from lazily-loaded persona manifests. Rolldown chunked it
              // out on its own until a second dynamic route entered the graph,
              // at which point it inlined it into the eager entry. Pin it so the
              // initial bundle doesn't carry every persona's script.
              { name: 'personaFlowConfigs', test: /src[\\/]data[\\/]personaFlowConfigs/ },
            ],
          },
        },
      },
    },
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: false,
    },
  };
})
