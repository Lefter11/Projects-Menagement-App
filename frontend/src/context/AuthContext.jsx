import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken") || null
  );
  const [loading, setLoading] = useState(true);

  // Inicializim: lexon token-in dhe merr /auth/me nëse ekziston
  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken");

        if (!storedToken) {
          setLoading(false);
          return;
        }

        // ruajmë në state (edhe pse interceptori e lexon nga localStorage)
        setAccessToken(storedToken);

        // Authorization header shtohet automatikisht nga api.js (interceptor)
        const res = await api.get("/auth/me");

        // varet si e ke bërë backend-in: { user: {...} } ose direkt user
        setUser(res.data.user || res.data);
      } catch (error) {
        // nëse /auth/me dështon (token i pavlefshëm), pastroje
        console.error("Auth init error:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // thirret nga Login/Register kur marrim user + accessToken nga backend
  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // logout: njofton backend-in + pastron frontend-in
  const logout = async () => {
    try {
      await api.post("/auth/logout"); // backend heq refreshToken cookie
    } catch (e) {
      console.warn("Logout error (ignored):", e);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook i thjeshtë për ta përdorur në komponentë
export const useAuth = () => useContext(AuthContext);
