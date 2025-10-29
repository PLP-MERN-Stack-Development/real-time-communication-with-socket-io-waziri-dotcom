import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  return (
    <div className="login">
      <h2>Chumbi Nyiri</h2>
      <input placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} />
      <button onClick={() => username && onLogin(username)}>Join Chat</button>
    </div>
  );
}
