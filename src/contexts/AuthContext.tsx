"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  authToken: string | null;
  userRole: string | null;
  setAuthToken: (token: string | null) => void;
  setUserRole: (role: string | null) => void;
  loadingGetAuthToken: boolean;
}

const AuthContext = createContext<AuthContextType>({
  authToken: null,
  userRole: null,
  setAuthToken: () => {},
  setUserRole: () => {},
  loadingGetAuthToken: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingGetAuthToken, setLoadingGetAuthToken] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    const storedRole = sessionStorage.getItem("userRole");

    if (storedToken) setAuthToken(storedToken);
    if (storedRole) setUserRole(storedRole);
    setLoadingGetAuthToken(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authToken,
        userRole,
        setAuthToken,
        setUserRole,
        loadingGetAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
