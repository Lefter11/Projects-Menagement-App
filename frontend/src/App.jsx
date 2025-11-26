import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Profile from "./pages/Profile";

import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

const AppContent = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <>
      <nav className="navbar" style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
      

        {user ? (
          <> 
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <div className="nav-leftside">

            <Link to="/">Home</Link>
            <Link to="/projects">Projects</Link>
              </div>
           <div className="nav-rightside">
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout} className="nav-logout">Logout</button> 
            </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <PrivateRoute>
                <ProjectDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
