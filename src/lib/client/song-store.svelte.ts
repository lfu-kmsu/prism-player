export interface Song {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  coverPath: string | null;
  extension: string;
  codec: string | null;
}

class SongStore {
  songs: Song[] = $state([]);
  isLoading: boolean = $state(false);
  error: string | null = $state(null);
  private loadedOnce = false;
  private inFlight: Promise<void> | null = null;

  byId: Map<string, Song> = $derived(new Map(this.songs.map(s => [s.id, s])));

  // Async library loading function:
  // returns in-flight promise if still loading
  load(): Promise<void> {
    if (this.loadedOnce) return Promise.resolve();
    if (this.inFlight) return this.inFlight;

    this.isLoading = true;
    this.error = null;

    this.inFlight = fetch('/api/songs')
      .then(async res => {
        if (!res.ok) throw new Error(`Failed to load songs: ${res.status}`);
        this.songs = await res.json();
        this.loadedOnce = true;
      })
      .catch(err => {
        this.error = err instanceof Error ? err.message : 'Failed to load songs';
        console.error('Catalog load failed:', err);
      })
      .finally(() => {
        this.isLoading = false;
        this.inFlight = null;
      });

    return this.inFlight;
  }
}

export const songStore = new SongStore();
