import { Database } from 'bun:sqlite';
import { DB_PATH } from '$lib/server/paths';

export const DB = new Database(DB_PATH, { create: true });
DB.run('PRAGMA journal_mode = WAL'); // better concurrent read/write speeds

DB.run(`
  CREATE TABLE IF NOT EXISTS songs (
    id            TEXT PRIMARY KEY,
    file_path     TEXT NOT NULL UNIQUE,
    content_hash  TEXT NOT NULL,
    title         TEXT NOT NULL,
    artist        TEXT,
    album         TEXT,
    cover_path    TEXT,
    extension     TEXT NOT NULL,
    codec         TEXT,
    file_mtime    INTEGER NOT NULL,
    file_size     INTEGER NOT NULL,
    added_at      INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);
