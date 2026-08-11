<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();

  import PLACEHOLDER_COVER from '$lib/assets/placeholder-cover.avif';
  import { default as List } from '@lucide/svelte/icons/list';
  import { default as Plus } from '@lucide/svelte/icons/plus';
  import { default as Search } from '@lucide/svelte/icons/search';
  import { default as EllipsisVertical } from '@lucide/svelte/icons/ellipsis-vertical';
  import { default as Grid2x2 } from '@lucide/svelte/icons/grid-2x2';
  import { default as Play } from '@lucide/svelte/icons/play';
  import { ContextMenu } from 'bits-ui';
  import { goto } from '$app/navigation';
  import { songStore, type Song } from '$lib/client/song-store.svelte';
  // import { playlistStore } from '$lib/client/playlist-store.svelte'; // FUTURE FEATURE
  import { playerStore, type CurrentSong } from '$lib/client/player-store.svelte';

  // GRID VIEW TOGGLE -----------------------------------------------------------------------------------------
  let gridView: boolean = $state(true);
  function toggleGridView(): void {
    gridView = !gridView;
  }

  // SEARCH FIELD-RELATED FUNCTIONALITY --------------------------------------------------------------------------
  let searchQuery: string = $state('');
  let filteredSongs = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return songStore.songs;
    return songStore.songs.filter(
      song =>
        song.title.toLowerCase().includes(q) ||
        song.artist?.toLowerCase().includes(q) ||
        song.album?.toLowerCase().includes(q),
    );
  });

  // SONG-QUEUEING AND RELATED FUNCTIONALITY ------------------------------------------------------------------------
  function toCurrentSong(song: Song): CurrentSong {
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      coverPath: song.coverPath,
    };
  }

  function playFilteredSongs() {
    if (filteredSongs.length === 0) return;
    const queue = filteredSongs.map(toCurrentSong);
    playerStore.play(queue[0], queue);
  }

  function queueFilteredSongs() {
    if (filteredSongs.length === 0) return;
    for (const song of filteredSongs) {
      playerStore.addToQueue(song);
    }
  }
</script>

<!-- HTML ==========================================================================================================================================-->

<title>Songs | PrismPlayer</title>

