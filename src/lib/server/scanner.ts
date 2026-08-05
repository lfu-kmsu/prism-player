import fs from 'node:fs/promises';
import path from 'node:path';
import Bun from 'bun';
import { randomUUID } from 'node:crypto';
import { parseFile } from 'music-metadata';
import { DB } from '$lib/server/db';
import { LIBRARY_DIR, COVERS_DIR } from '$lib/server/paths';

const SUPPORTED_EXTENSIONS = new Set(['.flac', '.mp3', '.m4a', '.ogg', '.wav']);

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

interface SongRow {
  id: string;
  file_path: string;
  content_hash: string;
  file_mtime: number;
  file_size: number;
}

async function walkDir(dir: string, baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: Array<string> = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(fullPath, baseDir))); // recursive folder search
    } else if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(path.relative(baseDir, fullPath));
    }
  }
  return files;
}

async function fullFileHash(filePath: string): Promise<string> {
  const buf = await Bun.file(filePath).arrayBuffer();
  return Bun.hash(buf).toString(36);
}

// inserts metadata into the DB
async function applyMetadata(
  id: string,
  relativePath: string,
  absolutePath: string,
  hash: string,
  stat: { mtimeMs: number; size: number },
) {
  const metadata = await parseFile(absolutePath);
  const extension = path.extname(relativePath).slice(1);

  let coverPath: string | null = null;
  const picture = metadata.common.picture?.[0];
  if (picture) {
    const coverExt = IMAGE_TYPES[picture.format] ?? 'bin';
    coverPath = `${hash}.${coverExt}`;
    await fs.writeFile(path.join(COVERS_DIR, coverPath), picture.data);
  }

  DB.run(
    `INSERT INTO songs (id, file_path, content_hash, title, artist, album, cover_path, extension, file_mtime, file_size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       file_path=excluded.file_path, content_hash=excluded.content_hash, title=excluded.title,
       artist=excluded.artist, album=excluded.album, cover_path=excluded.cover_path,
       file_mtime=excluded.file_mtime, file_size=excluded.file_size`,
    [
      id,
      relativePath,
      hash,
      metadata.common.title ?? path.basename(relativePath, path.extname(relativePath)),
      metadata.common.artist ?? 'Unknown Artist',
      metadata.common.album ?? 'Unknown Album',
      coverPath,
      extension,
      stat.mtimeMs,
      stat.size,
    ],
  );
}

// reconciles DB with FS
export async function syncLibrary() {
  const filesOnDisk = await walkDir(LIBRARY_DIR, LIBRARY_DIR);
  const onDiskSet = new Set(filesOnDisk);

  const existingRows = DB.query(
    'SELECT id, file_path, content_hash, file_mtime, file_size FROM songs',
  ).all() as SongRow[];
  const existingByPath = new Map(existingRows.map(r => [r.file_path, r]));

  // Rows whose path no longer exists: removed, renamed, or true deletions
  const missingRows = existingRows.filter(r => !onDiskSet.has(r.file_path));
  const missingByHash = new Map(missingRows.map(r => [r.content_hash, r]));
  const claimedMissingIds = new Set<string>();

  for (const relativePath of filesOnDisk) {
    const absolutePath = path.join(LIBRARY_DIR, relativePath);
    const stat = await fs.stat(absolutePath);
    const existing = existingByPath.get(relativePath);

    if (existing) {
      const unchanged = existing.file_mtime === stat.mtimeMs && existing.file_size === stat.size;
      if (unchanged) continue; // file unchanged, no hash needed

      const hash = await fullFileHash(absolutePath);
      if (hash === existing.content_hash) {
        // hash is the same, just mtime/size changed -> update these in the DB
        DB.run('UPDATE songs SET file_mtime = ?, file_size = ? WHERE id = ?', [
          stat.mtimeMs,
          stat.size,
          existing.id,
        ]);
      } else {
        // hash is different -> reinsert metadata to DB
        await applyMetadata(existing.id, relativePath, absolutePath, hash, stat);
      }
      continue;
    }

    // No song row with this relativePath -> could be move/rename, or actually new file
    const hash = await fullFileHash(absolutePath);
    const movedFrom = missingByHash.get(hash);

    if (movedFrom && !claimedMissingIds.has(movedFrom.id)) {
      claimedMissingIds.add(movedFrom.id);
      DB.run('UPDATE songs SET file_path = ?, file_mtime = ?, file_size = ? WHERE id = ?', [
        relativePath,
        stat.mtimeMs,
        stat.size,
        movedFrom.id,
      ]);
    } else {
      await applyMetadata(randomUUID(), relativePath, absolutePath, hash, stat);
    }
  }

  // Rows still unclaimed here = corresponding files are genuinely gone/deleted
  for (const row of missingRows) {
    if (!claimedMissingIds.has(row.id)) {
      DB.run('DELETE FROM songs WHERE id = ?', [row.id]);
    }
  }
}
