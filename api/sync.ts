import fs from 'fs';
import path from 'path';

// In-memory cloud cache for fast responses
const memoryStore: Record<string, any> = {};

function sanitizeTopic(email: string): string {
  return 'voxaro_sync_' + Buffer.from(email.toLowerCase().trim()).toString('hex').slice(0, 48);
}

function getStoreFilePath(): string {
  const tmpDir = process.env.TMPDIR || process.env.TEMP || '/tmp';
  return path.join(tmpDir, 'voxaro_cloud_sync_db.json');
}

function loadFileStore(): Record<string, any> {
  try {
    const filePath = getStoreFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    // fallback
  }
  return {};
}

function saveFileStore(store: Record<string, any>) {
  try {
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(store), 'utf-8');
  } catch (err) {
    // fallback
  }
}

async function fetchFromCloudTopic(email: string): Promise<any | null> {
  try {
    const topic = sanitizeTopic(email);
    const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1`);
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return null;

    // Get the latest message event
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(lines[i]);
        if (item.event === 'message' && item.message) {
          return JSON.parse(item.message);
        }
      } catch {}
    }
  } catch (e) {
    // offline fallback
  }
  return null;
}

async function pushToCloudTopic(email: string, data: any): Promise<void> {
  try {
    const topic = sanitizeTopic(email);
    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: {
        'Title': 'Account Sync',
        'Tags': 'sync,account'
      },
      body: JSON.stringify(data)
    });
  } catch (e) {
    // fallback
  }
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch account state by email across all devices
  if (req.method === 'GET') {
    const email = (req.query?.email || '').toString().toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    const fileStore = loadFileStore();
    let accountData = memoryStore[email] || fileStore[email] || null;

    // Pull from cloud topic if not present or to ensure freshest cross-device sync
    const cloudData = await fetchFromCloudTopic(email);
    if (cloudData) {
      accountData = {
        ...(accountData || {}),
        ...cloudData,
        email
      };
      memoryStore[email] = accountData;
      fileStore[email] = accountData;
      saveFileStore(fileStore);
    }

    return res.status(200).json({
      success: true,
      email,
      found: !!accountData,
      data: accountData || null
    });
  }

  // POST: Sync/Save account state
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const email = (body?.email || '').toString().toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ error: 'Email is required in payload' });
    }

    const fileStore = loadFileStore();
    const existing = memoryStore[email] || fileStore[email] || {};

    const mergedData = {
      ...existing,
      ...body,
      email,
      lastSyncedAt: new Date().toISOString()
    };

    // Keep history deduplicated and sorted by date
    if (Array.isArray(body.history)) {
      const existingHistory: any[] = Array.isArray(existing.history) ? existing.history : [];
      const historyMap = new Map<string, any>();
      
      existingHistory.forEach(item => {
        if (item && item.id) historyMap.set(item.id, item);
      });
      body.history.forEach((item: any) => {
        if (item && item.id) historyMap.set(item.id, item);
      });

      mergedData.history = Array.from(historyMap.values())
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 100);
    }

    memoryStore[email] = mergedData;
    fileStore[email] = mergedData;
    saveFileStore(fileStore);

    // Relay to global cloud topic for instant multi-device wakeup
    await pushToCloudTopic(email, mergedData);

    return res.status(200).json({
      success: true,
      email,
      lastSyncedAt: mergedData.lastSyncedAt,
      data: mergedData
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
