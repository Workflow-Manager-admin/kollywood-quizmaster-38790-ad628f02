import React, { useEffect, useState } from 'react';
import { getRandomKollywoodQuizResource } from '../tmdbService';

// PUBLIC_INTERFACE
function CastCombo({ onComplete, onBack }) {
  const TOTAL_QUESTIONS = 7;
  const [qs, setQs] = useState([]);
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState('regular'); // 'regular' or 'reverse'
  const [guess, setGuess] = useState('');
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchQ() {
      let qList = [];
      let seen = new Set();
      let tries = 0;
      while (qList.length < TOTAL_QUESTIONS && tries < 25) {
        let m = await getRandomKollywoodQuizResource();
        if (m.cast && m.cast.length >= 3 && !seen.has(m.id)) {
          qList.push(m);
          seen.add(m.id);
        }
        tries++;
      }
      if (isMounted) setQs(qList);
    }
    fetchQ();
    setMode(Math.random() > 0.5 ? 'regular' : 'reverse');
    setGuess('');
    setAnswers([]);
    setIdx(0);
    return ()=>{isMounted=false;}
  }, []);

  if (!qs.length) return <div>Loading Cast Combo...</div>;
  const q = qs[idx];

  // Regular: given 2-3 actors, guess the movie. Reverse: one odd actor among 3.
  let displayedActors = [];
  let oddActor = null;
  if (mode === 'reverse') {
    let correctMovie = q;
    let actorsInMovie = correctMovie.cast.slice(0,2);
    let fakeActor = { name: 'Rajiv', character: 'Fake', id: Math.random()*100000 };
    // Simulate fetching fake actor (in reality could grab from other movie's cast)
    displayedActors = shuffle([...actorsInMovie, fakeActor]);
    oddActor = fakeActor;
  } else {
    displayedActors = shuffle(q.cast.slice(0,3));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (mode === 'regular') {
      const correct = guess.trim().toLowerCase() === q.title.toLowerCase();
      setAnswers([...answers, { mode, guess, correct, actors: displayedActors, answer: q.title }]);
    } else {
      const correct = guess.trim().toLowerCase() === oddActor.name.toLowerCase();
      setAnswers([...answers, { mode, guess, correct, actors: displayedActors, answer: oddActor.name }]);
    }
    if (idx+1 < TOTAL_QUESTIONS) {
      setIdx(idx+1);
      setGuess('');
      if ((idx+1)%3===0) setMode(mode==='regular'?'reverse':'regular');
    } else {
      onComplete({ type: "CastCombo", answers: [...answers, {
        mode, guess, correct: (mode==='regular' ? (guess.trim().toLowerCase() === q.title.toLowerCase()) : (guess.trim().toLowerCase() === oddActor.name.toLowerCase())),
        actors: displayedActors, answer: mode==='regular'?q.title:oddActor.name
      }] });
    }
  }
  return (
    <div style={{ background: 'var(--game-bg)', borderRadius: 12, maxWidth: 350, margin: '0 auto', padding: 18 }}>
      <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 9 }}>
        Cast Combo <span style={{ color:'var(--accent)', float:'right', fontWeight:500 }}>Q{idx+1}/{TOTAL_QUESTIONS}</span>
      </div>
      {mode === 'regular' ? (
        <>
          <div style={{ marginBottom:8, color:'var(--accent)' }}>
            Guess the movie starring:
          </div>
          <ul style={{ marginBottom: 10 }}>
            {displayedActors.map((a,i)=>
              <li key={i}><b>{a.name}</b> as <i>{a.character}</i></li>
            )}
          </ul>
          <form onSubmit={handleSubmit}>
            <input type="text" value={guess}
              onChange={e=>setGuess(e.target.value)}
              placeholder="Movie Title"
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 7,
                border: '1.4px solid var(--primary)',
                marginBottom: 8
              }}
            />
            <button className="btn" type="submit" style={{ width: '100%' }}>Submit</button>
          </form>
        </>
      ) : (
        <>
          <div style={{ marginBottom:8, color:'var(--accent)' }}>
            Which actor is <b>NOT</b> in the movie <span style={{ color:'var(--primary)' }}>{q.title}</span>?
          </div>
          <ul style={{ marginBottom: 10 }}>
            {displayedActors.map((a,i)=>
              <li key={i}>{a.name}</li>
            )}
          </ul>
          <form onSubmit={handleSubmit}>
            <input type="text" value={guess}
              onChange={e=>setGuess(e.target.value)}
              placeholder="Type the odd actor's name"
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 7,
                border: '1.4px solid var(--primary)',
                marginBottom: 8
              }}
            />
            <button className="btn" type="submit" style={{ width: '100%' }}>Submit</button>
          </form>
        </>
      )}
      <div>
        <button className="btn" style={{ marginTop: 12 }} onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

// Fisher-Yates
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

export default CastCombo;
