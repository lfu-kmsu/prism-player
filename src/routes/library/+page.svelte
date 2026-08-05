<script lang="ts">
  // import type { PageProps } from './$types';
  // let { data }: PageProps = $props();

  import { default as Music4 } from '@lucide/svelte/icons/music-4';
  import { default as ListMusic } from '@lucide/svelte/icons/list-music';
  import { default as MicVocal } from '@lucide/svelte/icons/mic-vocal';
  import { default as Disc3 } from '@lucide/svelte/icons/disc-3';
</script>

<!-- HTML ====================================================================================================================-->

<title> Library | PrismPlayer </title>

<div
  class="@container grid grid-cols-[repeat(2,minmax(9rem,1fr))] h-full w-full gap-2 overflow-x-hidden"
>
  <!-- SONGS -->
  <a
    class="cursor-default group flex flex-col items-center justify-center p-3 rounded-xl bg-black/20 hover:bg-black/30 border-2 border-transparent hover:border-black/20 transition-colors"
    draggable="false"
    href="/library/songs"
  >
    <div
      class="flex flex-col items-center justify-center group-hover:scale-110 group-active:scale-90 transition-transform"
    >
      <Music4 class="size-10"></Music4>
      <span class="text-3xl">Songs</span>
    </div>
  </a>

  <!-- PLAYLISTS -->
  <a
    class="cursor-default group flex flex-col items-center justify-center p-3 rounded-xl bg-black/20 hover:bg-black/30 border-2 border-transparent hover:border-black/20 transition-colors"
    draggable="false"
    href="/library/playlists"
  >
    <div
      class="flex flex-col items-center justify-center group-hover:scale-110 group-active:scale-90 transition-transform"
    >
      <ListMusic class="size-10"></ListMusic>
      <span class="text-3xl">Playlists</span>
    </div>
  </a>

  <!-- ARTISTS -->
  <a
    class="cursor-default group flex flex-col items-center justify-center p-3 rounded-xl bg-black/20 hover:bg-black/30 border-2 border-transparent hover:border-black/20 transition-colors"
    draggable="false"
    href="/library/artists"
  >
    <div
      class="flex flex-col items-center justify-center group-hover:scale-110 group-active:scale-90 transition-transform"
    >
      <MicVocal class="size-10"></MicVocal>
      <span class="text-3xl">Artists</span>
    </div>
  </a>

  <!-- ALBUMS -->
  <a
    class="cursor-default group flex flex-col items-center justify-center p-3 rounded-xl bg-black/20 hover:bg-black/30 border-2 border-transparent hover:border-black/20 transition-colors"
    draggable="false"
    href="/library/albums"
  >
    <div
      class="flex flex-col items-center justify-center group-hover:scale-110 group-active:scale-90 transition-transform"
    >
      <Disc3 class="size-10"></Disc3>
      <span class="text-3xl">Albums</span>
    </div>
  </a>
</div>
