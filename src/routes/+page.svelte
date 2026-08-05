<script lang="ts">
  import PLACEHOLDER_COVER from '$lib/assets/placeholder-cover.avif';
  import { default as List } from '@lucide/svelte/icons/list';
  import { default as Grid2x2 } from '@lucide/svelte/icons/grid-2x2';
  import { default as X } from '@lucide/svelte/icons/x';
  import { ContextMenu, Popover } from 'bits-ui';
  import { playerStore } from '$lib/client/player-store.svelte';

  // grid view toggle
  let gridView: boolean = $state(false);
  function toggleGridView(): void {
    gridView = !gridView;
  }

  let current = $derived(playerStore.current);
  let queue = $derived(playerStore.queue);

  function coverUrl(coverPath: string | null): string {
    return coverPath ? `/api/cover/${coverPath}` : PLACEHOLDER_COVER;
  }

  function selectFromQueue(index: number) {
    playerStore.playAt(index);
  }

  function removeFromQueue(event: MouseEvent, index: number) {
    event.stopPropagation(); // don't also trigger selectFromQueue via the row's own click
    playerStore.removeFromQueue(index);
  }
</script>

<!-- HTML ==========================================================================================================================================-->

{#if current}
  <title>{current?.title} | PrismPlayer</title>
{:else}
  <title>PrismPlayer</title>
{/if}

<!-- HERO PLAYER SECTION =======================================================================================================================-->

<div class="h-full w-full p-2">
  <div
    class="flex flex-col lg:flex-row items-center justify-start h-auto lg:h-120 w-full gap-4 mb-5 min-w-0"
  >
    <!-- COVER -->
    <a
      href="/library/songs/{current?.id}"
      class="cursor-default group flex items-center justify-center w-full lg:size-120"
    >
      <img
        src={coverUrl(current?.coverPath ?? null)}
        alt="Song Cover"
        class="w-120 aspect-square rounded-4xl group-hover:scale-101 group-active:scale-99 transition-transform"
        draggable="false"
      />
    </a>

    <!-- TITLE, ARTIST, ALBUM -->
    <div class="flex flex-1 flex-col lg:h-120 w-full min-w-0 justify-start lg:py-5">
      <a
        href="/library/songs/{current?.id}"
        class="cursor-default group flex items-center justify-center lg:justify-start text-center lg:text-left h-10 w-full min-w-0"
      >
        <span
          class="h-full text-3xl truncate group-hover:scale-101 group-hover:underline group-hover:text-(--cover-accent) group-active:scale-90 transition-transform"
        >
          {current?.title ?? 'Nothing playing'}</span
        >
      </a>

      <div
        class="flex items-center justify-center lg:justify-start text-center lg:text-left h-8 w-full min-w-0"
      >
        <span class="h-full text-2xl text-gray-800 dark:text-gray-400 truncate">
          {current?.artist ?? ''}</span
        >
      </div>

      <div
        class="flex items-center justify-center lg:justify-start text-center lg:text-left h-8 w-full min-w-0"
      >
        <span class="h-full text-2xl text-gray-800 dark:text-gray-400 truncate">
          {current?.album ?? ''}</span
        >
      </div>
    </div>
  </div>

  <!-- QUEUE SECTION =======================================================================================================================================================-->

  <div class="flex items-center h-10 w-full mb-5">
    <a
      id="queue"
      class="group flex flex-1 items-center justify-start h-full w-auto min-w-0 scroll-mt-10"
    >
      <h1 class="h-full w-auto text-3xl truncate">Queue</h1>
    </a>

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

  {#if !gridView}
    <div class="flex flex-col h-auto w-full items-center justify-center overflow-y-auto gap-0.5">
      {#each queue as song, index}
        <ContextMenu.Root>
          <ContextMenu.Trigger
            class={[
              'group flex items-center justify-start h-10 w-full px-1 gap-3 rounded-xl',
              index === playerStore.queueIndex ? 'bg-black/20' : 'hover:bg-black/20',
            ]}
            onclick={() => selectFromQueue(index)}
          >
            <!-- COVER -->
            <div class="group/img flex flex-none items-center justify-center size-8">
              <img
                src={coverUrl(song.coverPath)}
                alt="Song Cover"
                class="size-full rounded-xl group-hover/img:scale-105 group-active/img:scale-90 transition-transform"
              />
            </div>
            <!-- TITLE -->
            <div class="group/title flex flex-1 items-center justify-start h-8">
              <span
                class={[
                  'h-full w-auto text-lg truncate group-hover/title:scale-102 group-active/title:scale-90 transition-transform',
                  index === playerStore.queueIndex && 'text-(--cover-accent)',
                ]}
              >
                {song.title}
              </span>
            </div>
            <!-- X -->
            <button
              onclick={e => {
                e.stopPropagation();
                removeFromQueue(e, index);
              }}
              class="group/x flex flex-none items-center justify-center h-full w-6 overflow-hidden"
            >
              <X
                class="h-full group-hover/x:scale-110 group-active/x:scale-90 transition-transform"
              />
            </button>
            <!-- ELLIPSIS (for further actions in a post-1.0 version) -->
            <!--
        <button class="group/ell flex flex-none items-center justify-center h-full w-6">
          <EllipsisVertical
            class="h-full group-hover/ell:scale-110 group-active/ell:scale-90 transition-transform"
          />
        </button>
        -->
          </ContextMenu.Trigger>
        </ContextMenu.Root>
      {/each}
    </div>
  {:else}
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 w-full gap-2 justify-center"
    >
      {#each queue as song, index}
        <ContextMenu.Root>
          <ContextMenu.Trigger
            class={[
              '@container group flex flex-col w-full aspect-[1/1.4] items-center justify-between bg-black/10 hover:bg-black/20 transition-colors hover:scale-101 rounded-xl p-3',
              index === playerStore.queueIndex ? 'bg-black/20' : 'hover:bg-black/20',
            ]}
            onclick={() => selectFromQueue(index)}
          >
            <img
              src={coverUrl(song.coverPath)}
              alt="Song Cover"
              class="w-full aspect-square rounded-xl hover:scale-101 active:scale-99 transition-transform"
            />
            <div class="group/title flex items-center justify-center text-center h-[18cqw] w-full">
              <span
                class={[
                  'text-[12cqw] h-full truncate group-hover/title:scale-102 group-active/title:scale-90 transition-transform',
                  index === playerStore.queueIndex && 'text-(--cover-accent)',
                ]}
              >
                {song.title}
              </span>
            </div>
            <!-- ACTION BUTTONS -->
            <div class="flex h-[18cqw] w-full items-center">
              <!-- X -->
              <button
                class="group/x flex flex-1 items-center justify-center h-full"
                onclick={e => {
                  e.stopPropagation();
                  removeFromQueue(e, index);
                }}
              >
                <X
                  class="h-[14cqw] w-auto group-hover/x:scale-110 group-active/x:scale-90 transition-transform"
                />
              </button>
              <!-- ELLIPSIS (for post-1.0 actions) -->
              <!--
            <div class="group/ell flex flex-1 items-center justify-center h-full">
              <EllipsisVertical
                class="h-[14cqw] w-auto group-hover/ell:scale-110 group-active/ell:scale-90 transition-transform"
              />
            </div>
            -->
            </div>
          </ContextMenu.Trigger>
        </ContextMenu.Root>
      {/each}
    </div>
  {/if}
</div>
