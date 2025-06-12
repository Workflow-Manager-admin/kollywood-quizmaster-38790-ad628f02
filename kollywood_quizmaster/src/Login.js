import React, { useState } from 'react';

// PUBLIC_INTERFACE
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);

  // For demo, avatars are random colorful emoji
  const sampleAvatars = ['🎬', '🎶', '🤩', '💃', '🕺', '🌟', '🎤'];
  const avatar = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your name or nickname!');
      return;
    }
    setError(null);
    onLogin({ username: username.trim(), avatar });
  }

  return (
    <div style={{
      maxWidth: 360,
      margin: '80px auto',
      background: 'var(--secondary)',
      borderRadius: 18,
      boxShadow: 'var(--quiz-shadow)',
      padding: 36,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 46, marginBottom: 12 }}>{avatar}</div>
      <h2 style={{ color: 'var(--primary)', fontWeight: 700 }}>Kollywood QuizMaster</h2>
      <div style={{ color: 'var(--accent)', marginBottom: 16, fontWeight: 500 }}>Log in to begin your movie journey!</div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Kollywood Fan Name"
          style={{
            width: '100%',
            padding: '12px 8px',
            border: '1.5px solid var(--primary)',
            borderRadius: 8,
            outline: 'none',
            fontSize: '1.07em',
            marginBottom: 14
          }}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        {error && <div style={{ color: 'var(--danger)', marginBottom: 8 }}>{error}</div>}
        <button className="btn btn-large" type="submit" style={{ width: '100%' }}>Login & Start</button>
      </form>
    </div>
  );
}

export default Login;
