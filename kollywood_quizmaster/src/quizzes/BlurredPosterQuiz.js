import React, { useEffect, useState } from 'react';
import { getRandomKollywoodQuizResource } from '../tmdbService';

function blurImageStyle(level=1) {
  // 1 (mild) - 2 (strong) - 3 (very strong)
  return {
    filter: `blur(${level * 7}px) grayscale(${level * 15}%) brightness(0.88)`,
    borderRadius: 13,
    boxShadow: '0 2px 16px 1px #fc037b22',
    width: 'min(310px,100%)',
    margin: '0 auto'
  };
}

// PUBLIC_INTERFACE
function BlurredPosterQuiz({ onComplete, onBack }) {
  const TOTAL_QUESTIONS = 10;
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clueNum, setClueNum] = useState(0); // 0,1,2
  const [reveal, setReveal] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [fetchErr, setFetchErr] = useState(null);

  useEffect(() => {
    setLoading(true);
    let isMounted = true;
    async function fetchQuestions() {
      let qs = [];
      let attempts = 0;
      while (qs.length < TOTAL_QUESTIONS && attempts < 25) {
        try {
          let q = await getRandomKollywoodQuizResource();
          if (q.poster && q.title && !qs.find(qq => qq.id === q.id)) {
            qs.push(q);
          }
        } catch (e) {
          setFetchErr("Could not load enough questions.");
          break;
        }
        attempts++;
      }
      if (isMounted) {
        setQuestions(qs);
        setLoading(false);
        setQIndex(0);
        setUserAnswers([]);
        setClueNum(0);
        setReveal(false);
        setAnswerInput('');
      }
    }
    fetchQuestions();
    return () => { isMounted = false; }
  }, []);

  if (loading) return <div style={{ marginTop: 80, textAlign: 'center' }}>Loading Kollywood posters...</div>;

  if (fetchErr || questions.length === 0) return <div>
    {fetchErr ?? 'Unable to load questions.'}
    <button className="btn" style={{ marginTop: 16 }} onClick={onBack}>Back</button>
  </div>;

  const curr = questions[qIndex];

  function normalize(s) {
    return s.toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();
  }
  function handleAnswerSubmit(e) {
    e && e.preventDefault();
    const userGuess = normalize(answerInput);
    const solution = normalize(curr.title);
    const correct = userGuess && userGuess === solution;
    setUserAnswers([...userAnswers, { guess: answerInput, correct, q: curr, cluesUsed: clueNum, revealed: false }]);
    goNext();
  }
  function handleReveal() {
    setReveal(true);
    setUserAnswers([...userAnswers, { guess: '', correct: false, q: curr, cluesUsed: clueNum, revealed: true }]);
    setTimeout(goNext, 1800); // show answer briefly, move on
  }
  function goNext() {
    setClueNum(0);
    setReveal(false);
    setAnswerInput('');
    if (qIndex + 1 < TOTAL_QUESTIONS) {
      setQIndex(qIndex+1);
    } else {
      onComplete({
        type: 'BlurredPosterQuiz',
        answers: userAnswers.concat(), // already added for last
        total: TOTAL_QUESTIONS
      });
    }
  }
  function nextClue() {
    setClueNum(Math.min(clueNum+1, 2));
  }

  // Per-question clues: 1. overview snippet 2. release year+director
  let clues = [];
  if (clueNum > 0) {
    clues.push(<div key="1"><b>Clue 1:</b> {curr.overview?.split(' ').slice(0, 16).join(' ')}...</div>);
  }
  if (clueNum > 1) {
    clues.push(
      <div key="2"><b>Clue 2:</b> Year: {curr.release_date?.slice(0,4)} &mdash; Director: {curr.director ?? 'Unknown'}</div>
    );
  }

  return (
    <div style={{ background: 'var(--game-bg)', borderRadius: 16, maxWidth: 400, margin: '0 auto', padding: 24, boxShadow: 'var(--quiz-shadow)' }}>
      <div style={{ textAlign:'left', marginBottom: 6, color:'var(--primary)', fontWeight:600 }}>Blurred Poster Quiz <span style={{ color:'var(--accent)', float:'right', fontWeight:500 }}>Q{qIndex+1}/{TOTAL_QUESTIONS}</span></div>
      <div style={{ margin: '12px 0' }}>
        <img src={curr.poster} alt="blurred movie poster" style={blurImageStyle(reveal ? 0 : 2)} />
      </div>
      <form onSubmit={handleAnswerSubmit}>
        {clues.length > 0 && (
          <div style={{
            background: 'var(--game-header)', color: 'var(--primary)', borderRadius: 8,
            padding: '10px 12px', margin: '10px 0', minHeight: 20
          }}>{clues}</div>
        )}
        <input
          type="text"
          value={answerInput}
          disabled={reveal}
          onChange={e => setAnswerInput(e.target.value)}
          placeholder={reveal ? curr.title : "Movie Title..."}
          autoFocus
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 6,
            fontSize: '1.04em',
            border: `1.7px solid var(--primary)`,
            marginBottom: 12,
            background: reveal ? 'var(--game-header)' : 'white',
            color: reveal ? 'gray' : 'var(--accent)',
            transition: 'background 0.2s'
          }}
        />
        {reveal &&
          <div style={{ color: 'var(--danger)', marginBottom: 8, fontWeight: 600 }}>Answer:&nbsp;{curr.title}</div>
        }
        {!reveal && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className="btn" style={{ flex: 1 }} type="submit">Submit</button>
            <button className="btn" style={{ flex: 1, background: 'var(--info)' }} type="button" onClick={nextClue} disabled={clueNum >= 2}>Clue</button>
            <button className="btn" style={{ flex: 1, background: 'var(--warn)' }} type="button" onClick={handleReveal}>Reveal</button>
          </div>
        )}
      </form>
      <div>
        <button className="btn" style={{ marginTop: 4 }} onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

export default BlurredPosterQuiz;
