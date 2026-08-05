import { error } from '@sveltejs/kit';
import path from 'node:path';
import { COVERS_DIR } from '$lib/server/paths';
import type { RequestHandler } from './$types';

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
};

export const GET: RequestHandler = async ({ params }) => {
  if (!/^[a-z0-9]+\.[a-z0-9]+$/i.test(params.coverFile)) throw error(400, 'Invalid cover id');

  const ext = path.extname(params.coverFile).slice(1).toLowerCase();
  const contentType = EXT_TO_MIME[ext];
  if (!contentType) throw error(400, 'Unsupported cover format');

  const file = Bun.file(path.join(COVERS_DIR, params.coverFile));
  if (!(await file.exists())) throw error(404, 'Cover missing on disk');

  return new Response(file, { headers: { 'Content-Type': contentType } });
};
