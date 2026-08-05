import { randomUUID } from 'node:crypto';
import { error } from '@sveltejs/kit';
import { DB } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const rows = DB.query(
    `SELECT p.id as playlistId, p.name, ps.song_id as songId
       FROM playlists p
       LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
       ORDER BY p.created_at, ps.position`,
  ).all() as { playlistId: string; name: string; songId: string | null }[];

  const byId = new Map<string, { id: string; name: string; songIds: string[] }>();
  for (const row of rows) {
    if (!byId.has(row.playlistId)) {
      byId.set(row.playlistId, { id: row.playlistId, name: row.name, songIds: [] });
    }
    if (row.songId) byId.get(row.playlistId)!.songIds.push(row.songId);
  }

  return new Response(JSON.stringify([...byId.values()]), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const { name } = await request.json();
  if (!name || typeof name !== 'string') throw error(400, 'Playlist name is required');

  const id = randomUUID();
  DB.run('INSERT INTO playlists (id, name) VALUES (?, ?)', [id, name]);

  return new Response(JSON.stringify({ id, name, songIds: [] }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
