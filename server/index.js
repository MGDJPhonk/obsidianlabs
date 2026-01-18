import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CACHE_TTL_MS = 10 * 60 * 1000;

app.use(cors());

let cachedReleases = null;
let cachedAt = 0;

const getSpotifyToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify token error: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
};

const inferReleaseType = (album) => {
  if (album.album_type === "single") {
    return "single";
  }

  if (album.total_tracks && album.total_tracks <= 6) {
    return "EP";
  }

  return "album";
};

const normalizeReleases = (items) => {
  return items
    .map((item, index) => {
      const track = item.track;
      if (!track || !track.album) {
        return null;
      }

      const album = track.album;
      const artists = track.artists || [];

      return {
        catalogNumber: `OBL-${String(index + 1).padStart(3, "0")}`,
        title: track.name,
        primaryArtist: artists[0]?.name || "",
        allArtists: artists.map((artist) => artist.name),
        releaseDate: album.release_date,
        coverArtUrl: album.images?.[0]?.url || "",
        spotifyTrackUrl: track.external_urls?.spotify || "",
        spotifyTrackId: track.id,
        spotifyAlbumUrl: album.external_urls?.spotify || "",
        durationMs: track.duration_ms,
        explicit: track.explicit,
        label: "Obsidian Labs",
        releaseType: inferReleaseType(album),
        platformLinks: {
          spotify: track.external_urls?.spotify || "",
        },
        addedToPlaylistAt: item.added_at,
      };
    })
    .filter(Boolean);
};

const fetchPlaylistTracks = async (token, playlistId) => {
  let items = [];
  let offset = 0;
  let total = 0;

  do {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify playlist error: ${errorText}`);
    }

    const data = await response.json();
    total = data.total;
    items = items.concat(data.items || []);
    offset += data.items?.length || 0;
  } while (offset < total);

  return items;
};

app.get("/api/releases", async (_req, res) => {
  try {
    if (cachedReleases && Date.now() - cachedAt < CACHE_TTL_MS) {
      return res.json({ releases: cachedReleases, cached: true });
    }

    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
    if (!playlistId) {
      return res.status(400).json({
        error: "Missing SPOTIFY_PLAYLIST_ID environment variable.",
      });
    }

    const token = await getSpotifyToken();
    const items = await fetchPlaylistTracks(token, playlistId);
    const releases = normalizeReleases(items);

    cachedReleases = releases;
    cachedAt = Date.now();

    return res.json({ releases, cached: false });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Obsidian Labs API running on port ${PORT}`);
});
