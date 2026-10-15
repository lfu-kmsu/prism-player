# PrismPlayer

A full-stack music player written from scratch using web technologies.

## Getting Started
1. Install dependency [Bun][].
2. Download PrismPlayer. On macOS/Linux, open terminal, then run: `git clone https://github.com/lfu-kmsu/prism-player.git && cd prism-player`.
3. Build and run the app: `bun install && bun --bun run build && bun --bun run preview`, then `Ctrl+c`.
4. Add music files to the `~/Music/library` folder (the `Music` folder inside your user's `Home` folder). Supported are `.mp3`, `.m4a` (AAC), and `.flac` files.
5. Run again using just `bun --bun run preview`.
6. Open your browser and enter `localhost:4173` in your search bar.

## For Developers

The routes `/library/playlists` (and its corresponding backend API in `/api/playlists`), `/library/artists`, and `/library/albums` are currently unused. As of now, the playlist feature's implementation is postponed, and the search field in `/library/songs` already provides the capability to search by artists and albums, rendering `/library/artists` and `/library/albums` redundant for now.

As a result, the helper page at `/library`, which allows for navigation between these pages is also currently unused: the Library sidebar element references `/library/songs` directly.

[Bun]: https://bun.sh/get
