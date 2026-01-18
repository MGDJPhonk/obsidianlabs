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

const About = () => (
  <section className="page">
    <div className="section-heading">
      <h2>About Obsidian Labs</h2>
      <p>Independent label building the future of underground electronic music.</p>
    </div>
    <div className="info-grid">
      <div className="info-card">
        <h3>Our Vision</h3>
        <p>
          Obsidian Labs is built for artists who want to move with intention. We
          focus on forward-leaning releases that live in dim rooms, late-night
          sets, and experimental playlists.
        </p>
      </div>
      <div className="info-card">
        <h3>Artist-First Approach</h3>
        <p>
          We keep ownership with the creators, build release plans together, and
          prioritize long-term growth over short-term hype. Every project gets a
          tailored rollout and hands-on support.
        </p>
      </div>
      <div className="info-card">
        <h3>Curated Community</h3>
        <p>
          Our roster is a network of producers, vocalists, and sound designers
          pushing boundaries across techno, bass, and cinematic electronic.
        </p>
      </div>
    </div>
  </section>
);

const SubmitMusic = () => {
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    artistName: "",
    projectTitle: "",
    links: "",
    message: "",
    confirmRights: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Submitting demo..." });

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Submission failed.");
      }

      setStatus({
        type: "success",
        message: "Submission received. We will reach out if it is a fit.",
      });
      setFormData({
        name: "",
        email: "",
        artistName: "",
        projectTitle: "",
        links: "",
        message: "",
        confirmRights: false,
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <section className="page">
      <div className="section-heading">
        <h2>Submit Music</h2>
        <p>Send demos that align with the Obsidian Labs sound profile.</p>
      </div>
      <div className="two-column">
        <div className="info-card">
          <h3>Submission Rules</h3>
          <ul className="rule-list">
            <li>Unreleased, original material only.</li>
            <li>Private streaming links (no downloads required).</li>
            <li>Include artist name, project title, and reference mood.</li>
            <li>Do not send more than 3 tracks per submission.</li>
            <li>We respond within 2-4 weeks if the project is a fit.</li>
          </ul>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="artistName">Artist name</label>
            <input
              id="artistName"
              name="artistName"
              type="text"
              value={formData.artistName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="projectTitle">Project title</label>
            <input
              id="projectTitle"
              name="projectTitle"
              type="text"
              value={formData.projectTitle}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label htmlFor="links">Streaming links</label>
            <input
              id="links"
              name="links"
              type="text"
              placeholder="SoundCloud / Dropbox / private playlist"
              value={formData.links}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Project notes, release timing, collaborators"
            />
          </div>
          <label className="checkbox">
            <input
              type="checkbox"
              name="confirmRights"
              checked={formData.confirmRights}
              onChange={handleChange}
              required
            />
            I confirm I control the master rights for the submission.
          </label>
          {status && (
            <p className={`form-status ${status.type}`}>{status.message}</p>
          )}
          <button className="outline-button" type="submit">
            Submit Demo
          </button>
        </form>
      </div>
    </section>
  );
};

const Contact = () => {
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Sending message..." });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Message failed.");
      }

      setStatus({
        type: "success",
        message: "Message delivered. We will reply shortly.",
      });
      setFormData({ name: "", email: "", topic: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <section className="page">
      <div className="section-heading">
        <h2>Contact Us</h2>
        <p>Label inquiries, bookings, and press requests.</p>
      </div>
      <div className="two-column">
        <div className="info-card">
          <h3>Direct Lines</h3>
          <p>
            Use this form for collaborations, sync inquiries, or roster
            questions. We route all messages to our internal Discord for fast
            response.
          </p>
          <div className="contact-details">
            <span>Based in</span>
            <strong>Los Angeles / Berlin</strong>
            <span>Response window</span>
            <strong>48-72 hours</strong>
          </div>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="topic">Topic</label>
            <input
              id="topic"
              name="topic"
              type="text"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Press, booking, licensing, partnership"
            />
          </div>
          <div className="field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          {status && (
            <p className={`form-status ${status.type}`}>{status.message}</p>
          )}
          <button className="outline-button" type="submit">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

