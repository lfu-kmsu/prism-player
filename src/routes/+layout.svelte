<script lang="ts">
  import './layout.css';
  import PLACEHOLDER_COVER from '$lib/assets/placeholder-cover.avif';
  import { /* untrack, */ onMount } from 'svelte';
  import { page } from '$app/state';
  import { navItems } from '$lib/client/navbar-items';
  import PlayerBar from '$lib/components/player-bar.svelte';
  import { playerStore } from '$lib/client/player-store.svelte';
  import { songStore } from '$lib/client/song-store.svelte';
  // import { playlistStore } from '$lib/client/playlist-store.svelte'; // POTENTIAL FUTURE FEATURE
  import { extractPalette } from '$lib/client/cover-colors.svelte';
  import { afterNavigate } from '$app/navigation';
  import { tintedIconDataUrl } from '$lib/client/icon-tint';
  // import { themeStore } from '$lib/client/theme-store.svelte'; // USES DEDICATED THEMING ENGINE (FUTURE FEATURE)

  let { data, children } = $props();

  // CLICK-SUBHEADING-TO-SCROLL FUNCTIONALITY -------------------------------------------------------------
  let mainEl: HTMLElement | undefined;

  afterNavigate(() => {
    const hash = page.url.hash;
    if (hash) {
      const target = document.querySelector(hash);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      mainEl?.scrollTo({ top: 0, behavior: 'instant' });
    }
  });

  // THEMING -------------------------------------------------------------------------------------------
  let paletteAccent: string = $state('');
  let paletteGradient: string = $state('');

  $effect(() => {
    const coverPath: string | null | undefined = playerStore.current?.coverPath;
    const url: string = coverPath ? `/api/cover/${coverPath}` : PLACEHOLDER_COVER;

    extractPalette(url, true).then(({ accent, gradientBg }) => {
      paletteAccent = accent;
      paletteGradient = gradientBg;
    });
  });

  let backgroundUrl = $derived(
    playerStore.current?.coverPath
      ? `/api/cover/${playerStore.current.coverPath}`
      : PLACEHOLDER_COVER,
  );

  // USES THEMING ENGINE
  /*
  // SSR
  untrack(() => {
    themeStore.init(data.colorScheme, data.lightTheme, data.darkTheme);
  });

  // Client Hydration
  $effect(() => {
    themeStore.init(data.colorScheme, data.lightTheme, data.darkTheme);
  });
  */

  // APP ICON TINTING --------------------------------------------------------------------------------------
  let tintedIconUrl = $derived(tintedIconDataUrl(paletteAccent));

  // MUSIC LIBRARY LOADING -----------------------------------------------------------------------------------
  onMount(() => {
    songStore.load();
    // playlistStore.load(); // FUTURE FEATURE
  });
</script>

<!-- HTML =============================================================================================================-->

<svelte:head>
  <link rel="icon" href={tintedIconUrl} />
  <!-- USES THEMING ENGINE -->
  <!-- {@html `<style>${getStyleTag()}</style>`} -->
  <meta name="color-scheme" content="light dark" />
</svelte:head>

<div
  class="relative flex flex-col overflow-hidden h-dvh w-dvw dark:text-white select-none"
  style:--cover-accent={paletteAccent}
  style:--cover-gradient={paletteGradient}
>
  <!-- BLURRED BACKGROUND ------------------------------------------------------------------------------------------>
  <div class="pointer-events-none absolute inset-0 -z-1 flex items-center justify-between">
    <img
      class="size-full scale-110 opacity-50 dark:opacity-60 blur-2xl transition-[background-image,opacity] duration-700"
      src={backgroundUrl}
      alt="Background (Blurred Cover)"
    />
  </div>

  <!-- PAGE + SIDEBAR ------------------------------------------------------------------------------------------->
  <div class="flex flex-1 overflow-hidden w-full">
    <!-- SIDEBAR ------------------------------------------------------------------------------------------------->

    <div class="hidden sm:block h-full w-18 lg:w-62 pt-2 ps-2 pb-2">
      <aside
        class="flex flex-col flex-none items-center justify-start gap-4 overflow-y-auto h-full w-full p-2 bg-black/20 rounded-xl border-2 border-transparent hover:border-black/10 transition-colors"
      >
        <!-- APP ICON + TITLE -------------------------------------------------------------------------------->
        <a href="/" class="cursor-default flex flex-none items-center h-10 w-full">
          <div class="flex flex-none items-center justify-center size-full lg:w-10">
            <img
              src={tintedIconUrl}
              alt="App Icon"
              class="size-11 hover:scale-110 active:scale-90 transition-transform"
            />
          </div>
          <div class="group hidden lg:flex flex-1 items-center justify-center text-center h-full">
            <span
              class="h-full w-auto text-3xl group-hover:scale-105 group-active:scale-90 transition-transform"
              >PrismPlayer</span
            >
          </div>
        </a>

        <!-- SIDEBAR ITEMS (DESKTOP) ----------------------------------------------------------------------------------------->
        {#each navItems as item}
          {@const Icon = item.icon}
          <a
            href={item.href}
            class="cursor-default group flex flex-none items-center justify-center lg:justify-start h-6 w-full"
          >
            <div class="flex flex-none h-full w-full lg:w-10 items-center justify-center">
              <Icon
                class="size-6 group-hover:text-(--cover-accent) group-hover:scale-110 group-active:scale-90 transition-transform"
              />
            </div>
            <div class="hidden lg:flex flex-1 h-full text-start items-center justify-start">
              <span
                class="text-xl group-hover:text-(--cover-accent) group-hover:scale-110 group-active:scale-90 transition-transform"
                >{item.label}</span
              >
            </div>
          </a>
        {/each}
      </aside>
    </div>

    <!-- PAGE ----------------------------------------------------------------------------------------------------------->
    <main
      bind:this={mainEl}
      class="flex-1 overflow-y-auto h-full p-2 border-t-2 border-transparent"
    >
      {@render children()}
    </main>
  </div>

  <!-- PLAYER BAR ----------------------------------------------------------------------------------------------->
  <PlayerBar />

  <!-- BOTTOM BAR (MOBILE) -------------------------------------------------------------------------------->
  <div
    class="flex flex-none sm:hidden items-end justify-between overflow-hidden p-3 h-12 w-full bg-black/20 border-t-2 border-black/20"
  >
    {#each navItems as item}
      {@const Icon = item.icon}
      <a href={item.href} class="group flex flex-1 items-center justify-center h-6 px-2">
        <Icon
          class="size-6 group-hover:text-(--cover-accent) group-hover:scale-110 group-active:scale-90 transition-transform"
        />
      </a>
    {/each}
  </div>
</div>
