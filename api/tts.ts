import https from 'https';

function fetchGoogleTtsChunk(text: string, lang: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
    https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`TTS responded with status ${res.statusCode}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }
    ).on('error', reject);
  });
}

function splitTextIntoChunks(text: string, maxLen = 170): string[] {
  const sentences = text.split(/([.!?;?\n]+)/g).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    if ((current + part).length <= maxLen) {
      current += part;
    } else {
      if (current.trim()) chunks.push(current.trim());
      if (part.length > maxLen) {
        const words = part.split(/\s+/);
        let wordChunk = '';
        for (const w of words) {
          if ((wordChunk + ' ' + w).length <= maxLen) {
            wordChunk += (wordChunk ? ' ' : '') + w;
          } else {
            if (wordChunk.trim()) chunks.push(wordChunk.trim());
            wordChunk = w;
          }
        }
        current = wordChunk;
      } else {
        current = part;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawText = (req.query?.text || (req.body && req.body.text) || '').toString().trim();
  const rawLang = (req.query?.lang || (req.body && req.body.lang) || 'en').toString().toLowerCase().split('-')[0];

  if (!rawText) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  // Clean pause markers
  const cleanText = rawText.replace(/\[pause:([\d.]+(?:s|ms)?)\]/gi, ', ');
  const chunks = splitTextIntoChunks(cleanText, 170);

  try {
    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      if (chunk.trim()) {
        const buf = await fetchGoogleTtsChunk(chunk.trim(), rawLang);
        audioBuffers.push(buf);
      }
    }
    const combined = Buffer.concat(audioBuffers);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.send(combined);
  } catch (err: any) {
    console.error('TTS synthesis error', err);
    return res.status(500).json({ error: 'Failed to synthesize voice audio', details: err.message });
  }
}
