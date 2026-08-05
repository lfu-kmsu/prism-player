<script lang="ts">
  import { default as Play } from '@lucide/svelte/icons/play';
  import { default as Pause } from '@lucide/svelte/icons/pause';
  import { default as SkipForward } from '@lucide/svelte/icons/skip-forward';
  import { default as SkipBack } from '@lucide/svelte/icons/skip-back';
  import { default as VolumeOff } from '@lucide/svelte/icons/volume-x';
  import { default as VolumeLow } from '@lucide/svelte/icons/volume-1';
  import { default as VolumeHigh } from '@lucide/svelte/icons/volume-2';
  import { default as Square } from '@lucide/svelte/icons/square';
  import { default as Shuffle } from '@lucide/svelte/icons/shuffle';
  import PLACEHOLDER_COVER from '$lib/assets/placeholder-cover.avif';
  import { onMount } from 'svelte';
  import { Slider } from 'bits-ui';
  import { playerStore } from '$lib/client/player-store.svelte';

  // song loading
  let song = $derived(playerStore.current);
  let coverUrl = $derived(song?.coverPath ? `/api/cover/${song.coverPath}` : PLACEHOLDER_COVER);
  let streamUrl = $derived(song ? `/api/stream/${song.id}` : undefined);

  // player bar functionality
  let audioEl: HTMLAudioElement | undefined;
  let isPlaying: boolean = $state(false);
  let duration: number | undefined = $state(0);
  let currentTime: number | undefined = $state(0);
  let isSeekDragging: boolean = $state(false);
  let volume: number = $state(0);
  let isMuted: boolean = $state(false);

  // Reset progress state and autoplay whenever the selected song changes
  $effect(() => {
    if (!song || !audioEl) return;

    const isSameResource =
      audioEl.currentSrc && new URL(audioEl.currentSrc).pathname === `/api/stream/${song.id}`;

    currentTime = 0;
    audioEl.currentTime = 0; // your fix — always restart position, no exceptions

    if (isSameResource) {
      // src is unchanged, so loadedmetadata won't fire again — duration would
      // otherwise stay stuck at whatever it's zeroed to below. Read it directly
      // from the element, which already knows it.
      if (Number.isFinite(audioEl.duration)) duration = audioEl.duration;
    } else {
      duration = 0; // genuinely new resource — wait for loadedmetadata as normal
    }

    audioEl.play().catch(err => console.error('Playback failed:', err));
  });

  // Retrieve potentially locally-stored volume value
  $effect(() => {
    const saved = localStorage.getItem('volume');
    if (saved !== null) {
      volume = parseFloat(saved);
    }
  });

  // Keep audioEl's state in sync with what the player bar displays
  $effect(() => {
    if (!audioEl) return;
    audioEl.volume = volume;
    audioEl.muted = isMuted;
  });

  // Guardrail: fixes issue where the slider's range would load before the audio element
  onMount(() => {
    duration = audioEl?.duration;
  });

  async function togglePlayback() {
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
    } else {
      try {
        await audioEl.play();
      } catch (err) {
        console.error('Playback failed:', err);
      }
    }
  }

  // Adjusts time according to the slider's value
  $effect(() => {
    if (!audioEl || isSeekDragging) return;
    const onTimeUpdate = () => (currentTime = audioEl?.currentTime);
    const onLoadedMeta = () => (duration = audioEl?.duration);
    audioEl.addEventListener('timeupdate', onTimeUpdate);
    audioEl.addEventListener('loadedmetadata', onLoadedMeta);
    audioEl.addEventListener('seeked', () => {
      isRemoteSeeking = false; // only clear once the seek has genuinely completed
    });
    return () => {
      audioEl?.removeEventListener('timeupdate', onTimeUpdate);
      audioEl?.removeEventListener('loadedmetadata', onLoadedMeta);
      audioEl?.removeEventListener('seeked', () => {
        isRemoteSeeking = false;
      });
    };
  });

  function handleSeekCommit(value: number) {
    currentTime = value;
    if (audioEl) audioEl.currentTime = value;

    isSeekDragging = false;
  }

  function handleSongEnded() {
    isPlaying = false;
    const advanced = playerStore.playNext();
    if (!advanced) {
      // = last song in the queue
      currentTime = duration; // park seek bar at the end instead of snapping to 0
    }
  }

  function handleVolumeChange(value: number) {
    volume = value;
    if (value > 0 && isMuted) isMuted = false; // dragging up while muted un-mutes
    localStorage.setItem('volume', String(value));
  }

  function toggleMute() {
    isMuted = !isMuted;
  }

  function formatTime(seconds?: number): string {
    if (!seconds) return '0:00';
    if (!Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // stops playback if last remaining song is removed from queue
  $effect(() => {
    if (!audioEl) return;
    if (playerStore.current === null) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  });

  // MEDIASESSION API INTEGRATION ----------------------------------------------------------------------------------------
  const supportsMediaSession = typeof navigator !== 'undefined' && 'mediaSession' in navigator;

  // feed metadata
  $effect(() => {
    if (!supportsMediaSession) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song?.title,
      artist: song?.artist ?? '',
      album: song?.album ?? '',
      artwork: [
        { src: coverUrl, sizes: '96x96', type: 'image/png' },
        { src: coverUrl, sizes: '256x256', type: 'image/png' },
        { src: coverUrl, sizes: '512x512', type: 'image/png' },
      ],
    });
  });

  // set action handlers
  $effect(() => {
    if (!supportsMediaSession) return;

    navigator.mediaSession.setActionHandler('play', () => audioEl?.play());
    navigator.mediaSession.setActionHandler('pause', () => audioEl?.pause());
    navigator.mediaSession.setActionHandler('nexttrack', () => playerStore.playNext());
    navigator.mediaSession.setActionHandler('previoustrack', () => playerStore.playPrevious());

    navigator.mediaSession.setActionHandler('seekto', details => {
      if (details.seekTime === undefined || !audioEl) return;
      audioEl.currentTime = details.seekTime;
      currentTime = details.seekTime;
    });

    navigator.mediaSession.setActionHandler('seekbackward', details => {
      if (!audioEl) return;
      audioEl.currentTime = Math.max(audioEl.currentTime - (details.seekOffset ?? 10), 0);
    });

    navigator.mediaSession.setActionHandler('seekforward', details => {
      if (!audioEl) return;
      audioEl.currentTime = Math.min(
        audioEl.currentTime + (details.seekOffset ?? 10),
        duration ?? 0,
      );
    });

    navigator.mediaSession.setActionHandler('seekto', details => {
      if (details.seekTime === undefined || !audioEl) return;
      isRemoteSeeking = true;
      audioEl.currentTime = details.seekTime;
      currentTime = details.seekTime;
    });

    return () => {
      // Cleans up on unmount so OS controls reflect it when app is closed
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  });

  // show play or pause button depending on state
  $effect(() => {
    if (!supportsMediaSession) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  });

  // seek feature for mediaSession API
  $effect(() => {
    if (!supportsMediaSession || !duration || isSeekDragging) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: currentTime ?? 0,
        playbackRate: 1,
      });
    } catch (err) {
      if (import.meta.env.DEV) console.warn('setPositionState failed:', err);
    }
  });

  // throttled slider position updates for mediaSession API
  let isRemoteSeeking: boolean = $state(false);
  let lastPositionUpdate = 0;
  $effect(() => {
    if (!supportsMediaSession || !duration || isSeekDragging || isRemoteSeeking) return;

    const now = Date.now();
    if (now - lastPositionUpdate < 1000) return; // visible time updates only if greater than 1000 ms
    lastPositionUpdate = now;

    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: currentTime ?? 0,
        playbackRate: 1,
      });
    } catch (err) {
      if (import.meta.env.DEV) console.warn('setPositionState failed:', err);
    }
  });

  // stop button's feature: stop playback, remove entire queue
  function handleStop() {
    audioEl?.pause();
    playerStore.stop();
  }
