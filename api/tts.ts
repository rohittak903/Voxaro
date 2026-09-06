import https from 'https';

const TTS_ENDPOINTS = [
  (text: string, lang: string) => `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`,
  (text: string, lang: string) => `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=gtx`,
  (text: string, lang: string) => `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=gtx`
];

function fetchTtsWithEndpoint(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
        timeout: 8000
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

async function fetchGoogleTtsChunk(text: string, lang: string): Promise<Buffer> {
  let lastError: any = null;
  for (const getUrl of TTS_ENDPOINTS) {
    try {
      const url = getUrl(text, lang);
      const buffer = await fetchTtsWithEndpoint(url);
      if (buffer && buffer.length > 100) {
        return buffer;
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All TTS endpoints failed');
}

function splitTextIntoChunks(text: string, maxLen = 180): string[] {
  if (text.length <= maxLen) return [text];

  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxLen) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) chunks.push(current);
      current = word;
    }
  }
  if (current) chunks.push(current);
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

  // Clean pause markers and sanitize text
  const cleanText = rawText
    .replace(/\[pause:([\d.]+(?:s|ms)?)\]/gi, ', ')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
    .trim();

  const chunks = splitTextIntoChunks(cleanText, 180);

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
