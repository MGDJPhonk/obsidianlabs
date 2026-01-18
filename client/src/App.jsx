import React, { useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

const formatDuration = (ms) => {
  if (!ms) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const ReleaseCard = ({ release }) => {
  return (
    <article className="release-card">
      <div className="release-art">
        {release.coverArtUrl ? (
          <img src={release.coverArtUrl} alt={`${release.title} cover`} />
        ) : (
          <div className="release-art-placeholder" />
        )}
        {release.explicit && <span className="explicit-badge">Explicit</span>}
      </div>
      <div className="release-meta">
        <div className="release-header">
          <span className="catalog-number">{release.catalogNumber}</span>
          <span className="release-type">{release.releaseType}</span>
        </div>
        <h3>{release.title}</h3>
        <p className="primary-artist">{release.primaryArtist}</p>
        <div className="release-details">
          <span>{release.releaseDate}</span>
          <span>{formatDuration(release.durationMs)}</span>
        </div>
        <a
          className="release-link"
          href={release.spotifyTrackUrl}
          target="_blank"
          rel="noreferrer"
        >
          Listen on Spotify
        </a>
      </div>
    </article>
  );
};

const EmptyState = ({ title, body }) => (
  <div className="empty-state">
    <h3>{title}</h3>
    <p>{body}</p>
  </div>
);

const Home = ({ releases }) => {
  const featured = releases.slice(0, 4);

  return (
    <section className="page">
      <div className="hero">
        <div>
          <p className="label">Obsidian Labs</p>
          <h1>Independent. Underground. Always Quality.</h1>
          <p className="hero-copy">
            Obsidian Labs curates future-forward electronic releases with relentless
            focus. Every selection is sharpened, minimal, and engineered for dark
            rooms.
          </p>
          <NavLink className="outline-button" to="/releases">
            View Full Catalog
          </NavLink>
        </div>
        <div className="hero-panel">
          <div className="panel-detail">
            <span>Release Discipline</span>
            <strong>Catalog-only</strong>
          </div>
          <div className="panel-detail">
            <span>Sound Profile</span>
            <strong>Underground Electronic</strong>
          </div>
          <div className="panel-detail">
            <span>HQ Policy</span>
            <strong>Curated Sequencing</strong>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <h2>Featured Releases</h2>
        <p>Latest playlist additions from the Obsidian Labs vault.</p>
      </div>

      {featured.length ? (
        <div className="release-grid">
          {featured.map((release) => (
            <ReleaseCard key={release.spotifyTrackId} release={release} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No releases loaded"
          body="Connect the Spotify playlist in the backend to populate the catalog."
        />
      )}
    </section>
  );
};

const Releases = ({ releases, filters, onFilterChange }) => {
  const filtered = useMemo(() => {
    return releases
      .filter((release) => {
        const matchesArtist = filters.artist
          ? release.allArtists.includes(filters.artist)
          : true;
        const matchesType = filters.type
          ? release.releaseType === filters.type
          : true;
        return matchesArtist && matchesType;
      })
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  }, [releases, filters]);

  return (
    <section className="page">
      <div className="section-heading">
        <h2>Release Catalog</h2>
        <p>Full sequence pulled from the official Obsidian Labs playlist.</p>
      </div>

      <div className="filters">
        <div className="filter">
          <label htmlFor="artist">Artist</label>
          <select
            id="artist"
            value={filters.artist}
            onChange={(event) =>
              onFilterChange({ ...filters, artist: event.target.value })
            }
          >
            <option value="">All artists</option>
            {filters.artists.map((artist) => (
              <option key={artist} value={artist}>
                {artist}
              </option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label htmlFor="type">Release type</label>
          <select
            id="type"
            value={filters.type}
            onChange={(event) =>
              onFilterChange({ ...filters, type: event.target.value })
            }
          >
            <option value="">All types</option>
            {filters.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length ? (
        <div className="release-grid">
          {filtered.map((release) => (
            <ReleaseCard key={release.spotifyTrackId} release={release} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No releases match"
          body="Adjust filters or confirm the playlist has releases."
        />
      )}
    </section>
  );
};

const App = () => {
  const [releases, setReleases] = React.useState([]);
  const [error, setError] = React.useState("");

  const artists = useMemo(() => {
    return Array.from(
      new Set(releases.flatMap((release) => release.allArtists))
    ).sort();
  }, [releases]);

  const types = useMemo(() => {
    return Array.from(new Set(releases.map((release) => release.releaseType)));
  }, [releases]);

  const [filters, setFilters] = useState({
    artist: "",
    type: "",
    artists: [],
    types: [],
  });

  React.useEffect(() => {
    const loadReleases = async () => {
      try {
        const response = await fetch("/api/releases");
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch releases.");
        }
        const data = await response.json();
        setReleases(data.releases || []);
      } catch (err) {
        setError(err.message);
      }
    };

    loadReleases();
  }, []);

  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      artists,
      types,
    }));
  }, [artists, types]);

  return (
    <div className="app">
      <header className="site-header">
        <NavLink to="/" className="logo">
          Obsidian Labs
        </NavLink>
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/releases">Releases</NavLink>
        </nav>
      </header>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home releases={releases} />} />
        <Route
          path="/releases"
          element={
            <Releases
              releases={releases}
              filters={filters}
              onFilterChange={setFilters}
            />
          }
        />
      </Routes>

      <footer className="site-footer">
        <p>Obsidian Labs — Independent label & curator.</p>
        <span>© {new Date().getFullYear()} Obsidian Labs.</span>
      </footer>
    </div>
  );
};

export default App;
