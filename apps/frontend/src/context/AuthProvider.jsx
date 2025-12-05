import React, { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import { authService } from "../services/api";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    // Bootstrap auth from persistent or session storage
    const storedLocal = localStorage.getItem("tivivu_user");
    const storedSession = sessionStorage.getItem("tivivu_user");
    const raw = storedLocal || storedSession;
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
    setBootstrapping(false);
  }, []);

  const login = async (email, password, remember = true) => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      const serialized = JSON.stringify(userData);
      if (remember) {
        localStorage.setItem("tivivu_user", serialized);
      } else {
        sessionStorage.setItem("tivivu_user", serialized);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName, remember = true) => {
    setLoading(true);
    try {
      const userData = await authService.register(email, password, displayName);
      setUser(userData);
      const serialized = JSON.stringify(userData);
      if (remember) {
        localStorage.setItem("tivivu_user", serialized);
      } else {
        sessionStorage.setItem("tivivu_user", serialized);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tivivu_user");
    sessionStorage.removeItem("tivivu_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, bootstrapping }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
