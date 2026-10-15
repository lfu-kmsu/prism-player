/*
import { error } from '@sveltejs/kit';
import { DB } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params }) => {
  const result = DB.run('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?', [
    params.playlistId,
    params.songId,
  ]);
  if (result.changes === 0) throw error(404, 'Song not in playlist');

  return new Response(null, { status: 204 });
};
*/