const ReleaseTerms = () => (
  <section className="page">
    <div className="section-heading">
      <h2>Release Terms & FAQ</h2>
      <p>Clear expectations on rights, royalties, and our release workflow.</p>
    </div>
    <div className="info-grid">
      <div className="info-card">
        <h3>Royalty Splits</h3>
        <p>
          Standard agreements are 70/30 net in favor of the artist after
          distribution fees. We can adjust splits for co-funded campaigns or
          larger teams.
        </p>
      </div>
      <div className="info-card">
        <h3>Master Ownership</h3>
        <p>
          Artists keep master ownership. We license the masters for a fixed term
          to handle distribution, marketing, and playlist pitching.
        </p>
      </div>
      <div className="info-card">
        <h3>Content ID Policy</h3>
        <p>
          Content ID is enabled only when it benefits the release strategy. We
          coordinate claims to protect revenue without blocking legitimate uses
          or live set uploads.
        </p>
      </div>
    </div>
    <div className="faq-list">
      <div className="faq-item">
        <h4>How long does a release take?</h4>
        <p>Typically 6-10 weeks from signing to release day.</p>
      </div>
      <div className="faq-item">
        <h4>Do you handle distribution?</h4>
        <p>
          Yes. We distribute to major DSPs, handle metadata, and monitor
          reporting.
        </p>
      </div>
      <div className="faq-item">
        <h4>Can I pitch my own playlists?</h4>
        <p>
          Absolutely. We share campaign assets and encourage artists to activate
          their networks.
        </p>
      </div>
      <div className="faq-item">
        <h4>Do you accept previously released tracks?</h4>
        <p>We prioritize unreleased music, but consider reworks case-by-case.</p>
      </div>
    </div>
  </section>
);

const PrivacyPolicy = () => (
  <section className="page">
    <div className="section-heading">
      <h2>Privacy Policy</h2>
      <p>How we collect, use, and protect your information.</p>
    </div>
    <div className="legal-copy">
      <p>
        We collect contact details and submission data solely to respond to
        inquiries and evaluate music submissions. Information is stored securely
        and shared only with authorized Obsidian Labs staff.
      </p>
      <p>
        We do not sell your data. You may request deletion of your submission at
        any time by contacting us.
      </p>
      <p>
        By using the site, you consent to the use of cookies necessary for site
        functionality and analytics.
      </p>
    </div>
  </section>
);

const TermsOfService = () => (
  <section className="page">
    <div className="section-heading">
      <h2>Terms of Service</h2>
      <p>Guidelines for using the Obsidian Labs site and forms.</p>
    </div>
    <div className="legal-copy">
      <p>
        By submitting music or contacting Obsidian Labs, you confirm you have
        the rights to the content provided and agree to allow us to review it.
      </p>
      <p>
        The site is provided as-is and may be updated without notice. Obsidian
        Labs is not liable for interruptions or data loss beyond reasonable
        control.
      </p>
      <p>
        You agree not to misuse the submission forms for spam, harassment, or
        illegal content.
      </p>
    </div>
  </section>
);

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
        <nav className="site-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/releases">Releases</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/submit">Submit Music</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/release-terms">Release Terms / FAQ</NavLink>
          <NavLink to="/privacy">Privacy Policy</NavLink>
          <NavLink to="/terms">Terms of Service</NavLink>
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
        <Route path="/about" element={<About />} />
        <Route path="/submit" element={<SubmitMusic />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/release-terms" element={<ReleaseTerms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>

      <footer className="site-footer">
        <div>
          <p>Obsidian Labs — Independent label & curator.</p>
          <span>© {new Date().getFullYear()} Obsidian Labs.</span>
        </div>
        <div className="footer-links">
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/submit">Submit Music</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/release-terms">Release Terms / FAQ</NavLink>
          <NavLink to="/privacy">Privacy Policy</NavLink>
          <NavLink to="/terms">Terms of Service</NavLink>
        </div>
      </footer>
    </div>
  );
};

export default App;
