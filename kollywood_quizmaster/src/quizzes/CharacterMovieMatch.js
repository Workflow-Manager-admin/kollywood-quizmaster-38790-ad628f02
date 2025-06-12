import React, { useState, useEffect } from 'react';
import { getRandomKollywoodQuizResource } from '../tmdbService';

// Shuffle array utility
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// PUBLIC_INTERFACE
function CharacterMovieMatch({ onComplete, onBack }) {
  const TOTAL_QUESTIONS = 6; // each = 1 set of 3 movies x 2-3 characters
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roundIdx, setRoundIdx] = useState(0);
  const [matches, setMatches] = useState({});
  const [doneCount, setDoneCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setLoading(true);
    let isMounted = true;
    async function genRounds() {
      let rounds = [];
      let chosen = new Set();
      for (let i = 0; i < TOTAL_QUESTIONS && rounds.length < TOTAL_QUESTIONS; ) {
        // Pull 3 distinct random movies with at least 2 characters
        const movies = [];
        let tries = 0;
        while (movies.length < 3 && tries < 12) {
          let m = await getRandomKollywoodQuizResource();
          if (!chosen.has(m.id) && Array.isArray(m.cast) && m.cast.length >= 2) {
            movies.push(m);
            chosen.add(m.id);
          }
          tries++;
        }
        if (movies.length < 3) break;

        // Pick 2-3 random characters from these movies for the round
        const characterOptions = [];
        for (const mv of movies) {
          const chars = mv.cast.slice(0, 2).map(c => ({
            actor: c.name,
            char: c.character,
            movie: mv.title
          }));
          characterOptions.push(...chars);
        }
        const charsForQuiz = shuffle(characterOptions).slice(0,3);
        rounds.push({
          movies: movies.map(mv => ({ title: mv.title })),
          chars: charsForQuiz
        });
        i++;
      }
      if (isMounted) {
        setRounds(rounds);
        setLoading(false);
        setRoundIdx(0);
        setMatches({});
        setDoneCount(0);
        setShowResults(false);
      }
    }
    genRounds();
    return ()=>{ isMounted = false;}
  }, []);

  if (loading) return <div style={{ marginTop: 70 }}>Loading Character-Movie rounds...</div>;
  if (rounds.length === 0) return <div>No data. Try again.<button className="btn" onClick={onBack}>Back</button></div>;

  const r = rounds[roundIdx];

  // Drag & drop implementation for matching
  // "matches" is: { characterIndex: movieIndex }
  function handleDrop(characterIdx, movieIdx) {
    setMatches(m => ({ ...m, [characterIdx]: movieIdx }));
  }
  function canSubmit() {
    return Object.keys(matches).length === r.chars.length;
  }
  function submitRound() {
    // Mark which match is correct
    setDoneCount(doneCount+1);
    if (roundIdx + 1 < TOTAL_QUESTIONS) {
      setRoundIdx(roundIdx+1);
      setMatches({});
    } else {
      setShowResults(true);
    }
  }
  let correctForThisRound = r.chars.map((c, idx) =>
    matches[idx] != null &&
      r.movies[matches[idx]].title === c.movie
  );
  function getResults() {
    // Count all correct answers across all rounds for final results
    return { correct: correctForThisRound.filter(Boolean).length, total: r.chars.length };
  }
  if (showResults) {
    const { correct, total } = getResults();
    return (
      <div style={{ background: 'var(--game-bg)', borderRadius: 14, padding: 22, maxWidth: 400, margin: '0 auto', boxShadow: 'var(--quiz-shadow)' }}>
        <div style={{ color: 'var(--primary)', fontWeight: 600 }}>Character-Movie Match</div>
        <div style={{ margin: '22px 0' }}>
          You matched <b>{correct}</b> out of <b>{total}</b> correctly!
        </div>
        <button className="btn" onClick={()=>
          onComplete({type: 'CharacterMovieMatch', correct, total } )
        }>Finish</button>
      </div>
    );
  }
  return (
    <div style={{ background: 'var(--game-bg)', borderRadius: 12, maxWidth: 430, margin: '0 auto', padding: 22 }}>
      <div style={{ marginBottom: 12, color: 'var(--primary)', fontWeight: 600 }}>Character-Movie Match <span style={{ float:'right', color:'var(--accent)', fontWeight:500 }}>Round {roundIdx+1}/{TOTAL_QUESTIONS}</span></div>
      <div style={{ marginBottom: 12 }}>
        <div>Drag the character actor+role onto the correct movie:</div>
      </div>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 18 }}>
        {r.movies.map((mv, mi) =>
          <div key={mi}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              const idx = e.dataTransfer.getData("characterIdx");
              handleDrop(Number(idx), mi);
            }}
            style={{
              background: 'var(--game-card)',
              minHeight: 46,
              minWidth: 128,
              borderRadius: 7,
              boxShadow: '0 1.5px 5px #fc037b14',
              padding: '8px 10px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '1.02em',
              border: `2px solid var(--primary)`,
              marginBottom: 6
            }}
          >{mv.title}
          {/* Show matched character? */}
          <div style={{ fontWeight: 400, marginTop: 5, color:'var(--primary)' }}>
            {Object.entries(matches).find(([, mm]) => mm === mi) &&
              r.chars[Number(Object.entries(matches).find(([, mm]) => mm === mi)[0])].actor
            }
          </div>
          </div>
        )}
      </div>
      <div style={{
        display: 'flex', gap: 12, marginTop: 10, justifyContent: 'center'
      }}>
        {r.chars.map((c, idx) =>
          <div key={idx}
            draggable
            onDragStart={e => e.dataTransfer.setData("characterIdx", idx)}
            style={{
              background: 'var(--primary)',
              color: 'var(--secondary)',
              padding: '8px 12px',
              borderRadius: 7,
              marginBottom: 8,
              fontWeight: 600,
              fontSize: '0.99em',
              opacity: matches[idx]!=null ? 0.44 : 1,
              cursor: matches[idx]!=null ? 'not-allowed': 'grab'
            }}
          >
            <span style={{ fontWeight: 600 }}>{c.actor}</span>
            <div style={{ fontWeight: 400, fontSize: "0.86em" }}>as "{c.char}"</div>
          </div>
        )}
      </div>
      <button className="btn" style={{ marginTop: 18 }} disabled={!canSubmit()} onClick={submitRound}>Submit</button>
      <div>
        <button className="btn" style={{ marginTop: 18 }} onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

export default CharacterMovieMatch;
