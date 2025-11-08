import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PostDetailPage from "./pages/PostDetailPage";
import ParticlesBackground from "./components/ParticlesBackground";
import ConnectionStatus from "./components/ConnectionStatus";

function App() {
  return (
    <Router>
      <div className="min-h-screen relative mesh-gradient">
        <ParticlesBackground />
        <ConnectionStatus />
        <div className="relative z-10">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
