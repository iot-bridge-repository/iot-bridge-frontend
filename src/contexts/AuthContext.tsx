"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  loadingGetAuthToken: boolean;
}

const AuthContext = createContext<AuthContextType>({
  authToken: null,
  setAuthToken: () => {},
  loadingGetAuthToken: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loadingGetAuthToken, setLoadingGetAuthToken] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("authToken");
    if (stored) setAuthToken(stored);
    setLoadingGetAuthToken(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ authToken, setAuthToken, loadingGetAuthToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
