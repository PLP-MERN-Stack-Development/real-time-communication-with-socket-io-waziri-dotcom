// client/src/pages/Home.jsx
import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import Login from "../components/Login";
import ChatRoom from "../components/ChatRoom";

const Home = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="home-container">
      <h1 className="app-title">💬 Chumbi Nyiri</h1>
      {user ? <ChatRoom /> : <Login />}
    </div>
  );
};

export default Home;
