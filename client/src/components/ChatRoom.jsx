// Inside ChatRoom.jsx (simplified)
import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import useSocket from "../hooks/useSocket";

export default function ChatRoom() {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [text, setText] = useState("");
  const [privateMsg, setPrivateMsg] = useState(null);

  const { sendMessage, sendTyping, sendPrivateMessage, isTyping } = useSocket(
    user,
    (msg) => setMessages((prev) => [...prev, msg]),
    (onlineUsers) => setUsers(onlineUsers),
    (pvtMsg) => alert(`📩 Private from ${pvtMsg.sender}: ${pvtMsg.text}`)
  );

  const handleSend = () => {
    if (privateMsg) {
      sendPrivateMessage(privateMsg, text);
    } else {
      sendMessage(text);
    }
    setText("");
  };

  return (
    <div className="chat-room">
      <h2>Welcome, {user.username}</h2>

      <div className="online-list">
        <h4>Online Users</h4>
        {users.map((u) => (
          <p
            key={u}
            style={{
              color: u === privateMsg ? "#1d72b8" : "inherit",
              cursor: "pointer",
            }}
            onClick={() => setPrivateMsg(u === privateMsg ? null : u)}
          >
            {u} {u === user.username && "(You)"}
          </p>
        ))}
      </div>

      <div className="messages">
        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.sender}:</strong> {m.text}
          </p>
        ))}
        {isTyping && <em>💬 {isTyping} is typing...</em>}
      </div>

      <div className="input-row">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            sendTyping();
          }}
          placeholder={
            privateMsg ? `Send private message to ${privateMsg}` : "Type..."
          }
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
