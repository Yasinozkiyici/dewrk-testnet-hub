import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LOG_PATH = path.join(DATA_DIR, 'update.log');

export type RefreshLogEntry = {
  timestamp: string;
  durationMs: number;
  testnetsUpdated: number;
  leaderboardsUpdated: number;
  notes?: string[];
};

export async function appendRefreshLog(entry: RefreshLogEntry) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const line = JSON.stringify(entry);
  await fs.appendFile(LOG_PATH, `${line}\n`, 'utf8');
}

export async function readLatestRefreshLog(): Promise<RefreshLogEntry | null> {
  try {
    const content = await fs.readFile(LOG_PATH, 'utf8');
    const lines = content.trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length) return null;
    const last = lines[lines.length - 1];
    return JSON.parse(last) as RefreshLogEntry;
  } catch (error) {
    const code = (error as { code?: string } | undefined)?.code;
    if (code === 'ENOENT') {
      return null;
    }
    console.warn('[refresh-log] Failed to read log', error);
    return null;
  }
}
