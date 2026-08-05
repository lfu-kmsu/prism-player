# PrismPlayer

A full-stack music player written from scratch using web technologies.

## For Developers

The routes `/library/playlists` (and its corresponding backend API in `/api/playlists`), `/library/artists`, and `/library/albums` are currently unused. As of now, the playlist feature's implementation is postponed, and the search field of `/library/songs` already provides the capability to search by artists and albums, rendering `/library/artists` and `/library/albums` redundant for now.

As a consequence, the helper page at `/library` which allows for navigation between these pages is currently unused too - the Library sidebar element references `/library/songs` directly.
