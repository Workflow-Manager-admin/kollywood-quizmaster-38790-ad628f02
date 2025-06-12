import React from 'react';

// PUBLIC_INTERFACE
function ResultsSummary({ results, onPlayAgain, user }) {
  // Each game may return a slightly different result shape
  const stats = results.answers
    ? {
        correct: results.answers.filter(a=>a.correct).length,
        total: results.total ?? results.answers.length
      }
    : {
        correct: results.correct ?? 0,
        total: results.total ?? 1
      };

  return (
    <div style={{
      maxWidth: 440,
      margin: '56px auto 0 auto',
      background: 'var(--game-bg)',
      borderRadius: 16,
      boxShadow: 'var(--quiz-shadow)',
      padding: 38,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 38, color: stats.correct/stats.total > 0.6 ? 'var(--success)' : 'var(--danger)' }}>
        {stats.correct >= stats.total
          ? '🏆'
          : stats.correct ? '🎬' : '😅'}
      </div>
      <h2 style={{ color: 'var(--primary)', margin:'12px 0 6px' }}>
        Quiz Complete!
      </h2>
      <div style={{ color: 'var(--accent)', marginBottom: 22, fontWeight: 500 }}>
        {user && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{user.username}</span>}<br />
        Your Score: <b>{stats.correct}</b> / {stats.total}
      </div>
      <button className="btn btn-large" style={{ marginRight:18 }} onClick={onPlayAgain}>Go to Dashboard</button>
      <a
        href="https://www.imdb.com/search/title/?languages=ta"
        style={{
          background: 'var(--primary)',
          color: 'var(--secondary)',
          borderRadius: 7,
          padding: '12px 18px',
          fontSize: '1.08em',
          fontWeight: 500,
          textDecoration: 'none',
        }}
        target="_blank" rel="noopener noreferrer"
      >Explore Kollywood</a>
    </div>
  );
}

export default ResultsSummary;
