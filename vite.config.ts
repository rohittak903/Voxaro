import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import https from 'https';

function devTtsPlugin() {
  return {
    name: 'dev-tts-middleware',
    configureServer(server: any) {
      server.middlewares.use('/api/tts', async (req: any, res: any) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const text = urlObj.searchParams.get('text') || '';
          const lang = (urlObj.searchParams.get('lang') || 'en').toLowerCase().split('-')[0];

          if (!text) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Text parameter required' }));
            return;
          }

          const sentences = text.replace(/\[pause:([\d.]+(?:s|ms)?)\]/gi, ', ').split(/([.!?;।\n]+)/g).filter(Boolean);
          const chunks: string[] = [];
          let current = '';
          for (const s of sentences) {
            if ((current + s).length <= 170) {
              current += s;
            } else {
              if (current.trim()) chunks.push(current.trim());
              current = s;
            }
          }
          if (current.trim()) chunks.push(current.trim());

          const buffers: Buffer[] = [];
          for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk.trim())}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
            const buf = await new Promise<Buffer>((resolveBuf, rejectBuf) => {
              https.get(
                googleUrl,
                { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://translate.google.com/' } },
                (ttsRes) => {
                  const data: Buffer[] = [];
                  ttsRes.on('data', (d) => data.push(Buffer.from(d)));
                  ttsRes.on('end', () => resolveBuf(Buffer.concat(data)));
                }
              ).on('error', rejectBuf);
            });
            buffers.push(buf);
          }
          const combined = Buffer.concat(buffers);
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(combined);
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

const localDevSyncStore: Record<string, any> = {};

function devSyncPlugin() {
  return {
    name: 'dev-sync-middleware',
    configureServer(server: any) {
      server.middlewares.use('/api/sync', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const email = (urlObj.searchParams.get('email') || '').toLowerCase().trim();
          if (!email) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Email query parameter required' }));
            return;
          }
          const accountData = localDevSyncStore[email] || null;
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, email, found: !!accountData, data: accountData }));
          return;
        }

        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const email = (body.email || '').toLowerCase().trim();
              if (!email) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Email required in body' }));
                return;
              }
              const existing = localDevSyncStore[email] || {};
              const merged = { ...existing, ...body, email, lastSyncedAt: new Date().toISOString() };
              localDevSyncStore[email] = merged;
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, email, lastSyncedAt: merged.lastSyncedAt, data: merged }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devTtsPlugin(), devSyncPlugin()],
  base: '/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  }
});
