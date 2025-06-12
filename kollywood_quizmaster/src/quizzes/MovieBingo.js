import React, { useEffect, useState } from 'react';
import { fetchKollywoodMovies } from '../tmdbService';

// Random sample utility, returns n unique from arr
function sample(arr, n) {
  const cp = arr.slice(), result = [];
  while (result.length < n && cp.length) {
    let idx = Math.floor(Math.random() * cp.length);
    result.push(cp.splice(idx, 1)[0]);
  }
  return result;
}

const BINGO_CATEGORIES = [
  { label: 'National Award Winner', test: (m) => (m.overview.includes('award') || (m.title && m.title.match(/Nayakan|Mahanati|Indian/))) },
  { label: "Directed by a Superstar", test: (m) => (m.director ? ['Kamal', 'K.S. Ravikumar', 'Mani Ratnam'].some(dir => m.director.includes(dir)) : false) },
  { label: "Released after 2010", test: (m) => (m.release_date?.slice(0,4) > '2010') },
  { label: "Has 'Love' in title", test: (m) => (m.title.toLowerCase().includes('love')) },
  { label: "Mass Action Flick", test: (m) => (m.overview.toLowerCase().includes('action')) },
  { label: "Female Protagonist", test: (m) => (m.overview.toLowerCase().includes('female')) },
  { label: "Comedy Genre", test: (m) => (m.genres && m.genres.includes('Comedy')) }
];

// PUBLIC_INTERFACE
function MovieBingo({ onComplete, onBack }) {
  const [movieGrid, setMovieGrid] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryActive, setCategoryActive] = useState(0);
  const [marked, setMarked] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function setup() {
      setLoading(true);
      let page = Math.floor(Math.random()*8)+1;
      const list = await fetchKollywoodMovies({ page });
      // filter to unique and valid movies
      const grid = sample(list, 9);
      // assign random 3 categories from master
      const cats = sample(BINGO_CATEGORIES, 3);
      if (isMounted) {
        setMovieGrid(grid);
        setCategories(cats);
        setMarked({});
        setCategoryActive(0);
        setLoading(false);
      }
    }
    setup();
    return ()=>{ isMounted = false; }
  }, []);

  if (loading) return <div>Loading Movie Bingo...</div>;
  if (!movieGrid.length) return <div>No bingo data. <button onClick={onBack} className="btn">Back</button></div>;

  function onCellClick(idx) {
    // Mark only if movie matches current category
    const movie = movieGrid[idx];
    const cat = categories[categoryActive];
    if (cat.test(movie)) {
      setMarked({ ...marked, [categoryActive + "-" + idx]: true });
    }
  }
  function onNextCategory() {
    // Finished? Next
    if (categoryActive+1 < categories.length) setCategoryActive(categoryActive+1);
    else onComplete({ type: "MovieBingo", marked, total: movieGrid.length, categories: categories.map(c=>c.label) });
  }
  return (
    <div style={{ background: 'var(--game-bg)', borderRadius: 13, maxWidth: 350, margin: '0 auto', padding: 20, boxShadow: 'var(--quiz-shadow)' }}>
      <div style={{ marginBottom: 10, color: 'var(--primary)', fontWeight: 600 }}>
        Movie Bingo <span style={{ float:'right', fontWeight: 400, color: 'var(--accent)' }}>Category {categoryActive+1}/{categories.length}</span>
      </div>
      <div style={{ fontWeight: 500, marginBottom: 7, color: 'var(--danger)' }}>
        {categories[categoryActive].label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: 12 }}>
        {movieGrid.map((m, idx) => {
          const key = categoryActive + '-' + idx;
          const isMarked = marked[key];
          const currentCat = categories[categoryActive];
          return (
            <div key={idx} className="bingo-cell"
              style={{
                flex: '1 0 28%',
                background: isMarked ? 'var(--primary)' : 'var(--game-card)',
                color: isMarked ? 'var(--secondary)' : 'var(--accent)',
                border: `1.2px solid ${isMarked ? 'var(--primary)' : 'var(--accent)'}`,
                borderRadius: '9px',
                textAlign: 'center',
                margin: 1,
                padding: '12px 4px',
                fontSize: '0.95em',
                cursor: currentCat.test(m) ? 'pointer' : 'not-allowed',
                opacity: currentCat.test(m) ? 1 : 0.54
              }}
              onClick={() => currentCat.test(m) && onCellClick(idx)}
            >{m.title}</div>
          );
        })}
      </div>
      <button className="btn" style={{ marginTop: 10 }} onClick={onNextCategory}>{categoryActive+1<categories.length?'Next':'Finish'}</button>
      <div><button className="btn" onClick={onBack} style={{ marginTop: 7 }}>Back</button></div>
    </div>
  );
}

export default MovieBingo;
