import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function MessageList({ messages = [] }) {
  return (
    <div className="message-list">
      {messages.map(m => (
        <div key={m.id} className="message">
          <div className="meta"><b>{m.from}</b> <small>{formatDistanceToNow(new Date(m.timestamp))} ago</small></div>
          <div className="text">{m.text}</div>
        </div>
      ))}
    </div>
  );
}
