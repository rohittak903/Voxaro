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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devTtsPlugin()],
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
