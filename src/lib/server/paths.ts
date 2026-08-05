import { homedir } from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

export const APP_DIR = path.join(homedir(), 'Music');
export const LIBRARY_DIR = path.join(APP_DIR, 'library');
export const COVERS_DIR = path.join(APP_DIR, 'covers'); // extracted cover art cache
export const DB_PATH = path.join(APP_DIR, 'prismplayer.db');

await fs.mkdir(LIBRARY_DIR, { recursive: true });
await fs.mkdir(COVERS_DIR, { recursive: true });
