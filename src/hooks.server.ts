import { syncLibrary } from '$lib/server/scanner';

// resyncs library on each program start
syncLibrary()
  .then(() => console.log('Library sync complete'))
  .catch(err => console.error('Library sync failed:', err));
