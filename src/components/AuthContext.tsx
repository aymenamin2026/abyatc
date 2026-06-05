"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

// The full shape combining user credentials and any active auth token payload
type UserData = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_type: string;
} | null;

interface AuthContextType {
  user: UserData;
  token: string | null;
  login: (userData: UserData, userToken: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state safely on the client
  useEffect(() => {
    const savedToken = getCookie("auth_token") as string | undefined;
    const savedUser = getCookie("auth_user") as string | undefined;

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: UserData, userToken: string) => {
    setToken(userToken);
    setUser(userData);
    
    // Store securely via cookies so layout persists refresh
    setCookie("auth_token", userToken, { maxAge: 60 * 60 * 24 * 7 }); // 1 week ttl
    setCookie("auth_user", JSON.stringify(userData), { maxAge: 60 * 60 * 24 * 7 });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    deleteCookie("auth_token");
    deleteCookie("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
