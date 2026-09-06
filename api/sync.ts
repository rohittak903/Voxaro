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

const GLOBAL_PLANS_TOPIC = 'vx_global_plans_cfg';

async function fetchGlobalPlansFromTopic(): Promise<any | null> {
  try {
    const res = await fetch(`https://ntfy.sh/${GLOBAL_PLANS_TOPIC}/json?poll=1`);
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return null;

    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(lines[i]);
        if (item.event === 'message' && item.message) {
          const data = JSON.parse(item.message);
          if (data && (data.free || data.creator || data.pro)) {
            return data;
          }
        }
      } catch {}
    }
  } catch (e) {
    // offline fallback
  }
  return null;
}

async function pushGlobalPlansToTopic(plans: any): Promise<void> {
  try {
    await fetch(`https://ntfy.sh/${GLOBAL_PLANS_TOPIC}`, {
      method: 'POST',
      headers: {
        'Title': 'Global Plans Config',
        'Tags': 'plans,config'
      },
      body: JSON.stringify(plans)
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

  // GET: Global Plans Sync OR User Account Sync
  if (req.method === 'GET') {
    const queryType = (req.query?.type || req.query?.global || '').toString().toLowerCase().trim();
    
    // Global plans configuration query
    if (queryType === 'plans' || queryType === 'global_plans') {
      const fileStore = loadFileStore();
      let plansData = memoryStore['__global_plans__'] || fileStore['__global_plans__'] || null;

      const cloudPlans = await fetchGlobalPlansFromTopic();
      if (cloudPlans) {
        plansData = cloudPlans;
        memoryStore['__global_plans__'] = plansData;
        fileStore['__global_plans__'] = plansData;
        saveFileStore(fileStore);
      }

      return res.status(200).json({
        success: true,
        type: 'plans',
        found: !!plansData,
        data: plansData || null
      });
    }

    const email = (req.query?.email || '').toString().toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ error: 'Email or type query parameter is required' });
    }

    const fileStore = loadFileStore();
    let accountData = memoryStore[email] || fileStore[email] || null;

    // Pull from cloud topic if not present or to ensure freshest cross-device sync
    const cloudData = await fetchFromCloudTopic(email);
    if (cloudData) {
      const historyList: any[] = Array.isArray(cloudData.history) ? cloudData.history : (accountData?.history || []);
      const historyChars = historyList.reduce((sum: number, j: any) => sum + (j?.characterCount || j?.inputText?.length || 0), 0);
      const usedChars = Math.max(
        Number(cloudData.charactersUsedThisMonth) || 0,
        Number(accountData?.charactersUsedThisMonth) || 0,
        historyChars
      );

      accountData = {
        ...(accountData || {}),
        ...cloudData,
        charactersUsedThisMonth: usedChars,
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

  // POST: Global Plans Sync OR User Account State
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Global plans configuration save
    if (body?.type === 'plans' || body?.type === 'global_plans' || (body?.plans && !body?.email)) {
      const plans = body.plans || body;
      const fileStore = loadFileStore();
      
      memoryStore['__global_plans__'] = plans;
      fileStore['__global_plans__'] = plans;
      saveFileStore(fileStore);

      await pushGlobalPlansToTopic(plans);

      return res.status(200).json({
        success: true,
        type: 'plans',
        updatedAt: new Date().toISOString(),
        data: plans
      });
    }

    const email = (body?.email || '').toString().toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ error: 'Email or type is required in payload' });
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

    const allHistory: any[] = Array.isArray(mergedData.history) ? mergedData.history : [];
    const totalHistoryChars = allHistory.reduce((sum: number, j: any) => sum + (j?.characterCount || j?.inputText?.length || 0), 0);
    mergedData.charactersUsedThisMonth = Math.max(
      Number(body.charactersUsedThisMonth) || 0,
      Number(existing.charactersUsedThisMonth) || 0,
      totalHistoryChars
    );

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
