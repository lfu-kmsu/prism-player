import { error } from '@sveltejs/kit';
import { DB } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
  const { name } = await request.json();
  if (!name || typeof name !== 'string') throw error(400, 'Playlist name is required');

  const result = DB.run('UPDATE playlists SET name = ? WHERE id = ?', [name, params.playlistId]);
  if (result.changes === 0) throw error(404, 'Playlist not found');

  return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async ({ params }) => {
  const result = DB.run('DELETE FROM playlists WHERE id = ?', [params.playlistId]);
  if (result.changes === 0) throw error(404, 'Playlist not found');

  return new Response(null, { status: 204 });
};
