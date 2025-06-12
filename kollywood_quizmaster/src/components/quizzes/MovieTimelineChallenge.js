import React, { useEffect, useState } from "react";
import { searchMovies, getMovieDetails } from "../../tmdbApi";

/**
 * Utility: Shuffle an array.
 */
function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * MovieTimelineChallenge
 * Show 5 random Kollywood movies, have user drag to correct release order (earliest→latest).
 * PUBLIC_INTERFACE
 */
function MovieTimelineChallenge({ username, onComplete, onExit }) {
  const [movies, setMovies] = useState([]);
  const [order, setOrder] = useState([]);
  const [dragIdx, setDragIdx] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function fetchMovies() {
      let res = await searchMovies("", {
        with_original_language: "ta",
        page: Math.floor(Math.random() * 10) + 1,
        include_adult: false,
      });
      let pool = (res.results || []).slice(0, 10);
      // Pick 5 with unique years
      let sampled = [];
      let years = new Set();
      for (let m of pool) {
        const detail = await getMovieDetails(m.id);
        let year = detail.release_date?.slice(0, 4);
        if (year && !years.has(year)) {
          sampled.push({ ...m, release_year: year });
          years.add(year);
        }
        if (sampled.length === 5) break;
      }
      setMovies(sampled);
      setOrder(shuffle(sampled.map((_, i) => i)));
    }
    fetchMovies();
  }, []);

  function onDragStart(i) { setDragIdx(i); }
  function onDragOver(i) {
    if (dragIdx === null || dragIdx === i) return;
    let newOrder = order.slice();
    let [removed] = newOrder.splice(dragIdx, 1);
    newOrder.splice(i, 0, removed);
    setOrder(newOrder);
    setDragIdx(i);
  }
  function onDrop() { setDragIdx(null); }

  function handleSubmit() {
    let userOrder = order.map(o => movies[o]);
    let timeline = movies.slice().sort((a, b) => (a.release_year || 3000) - (b.release_year || 3000));
    let score = 0;
    let details = [];
    for (let i = 0; i < userOrder.length; i++) {
      if (userOrder[i].release_year === timeline[i].release_year) {
        score += 1;
        details.push(`✔ ${userOrder[i].title} (${userOrder[i].release_year})`);
      } else {
        details.push(`✖ ${userOrder[i].title} (${userOrder[i].release_year}), correct: ${timeline[i].title} (${timeline[i].release_year})`);
      }
    }
    setDone(true);
    setTimeout(() => {
      onComplete({ score, total: movies.length, details });
    }, 900);
  }

  if (!movies.length) return <div className="container" style={{ marginTop: 120 }}>Loading movie timeline...</div>;

  return (
    <div className="container" style={{ paddingTop: 95, maxWidth: 450 }}>
      <h2 style={{ color: "#4ae54a" }}>Timeline Challenge</h2>
      <div style={{ fontWeight: 500, color: "#111", marginBottom: 9 }}>
        Arrange these Kollywood movies from earliest to latest release:
      </div>
      <ul style={{
        listStyle: "none", padding: 0, margin: "24px 0 20px"
      }}>
        {order.map((idx, i) => (
          <li
            key={movies[idx].id}
            draggable
            style={{
              border: "2px solid #4ae54a",
              background: dragIdx === i ? "#caffcf" : "#f7fff8",
              color: "#199c32",
              borderRadius: 8,
              padding: "11px 15px",
              marginBottom: 9,
              cursor: "grab",
              fontWeight: 600,
              fontSize: "1.06rem",
              opacity: dragIdx === i ? 0.7 : 1
            }}
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => { e.preventDefault(); onDragOver(i); }}
            onDrop={onDrop}
          >
            {movies[idx].title} <span style={{ color: "#888", marginLeft: 4, fontWeight: 400, fontSize: 13 }}>
              ({movies[idx].release_year || "?"})
            </span>
          </li>
        ))}
      </ul>
      <button
        className="btn"
        style={{ background: "#4ae54a", color: "#111", fontWeight: 600 }}
        onClick={handleSubmit}
        disabled={done}
      >
        Submit Timeline
      </button>
      <button
        style={{
          background: "none",
          color: "#8e49fd",
          border: "none",
          marginTop: 12,
          fontSize: 14,
          textDecoration: "underline",
          display: "block"
        }}
        onClick={onExit}
      >Exit Quiz</button>
    </div>
  );
}

export default MovieTimelineChallenge;