</script>

<!-- HTML ==========================================================================================================-->

<!-- AUDIO ELEMENT --------------------------------------------------------->

<audio
  bind:this={audioEl}
  src={streamUrl}
  onplay={() => (isPlaying = true)}
  onpause={() => (isPlaying = false)}
  onended={handleSongEnded}
></audio>

<!-- PLAYER BAR ------------------------------------------------------------>

<div class="flex flex-col justify-between h-20 w-full bg-black/20">
  <!-- SlIDER -------------------------------------------------------------->
  <Slider.Root
    type="single"
    thumbPositioning="exact"
    bind:value={currentTime}
    max={duration || 1}
    onpointerdown={() => (isSeekDragging = true)}
    onkeydown={() => (isSeekDragging = true)}
    onValueCommit={handleSeekCommit}
    class="group relative flex h-1 w-full items-center"
  >
    <Slider.Thumb
      index={0}
      class="z-10 block size-4 rounded-sm bg-(--cover-accent) peer group-hover:scale-125 data-active:scale-125 transition-transform"
    />

    <Slider.ThumbLabel
      index={0}
      position="top"
      class="z-10 pointer-events-none rounded-sm bg-black px-2 py-1 mb-4 text-xs text-white opacity-0 transition-opacity data-active:opacity-100"
    >
      {formatTime(currentTime)}
    </Slider.ThumbLabel>

    <span
      class="relative h-full w-full bg-black/10 group-hover:scale-y-150 peer-data-active:scale-y-150 transition-transform"
    >
      <Slider.Range class="absolute h-full" style="background: var(--cover-gradient);" />
    </span>
  </Slider.Root>

  <!-- EVERYTHING BELOW SLIDER -------------------------------------------------------------------------------------->

  <div class="flex flex-none items-center overflow-hidden h-18 w-full p-3 gap-4">
    <!-- PLAY + SKIP BUTTONS ------------------------------------------------------------>
    <div class="flex flex-none items-center h-full w-32">
      <!-- SKIP BACK -->
      <div class="group flex items-center justify-center h-full w-6">
        <SkipBack
          id="skipBackButton"
          class="size-6 group-hover:text-(--cover-accent) group-hover:scale-125 group-active:scale-90 transition-transform"
          onclick={() => playerStore.playPrevious()}
        />
      </div>
      <!-- PLAY/PAUSE -->
      <button onclick={togglePlayback} class="group flex items-center justify-center size-12">
        {#if isPlaying}
          <Pause
            id="pauseButton"
            class="size-8 group-hover:text-(--cover-accent) group-hover:scale-125 group-active:scale-90 transition-transform"
          />
        {:else}
          <Play
            id="playButton"
            class="size-8 group-hover:text-(--cover-accent) group-hover:scale-125 group-active:scale-90 transition-transform"
          />
        {/if}
      </button>
      <!-- SKIP FORWARD -->
      <div class="group flex items-center justify-center h-full w-6">
        <SkipForward
          id="skipForwardButton"
          class="size-6 group-hover:text-(--cover-accent) group-hover:scale-125 group-active:scale-90 transition-transform"
          onclick={() => playerStore.playNext()}
        />
      </div>

      <!-- INVISIBLE BORDER -->
      <div class="h-full w-2"></div>

      <!-- STOP (DELETE QUEUE) -->
      <button class="group flex items-center justift-center h-full w-6" onclick={handleStop}>
        <Square
          class="size-6 group-hover:text-(--cover-accent) group-hover:scale-125 group-active:scale-90 transition-transform"
        />
      </button>
    </div>

    <!-- SONG INFO SECTION ----------------------------------------------------------------------->

    <div class="flex flex-1 items-center justify-center-safe overflow-hidden h-full">
      <!-- COVER -->
      <div class="group flex flex-none items-center justify-center h-full w-14">
        <img
          id="songCover"
          src={coverUrl}
          alt="Song Cover"
          class="size-11 rounded-xl group-hover:scale-110 group-active:scale-90 transition-transform"
        />
      </div>
      <div class="flex flex-col items-center justify-center h-full min-w-0">
        <!-- TITLE -->
        <div class="group flex items-center justify-start text-left h-1/2 w-full px-1">
          <span
            class="h-full truncate group-hover:underline group-hover:text-(--cover-accent) group-hover:scale-102 group-active:scale-90 transition-transform"
          >
            {song?.title ?? 'Nothing Playing'}
          </span>
        </div>
        <!-- ARTIST -->
        <div class="group flex items-center justify-start text-left h-1/2 w-full px-1">
          <span
            class="h-full truncate group-hover:underline group-hover:text-(--cover-accent) group-hover:scale-102 group-active:scale-90 transition-transform"
          >
            {song?.artist ?? ''}
          </span>
        </div>
      </div>
    </div>

    <!-- VOLUME BUTTON/SLIDER + SHUFFLE --------------------------------------------------------------->

    <div class="flex flex-none items-center justify-center w-35 h-full">
      <button
        class="group flex flex-none items-center h-full w-6"
        onclick={() => playerStore.toggleShuffle()}
      >
        <Shuffle
          class={[
            'size-6 group-hover:scale-125 group-active:scale-90 transition-transform',
            playerStore.isShuffled ? 'text-(--cover-accent)' : 'group-hover:text-(--cover-accent)',
          ]}
        />
      </button>
      <!-- SLIDER -->
      <div class="group flex flex-1 h-full items-center px-5">
        <Slider.Root
          type="single"
          thumbPositioning="exact"
          value={isMuted ? 0 : volume}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          class="group relative flex flex-1 h-1 items-center"
        >
          <Slider.Thumb
            index={0}
            class="z-10 block size-4 rounded-sm bg-(--cover-accent) group-hover:scale-125 data-active:scale-125 transition-transform"
          />

          <span
            class="relative h-full w-full bg-black/10 group-hover:scale-y-150 peer-data-active:scale-y-150 transition-transform"
          >
            <Slider.Range class="absolute h-full bg-(--cover-accent)" />
          </span>
        </Slider.Root>
      </div>
      <!-- MUTE TOGGLE -->
      <button
        class="group flex flex-none items-center justify-center h-full w-8"
        onclick={toggleMute}
      >
        {#if isMuted || volume === 0}
          <VolumeOff
            class="size-full group-hover:text-(--cover-accent) group-hover:scale-125 group-active:scale-90 transition-transform"
          ></VolumeOff>
        {:else if volume < 0.5}
          <VolumeLow
            class="size-full group-hover:text-(--cover-accent) group-hover:scale-125 group-active:scale-90 transition-transform"
          ></VolumeLow>
        {:else}
          <VolumeHigh
            class="size-full group-hover:text-(--cover-accent) group-hover:scale-125 group-active:scale-90 transition-transform"
          ></VolumeHigh>
        {/if}
      </button>
    </div>
  </div>
</div>
