// client/src/App.jsx
import React from "react";
import { UserProvider } from "./context/UserContext";
import Home from "./pages/Home";
import "./App.css";

const App = () => {
  return (
    <UserProvider>
      <Home />
    </UserProvider>
  );
};

export default App;
