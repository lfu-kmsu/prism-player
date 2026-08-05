import type { RequestHandler } from './$types';
import { DB } from '$lib/server/db';

export const GET: RequestHandler = async () => {
  const songs = DB.query(
    `SELECT id, title, artist, album, cover_path as coverPath, extension, codec
       FROM songs
       ORDER BY artist, album, title`,
  ).all();

  return new Response(JSON.stringify(songs), { headers: { 'Content-Type': 'application/json' } });
};
