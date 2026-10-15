/*
import { error } from '@sveltejs/kit';
import { DB } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request }) => {
  const { songIds } = await request.json();
  if (!Array.isArray(songIds)) throw error(400, 'songIds must be an array');

  const applyReorder = DB.transaction((ids: string[]) => {
    DB.run('DELETE FROM playlist_songs WHERE playlist_id = ?', [params.playlistId]);
    const insert = DB.prepare(
      'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
    );
    ids.forEach((songId, index) => insert.run(params.playlistId, songId, index));
  });

  applyReorder(songIds);

  return new Response(null, { status: 204 });
};
*/