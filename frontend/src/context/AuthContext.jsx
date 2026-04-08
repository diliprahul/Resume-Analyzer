import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem("ra_user");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const login = (userData, token) => {
    localStorage.setItem("ra_token", token);
    localStorage.setItem("ra_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("ra_token");
    localStorage.removeItem("ra_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
