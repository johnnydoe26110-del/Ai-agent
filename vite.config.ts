import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {generateCaptionsWithGemini} from './server/gemini';
import {scoutGamingClipsWithGemini, computeUSAPeakTimings} from './server/gamingAgent';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      // Endpoint 1: Catchy Captions
      server.middlewares.use('/api/generate-captions', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = body ? JSON.parse(body) : {};
            const suggestions = await generateCaptionsWithGemini({
              topic: data.topic || 'Short video',
              tone: data.tone || 'viral',
              platforms: data.platforms || ['youtube', 'tiktok', 'instagram'],
              videoDurationSec: data.videoDurationSec || 30
            });

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, suggestions }));
          } catch (err) {
            console.error('API /api/generate-captions error:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to generate captions' }));
          }
        });
      });

      // Endpoint 2: AI Gaming Agent - Discover Clips
      server.middlewares.use('/api/agent/discover-clips', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = body ? JSON.parse(body) : {};
            const clips = await scoutGamingClipsWithGemini(data.query || data.game);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, clips }));
          } catch (err) {
            console.error('API /api/agent/discover-clips error:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to scout gaming clips' }));
          }
        });
      });

      // Endpoint 3: USA Peak Algorithmic Timings
      server.middlewares.use('/api/agent/usa-timings', async (req, res) => {
        try {
          const timings = computeUSAPeakTimings();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, timings }));
        } catch (err) {
          console.error('API /api/agent/usa-timings error:', err);
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to compute USA timings' }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
