import React from 'react';

// PUBLIC_INTERFACE
function Dashboard({ user, quizzes, onSelectQuiz, onLogout }) {
  return (
    <div style={{ margin: '20px 0' }}>
      <div style={{
        textAlign: 'left',
        marginBottom: 8,
        color: 'var(--accent)'
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600
        }}>
          <span style={{
            fontSize: 26,
            borderRadius: '50%',
            background: 'var(--primary)',
            color: 'var(--secondary)',
            padding: '2px 12px',
            marginRight: 6
          }}>{user.avatar}</span>
          Welcome <span style={{ color: 'var(--primary)' }}>{user.username}</span>!
        </span>
        <button className="btn" style={{
          float: 'right',
          background: 'var(--danger)',
          marginTop: 2,
          fontSize: '0.96em'
        }} onClick={onLogout}>Logout</button>
      </div>
      <h2 style={{ color: 'var(--primary)', margin: '24px 0 10px 0' }}>Choose Your Quiz Game</h2>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        justifyContent: 'center'
      }}>
        {quizzes.map(q => (
          <button
            key={q.key}
            className="btn"
            style={{
              padding: 0,
              minWidth: 220,
              maxWidth: 320,
              background: q.accent,
              color: 'var(--secondary)',
              borderRadius: 14,
              boxShadow: 'var(--quiz-shadow)',
              fontWeight: 700,
              fontSize: '1.2em',
              border: 'none'
            }}
            onClick={() => onSelectQuiz(q.key)}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 18px'
            }}>
              <div style={{ fontSize: 46, marginBottom: 8 }}>{q.icon}</div>
              <div>{q.name}</div>
              <div style={{
                color: 'var(--game-bg)',
                fontWeight: 500,
                fontSize: '1em',
                marginTop: 6,
                opacity: 0.88
              }}>{q.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
