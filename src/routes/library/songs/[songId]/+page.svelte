<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();

  import { page } from '$app/state';
  import { songStore } from '$lib/client/song-store.svelte';
  import PLACEHOLDER_COVER from '$lib/assets/placeholder-cover.avif';

  let song = $derived(songStore.byId.get(page.params.songId)); // warning should be suppressed: songId = always string, otherwise this page couldn't load
  let coverUrl = $derived(song?.coverPath ? `/api/cover/${song.coverPath}` : PLACEHOLDER_COVER);
</script>

<!-- HTML ======================================================================================================-->

<title>{song?.title ?? 'Song'} | PrismPlayer</title>

<div class="h-full w-full p-2">
  {#if songStore.isLoading}
    <p class="text-(--subtext0) text-center mt-10">Loading…</p>
  {:else if !song}
    <p class="text-(--subtext0) text-center mt-10">Song not found.</p>
  {:else}
    <div>
      <div
        class="flex flex-col lg:flex-row items-center justify-start h-auto lg:h-120 w-full gap-4 mb-5"
      >
        <!-- COVER -->
        <div class="flex items-center justify-center w-full lg:size-120">
          <img
            src={coverUrl}
            alt="Song Cover"
            class="w-120 aspect-square rounded-4xl"
            draggable="false"
          />
        </div>

        <!-- TITLE, ARTIST, ALBUM -->
        <div class="flex flex-1 flex-col lg:h-120 w-full min-w-0 justify-start lg:py-5">
          <div
            class="flex items-center justify-center lg:justify-start text-center lg:text-left h-10 w-full"
          >
            <span class="h-full text-3xl truncate group-hover:scale-101"> {song.title}</span>
          </div>

          <div
            class="flex items-center justify-center lg:justify-start text-center lg:text-left h-8 w-full"
          >
            <span class="h-full text-2xl text-gray-800 dark:text-gray-400 truncate">
              {song.artist ?? 'Unknown Artist'}</span
            >
          </div>

          <div
            class="flex items-center justify-center lg:justify-start text-center lg:text-left h-8 w-full"
          >
            <span class="h-full text-2xl text-gray-800 dark:text-gray-400 truncate">
              {song.album ?? 'Unknown Album'}</span
            >
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
