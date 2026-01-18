# Obsidian Labs

Production-grade independent label site powered by React + Express with a Spotify playlist as the canonical catalog.

## Structure

```
client/   React SPA (Vite)
server/   Express API
```

## Prerequisites

- Node.js 18+
- Spotify API credentials (Client Credentials Flow)

## Environment Variables

Create a `.env` file in `server/` using the template below.

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_PLAYLIST_ID=spotify_playlist_id
PORT=4000
```

## Development

### Backend

```
cd server
npm install
npm run dev
```

### Frontend

```
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:4000`.

## Deployment

1. Install dependencies in both `client` and `server`.
2. Build the client:

```
cd client
npm install
npm run build
```

3. Serve the API and static assets (configure your hosting provider to serve `client/dist` and run `node server/index.js`).
4. Set the Spotify environment variables in your deployment environment.

## Notes

- `/api/releases` caches Spotify responses for 10 minutes.
- Releases are normalized from the configured playlist and remain in playlist order.
