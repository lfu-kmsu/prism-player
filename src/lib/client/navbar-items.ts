import { default as Home } from '@lucide/svelte/icons/home';
import { default as Landmark } from '@lucide/svelte/icons/landmark';

// Additional sidebar elements which could be useful in a future version
/*
import { default as Music4 } from '@lucide/svelte/icons/music-4';
import { default as ListMusic } from '@lucide/svelte/icons/list-music';
import { default as MicVocal } from '@lucide/svelte/icons/mic-vocal';
import { default as Disc3 } from '@lucide/svelte/icons/disc-3';
import { default as SlidersHorizontal } from '@lucide/svelte/icons/sliders-horizontal';
import { default as AudioWaveform } from '@lucide/svelte/icons/audio-waveform';
*/

export const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Library', href: '/library/songs', icon: Landmark },

  // Additional future sidebar elements
  /*
  { label: 'Songs', href: '/library/songs', icon: Music4 },
  { label: 'Playlists', href: '/library/playlists', icon: ListMusic },
  { label: 'Artists', href: '/library/artists', icon: MicVocal },
  { label: 'Albums', href: '/library/albums', icon: Disc3 },
  { label: 'Streams', href: '/library/streams', icon: AudioWaveform },
  { label: 'Settings', href: '/settings', icon: SlidersHorizontal },
  */
];
