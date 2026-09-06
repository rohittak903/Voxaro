import fs from 'fs';
import path from 'path';

// In-memory cloud cache for serverless runtime
const memoryStore: Record<string, any> = {};

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
    // fallback to memory
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

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch account state by email
  if (req.method === 'GET') {
    const email = (req.query?.email || '').toString().toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    const fileStore = loadFileStore();
    const accountData = memoryStore[email] || fileStore[email] || null;

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
      
      // Add existing
      existingHistory.forEach(item => {
        if (item && item.id) historyMap.set(item.id, item);
      });
      // Merge new
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

    return res.status(200).json({
      success: true,
      email,
      lastSyncedAt: mergedData.lastSyncedAt,
      data: mergedData
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
