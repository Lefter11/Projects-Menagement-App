import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken") || null
  );
  const [loading, setLoading] = useState(true);

  // lexon tokendhe merr auth nese ka
  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken");

        if (!storedToken) {
          setLoading(false);
          return;
        }

        // ruan në state
        setAccessToken(storedToken);


        const res = await api.get("/auth/me");


        setUser(res.data.user || res.data);
      } catch (error) {

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


  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // pastron frontend
  const logout = async () => {
    try {
      await api.post("/auth/logout");
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


export const useAuth = () => useContext(AuthContext);
