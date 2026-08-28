# FreeMoviesDetails

## Local configuration

This project keeps the OMDb API key and site owner password out of GitHub.

1. Copy `omdb-config.example.js` and rename the copy to `omdb-config.js`.
2. Put your local OMDb API key and owner password in `omdb-config.js`.
3. `omdb-config.js` is ignored by Git, so it will not be uploaded.

Note: because this is a browser-based project, an OMDb API key placed in client-side JavaScript can still be visible to website visitors. For a production site, use a backend/server-side proxy for the API key.
