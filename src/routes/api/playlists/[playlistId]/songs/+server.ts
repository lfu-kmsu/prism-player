/*
import { error } from '@sveltejs/kit';
import { DB } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
  const { songId } = await request.json();
  if (!songId) throw error(400, 'songId is required');

  const nextPosition = DB.query(
    'SELECT COALESCE(MAX(position), -1) + 1 as next FROM playlist_songs WHERE playlist_id = ?',
  ).get(params.playlistId) as { next: number };

  try {
    DB.run('INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)', [
      params.playlistId,
      songId,
      nextPosition.next,
    ]);
  } catch {
    // Composite primary key (playlist_id, song_id) already handles "no duplicates" for you —
    // this catch just turns SQLite's constraint-violation error into a clean 409 instead of a 500.
    throw error(409, 'Song already in playlist');
  }

  return new Response(null, { status: 204 });
};
*/