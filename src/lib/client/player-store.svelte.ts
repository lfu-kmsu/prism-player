// src/lib/stores/player.svelte.ts
export interface CurrentSong {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  coverPath: string | null;
}

class PlayerStore {
  current: CurrentSong | null = $state(null);
  queue: CurrentSong[] = $state([]);
  queueIndex: number = $state(-1);
  isShuffled: boolean = $state(false);
  private preShuffleQueue: CurrentSong[] | null = null;

  play(song: CurrentSong, queue?: CurrentSong[]) {
    this.current = song;
    if (queue) {
      this.queue = queue;
      this.queueIndex = queue.findIndex(s => s.id === song.id);
    }
  }

  playNext(): boolean {
    if (this.queueIndex < this.queue.length - 1) {
      this.queueIndex += 1;
      this.current = this.queue[this.queueIndex];
      return true;
    }
    return false;
  }

  playPrevious(): boolean {
    if (this.queueIndex > 0) {
      this.queueIndex -= 1;
      this.current = this.queue[this.queueIndex];
      return true;
    }
    return false;
  }

  playAt(index: number) {
    if (index < 0 || index >= this.queue.length) return;
    this.queueIndex = index;
    this.current = this.queue[index];
  }

  addToQueue(song: CurrentSong) {
    const wasEmpty = this.queue.length === 0;
    this.queue = [...this.queue, song];

    if (wasEmpty) {
      // First song added to an empty queue — start playing it immediately.
      this.queueIndex = 0;
      this.current = song;
    }
  }

  removeFromQueue(index: number) {
    if (index < 0 || index >= this.queue.length) return;

    const removedWasCurrent = index === this.queueIndex;
    this.queue = this.queue.filter((_, i) => i !== index);

    if (this.queue.length === 0) {
      // That was the last song — stop playback entirely.
      this.current = null;
      this.queueIndex = -1;
      return;
    }

    if (index < this.queueIndex) {
      this.queueIndex -= 1; // shift pointer left so it still targets the same actual song
    } else if (removedWasCurrent) {
      // The playing song itself was removed — advance to whatever now
      // occupies that slot, and actually update `current` to match it
      // (previously only queueIndex moved, leaving `current` stale).
      this.queueIndex = Math.min(this.queueIndex, this.queue.length - 1);
      this.current = this.queue[this.queueIndex];
    }
  }

  stop() {
    this.current = null;
    this.queue = [];
    this.queueIndex = -1;
    this.isShuffled = false;
    this.preShuffleQueue = null;
  }

  toggleShuffle() {
    if (this.isShuffled) {
      this.unshuffle();
    } else {
      this.shuffle();
    }
  }

  private shuffle() {
    if (this.queue.length <= 1) return;

    this.preShuffleQueue = [...this.queue]; // snapshot of pre-shuffled queue, required for unshuffling

    const played = this.queue.slice(0, this.queueIndex + 1); // shuffling only what's still to be played
    const upcoming = this.queue.slice(this.queueIndex + 1);

    // Fisher-Yates shuffling algorithm
    for (let i = upcoming.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [upcoming[i], upcoming[j]] = [upcoming[j], upcoming[i]];
    }

    this.queue = [...played, ...upcoming];
    this.isShuffled = true;
  }

  private unshuffle() {
    if (!this.preShuffleQueue) return;

    // Restores original order but so that queueIndex still points to same song
    const currentId = this.current?.id;
    this.queue = this.preShuffleQueue;
    this.queueIndex = currentId ? this.queue.findIndex(s => s.id === currentId) : this.queueIndex;
    this.preShuffleQueue = null;
    this.isShuffled = false;
  }
}

export const playerStore = new PlayerStore();