<div class="h-full w-full p-2">
  <!-- PAGE TOP ------------------------------------------------------------------------------------------------------------------------------------->
  <div class="flex items-center justify-between h-10 w-full overflow-hidden mb-5 gap-3">
    <!-- HEADING -->
    <h1 class="h-full text-3xl">Songs</h1>

    <div class="flex flex-1 items-center justify-end overflow-hidden h-10 gap-2">
      <!-- SEARCH FIELD -->
      <div
        class="flex flex-1 items-center justify-start gap-2 max-w-sm min-w-0 rounded-xl bg-black/20 px-3 h-full"
      >
        <Search class="flex-none size-4" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Filter by titles, artists, albums…"
          class="flex-1 min-w-0 h-full bg-transparent outline-none placeholder:text-black dark:placeholder:text-white"
        />
      </div>

      <!-- FILTERED ADD BUTTON -->
      <button
        class="group flex flex-none items-center justify-center h-full aspect-square"
        onclick={queueFilteredSongs}
      >
        <Plus
          class="h-full aspect-square group-hover:scale-110 group-active:scale-90 transition-transform"
        />
      </button>

      <!-- FILTERED PLAY BUTTON -->
      <button
        class="group flex flex-none items-center justify-center h-full aspect-square"
        onclick={playFilteredSongs}
      >
        <Play
          class="h-full aspect-square group-hover:scale-110 group-active:scale-90 transition-transform"
        />
      </button>

      <!-- GRID VIEW TOGGLE -->
      <button
        class="group flex flex-none items-center justify-center h-full aspect-square"
        onclick={toggleGridView}
      >
        {#if !gridView}
          <List
            class="h-full aspect-square group-hover:scale-110 group-active:scale-90 transition-transform"
          />
        {:else}
          <Grid2x2
            class="h-full aspect-square group-hover:scale-110 group-active:scale-90 transition-transform"
          />
        {/if}
      </button>
    </div>
  </div>

  <!-- LIST VIEW ------------------------------------------------------------------------------------------------------>
  {#if songStore.isLoading}
    <p class="text-(--subtext0) text-center mt-10">Loading library…</p>
  {:else if filteredSongs.length === 0}
    <p class="text-(--subtext0) text-center mt-10">No songs match "{searchQuery}"</p>
  {:else if !gridView}
    <div class="flex flex-col w-full items-start justify-start overflow-y-auto gap-0.5">
      {#each filteredSongs as song}
        <ContextMenu.Root>
          <ContextMenu.Trigger
            class="group flex items-center justify-start h-10 w-full px-1 gap-3 hover:bg-black/20 rounded-xl"
            onclick={() => playerStore.addToQueue(toCurrentSong(song))}
          >
            <!-- COVER -->
            <div class="group/img flex flex-none items-center justify-center size-8">
              <img
                src={song.coverPath ? `/api/cover/${song.coverPath}` : PLACEHOLDER_COVER}
                alt="Song Cover"
                class="size-full rounded-xl group-hover/img:scale-105 group-active/img:scale-90 transition-transform"
              />
            </div>
            <!-- TITLE -->
            <div class="group/title flex flex-1 items-center justify-start h-8">
              <span
                class="h-full w-auto text-lg truncate group-hover/title:scale-102 group-active/title:scale-90 transition-transform"
              >
                {song.title}
              </span>
            </div>
            <!-- PLUS -->
            <button
              onclick={e => {
                e.stopPropagation();
                playerStore.addToQueue(toCurrentSong(song));
              }}
              class="group/x flex flex-none items-center justify-center h-full w-6"
            >
              <Plus
                class="h-full group-hover/x:scale-110 group-active/x:scale-90 transition-transform"
              />
            </button>
            <!-- ELLIPSIS -->
            <button
              onclick={e => {
                e.stopPropagation();
                goto(`/library/songs/${song.id}`);
              }}
              class="group/ell flex flex-none items-center justify-center h-full w-6"
            >
              <EllipsisVertical
                class="h-full group-hover/ell:scale-110 group-active/ell:scale-90 transition-transform"
              />
            </button>
          </ContextMenu.Trigger>
        </ContextMenu.Root>
      {/each}
    </div>

    <!-- GRID VIEW --------------------------------------------------------------------------------------------------------------->
  {:else}
    <div
      class="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] content-start h-full w-full gap-2 justify-start"
    >
      {#each filteredSongs as song}
        <ContextMenu.Root>
          <ContextMenu.Trigger
            class="@container group flex flex-col w-full aspect-[1/1.4] items-center justify-between bg-black/10 hover:bg-black/20 transition-colors hover:scale-101 rounded-xl p-3"
            onclick={() => playerStore.addToQueue(toCurrentSong(song))}
          >
            <img
              src={song.coverPath ? `/api/cover/${song.coverPath}` : PLACEHOLDER_COVER}
              alt="Song Cover"
              class="w-full aspect-square rounded-xl hover:scale-101 active:scale-99 transition-transform"
            />
            <div class="group/title flex items-center justify-center text-center h-[18cqw] w-full">
              <span
                class="text-[12cqw] h-full truncate group-hover/title:scale-102 group-active/title:scale-90 transition-transform"
              >
                {song.title}
              </span>
            </div>
            <!-- ACTION BUTTONS -->
            <div class="flex h-[18cqw] w-full items-center">
              <!-- PLUS -->
              <button
                class="group/plus flex flex-1 items-center justify-center h-full"
                onclick={e => {
                  e.stopPropagation();
                  playerStore.addToQueue(toCurrentSong(song));
                }}
              >
                <Plus
                  class="h-[14cqw] group-hover/plus:scale-110 group-active/plus:scale-90 transition-transform"
                />
              </button>
              <!-- ELLIPSIS -->
              <button
                onclick={e => {
                  e.stopPropagation();
                  goto(`/library/songs/${song.id}`);
                }}
                class="group/ell flex flex-1 items-center justify-center h-full"
              >
                <EllipsisVertical
                  class="h-[14cqw] group-hover/ell:scale-110 group-active/ell:scale-90 transition-transform"
                />
              </button>
            </div>
          </ContextMenu.Trigger>
        </ContextMenu.Root>
      {/each}
    </div>
  {/if}
</div>
