import React, { useEffect, useState } from 'react';
import { fetchKollywoodMovies, fetchMovieDetails } from '../tmdbService';

// Simple shuffle (Fisher-Yates)
function shuffle(arr) {
  const cp = arr.slice();
  for (let i = cp.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cp[i], cp[j]] = [cp[j], cp[i]];
  }
  return cp;
}

// PUBLIC_INTERFACE
function MovieTimeline({ onComplete, onBack }) {
  const TOTAL_QUESTIONS = 6;
  const [roundData, setRoundData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState([]);
  const [dragIdx, setDragIdx] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function setup() {
      setLoading(true);
      // Fetch several movies with reliable release dates
      let titles = [];
      let attempted = 0;
      let movies = [];
      while (movies.length < TOTAL_QUESTIONS && attempted < 18) {
        const list = await fetchKollywoodMovies({ page: Math.floor(Math.random()*10)+1 });
        for (let m of list) {
          if (m.release_date && !titles.includes(m.title)) {
            const d = await fetchMovieDetails(m.id);
            movies.push({ ...d, year: +d.release_date?.slice(0, 4), title: d.title });
            titles.push(m.title);
            if (movies.length >= TOTAL_QUESTIONS) break;
          }
        }
        attempted++;
      }
      const show = shuffle(movies.slice(0, TOTAL_QUESTIONS));
      if (isMounted) {
        setRoundData(show);
        setOrder(show.map((_, i) => i));
        setLoading(false);
      }
    }
    setup();
    return ()=>{ isMounted=false; };
  }, []);

  if (loading) return <div>Loading movies for timeline...</div>;
  if (!roundData.length) return <div>No timeline data. <button className="btn" onClick={onBack}>Back</button></div>;

  // Drag & drop handlers
  function onDragStart(idx) { setDragIdx(idx); }
  function onDrop(idx) {
    if (dragIdx === null) return;
    const newOrder = order.slice();
    const [removed] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, removed);
    setOrder(newOrder);
    setDragIdx(null);
  }
  function onDragOver(e) { e.preventDefault(); }

  function handleSubmit() {
    setShowResult(true);
  }

  const arranged = order.map(i => roundData[i]);
  const correct = arranged.every((movie, idx, arr) =>
    idx === 0 || arr[idx-1].year <= movie.year);

  return (
    <div style={{ background: 'var(--game-bg)', borderRadius: 13, maxWidth: 370, margin: '0 auto', padding: 20, boxShadow: 'var(--quiz-shadow)' }}>
      <div style={{ marginBottom: 10, color: 'var(--primary)', fontWeight: 600 }}>Movie Timeline <span style={{ float:'right', color:'var(--accent)' }}>Order by Year</span></div>
      <div style={{ marginBottom: 12, fontWeight: 500, color: 'var(--accent)' }}>
        Drag and reorder the movies from oldest (top) to newest (bottom):
      </div>
      <div>
        {arranged.map((mov, idx) =>
          <div
            key={mov.id}
            style={{
              background: 'var(--game-card)',
              border: '1.3px solid var(--primary)',
              borderRadius: 7,
              margin: '8px 0',
              padding: 10,
              fontWeight: 600,
              fontSize: '1.09em',
              cursor: 'move',
              opacity: dragIdx === idx ? 0.58 : 1,
            }}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(idx)}
          >
            {mov.title}
            {showResult && (
              <span style={{
                float: 'right',
                color: 'var(--danger)',
                fontWeight: 400,
                fontSize: '0.98em'
              }}>{mov.year}</span>
            )}
          </div>
        )}
      </div>
      {showResult ? (
        <div style={{
          color: correct ? 'var(--success)' : 'var(--danger)',
          fontWeight: 600,
          marginTop: 18
        }}>
          {correct
            ? "All correct! 🎉"
            : "Incorrect order. Try again or finish."}
        </div>
      ) : (
        <button className="btn" style={{ marginTop: 16 }} onClick={handleSubmit}>Check Order</button>
      )}
      <div>
        <button className="btn" onClick={() =>
          onComplete({
            type: "MovieTimeline",
            correct,
            data: arranged
          })
        } style={{ marginTop: 15 }}>Finish</button>
        <button className="btn" onClick={onBack} style={{ marginTop: 6 }}>Back</button>
      </div>
    </div>
  );
}

export default MovieTimeline;
