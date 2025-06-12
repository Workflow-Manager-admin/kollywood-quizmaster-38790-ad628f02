import React, { useEffect, useState } from 'react';
import { getRandomKollywoodQuizResource } from '../tmdbService';

// PUBLIC_INTERFACE
function SpinTheWheel({ onComplete, onBack }) {
  const TOTAL_QUESTIONS = 5;
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [clues, setClues] = useState([]);
  const [guess, setGuess] = useState('');
  const [ansRec, setAnsRec] = useState([]);

  useEffect(() => {
    setSpinning(false);
    setGuess('');
    setClues([]);
    setAnsRec([]);
    setQIdx(0);
    let isMounted = true;
    async function fetchQuestions() {
      let qs = [];
      let tries = 0;
      while (qs.length < TOTAL_QUESTIONS && tries < 18) {
        let q = await getRandomKollywoodQuizResource();
        if (q.cast && q.cast.length >= 2) qs.push(q);
        tries++;
      }
      if (isMounted) setQuestions(qs);
    }
    fetchQuestions();
    return ()=>{isMounted = false;}
  }, []);

  if (!questions.length) return <div>Loading spinning wheel game...</div>;
  const q = questions[qIdx];

  // Build clues (random actor, actress, year)
  function spin() {
    setSpinning(true);
    setTimeout(() => {
      const cast = q.cast.filter(c => !!c.name);
      const actor = cast[Math.floor(Math.random() * cast.length)];
      let actress = cast.filter(c => (c.gender === 1 || /[Aa]mmu|[Jj]yothika|[Ss]imran/.test(c.name)))
        .sort(() => Math.random()-0.5)[0];
      if (!actress) actress = actor;
      const year = q.release_date?.slice(0,4);
      setClues([`Actor: ${actor.name}`, `Actress: ${actress.name}`, `Year: ${year}`]);
      setSpinning(false);
    }, 1200); // Fake spin
  }
  function handleSubmit(e) {
    e.preventDefault();
    const correct = guess.trim().toLowerCase() === q.title.toLowerCase();
    const r = { guess, correct, clues, answer: q.title };
    setAnsRec([...ansRec, r]);
    if (qIdx+1 < TOTAL_QUESTIONS) {
      setQIdx(qIdx+1);
      setGuess('');
      setClues([]);
    } else {
      onComplete({ type: "SpinTheWheel", answers: [...ansRec, r] });
    }
  }

  return (
    <div style={{ background: 'var(--game-bg)', borderRadius: 16, maxWidth: 390, margin: '0 auto', padding: 20 }}>
      <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: 7 }}>
        Spin the Wheel <span style={{ float:'right', color:'var(--accent)', fontWeight:500 }}>Q{qIdx+1}/{TOTAL_QUESTIONS}</span>
      </div>
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <button className="btn" style={{ fontSize: '2em', borderRadius: '100%', width: 72, height: 72, background: 'var(--info)' }} onClick={spin} disabled={spinning || clues.length}>🌀</button>
      </div>
      {clues.length > 0 && (
        <div style={{
          color:'var(--accent)',
          background:'var(--game-header)',
          padding: '11px 8px',
          borderRadius: 8,
          marginBottom: 8
        }}>
          {clues.map((c,i)=>
            <div key={i}><b>Clue {i+1}:</b> {c}</div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Guess the movie title..."
          value={guess}
          onChange={e => setGuess(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            margin: '6px 0 10px 0',
            border: '1.6px solid var(--primary)',
            borderRadius: 7,
            fontSize: '1.04em'
          }}
          disabled={!clues.length || spinning}
        />
        <button className="btn" style={{ width: '100%' }} type="submit" disabled={!clues.length || spinning}>Submit</button>
      </form>
      <div>
        <button className="btn" style={{ marginTop: 10 }} onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
export default SpinTheWheel;
