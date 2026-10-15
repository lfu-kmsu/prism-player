import { error } from '@sveltejs/kit';
import path from 'node:path';
import { DB } from '$lib/server/db';
import { LIBRARY_DIR } from '$lib/server/paths';
import type { RequestHandler } from './$types';

const EXT_TO_MIME: Record<string, string> = {
  '.flac': 'audio/flac',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.opus': 'audio/opus',
};

export const GET: RequestHandler = async ({ params, request }) => {
  const row = DB.query('SELECT file_path, extension FROM songs WHERE id = ?').get(
    params.songId,
  ) as { file_path: string; extension: string } | null;
  if (!row) throw error(404, 'Song not found');

  const filePath = path.join(LIBRARY_DIR, row.file_path);
  const file = Bun.file(filePath);
  if (!(await file.exists())) throw error(404, 'File missing on disk');

  const fileSize = file.size;
  const contentType = EXT_TO_MIME[row.extension] ?? 'application/octet-stream';
  const range = request.headers.get('range');
  const baseHeaders = { 'Accept-Ranges': 'bytes', 'Content-Type': contentType };

  if (!range) {
    return new Response(file, { headers: { ...baseHeaders, 'Content-Length': String(fileSize) } });
  }

  const match = range.match(/bytes=(\d*)-(\d*)/);
  if (!match) throw error(416, 'Malformed Range header');

  // parseInt second arg: base to use when parsing the int, 10 => a string in decimal
  const start = match[1] ? parseInt(match[1], 10) : 0;
  const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

  if (start >= fileSize || end >= fileSize || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${fileSize}` } });
  }

  return new Response(file.slice(start, end + 1), {
    status: 206,
    headers: {
      ...baseHeaders,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': String(end - start + 1),
    },
  });
};
