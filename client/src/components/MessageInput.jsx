import React, { useState } from 'react';

export default function MessageInput({ onSend, socket, username }) {
  const [text, setText] = useState('');

  function handleSend() {
    if (!text) return;
    onSend(text);
    setText('');
  }

  function handleTyping(e) {
    setText(e.target.value);
    socket.emit('typing', { room: 'global', username, isTyping: e.target.value.length > 0 });
  }

  return (
    <div className="message-input">
      <input value={text} onChange={handleTyping} placeholder="Write a message..." />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
