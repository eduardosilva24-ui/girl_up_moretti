import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  buildUserFromCredential,
  clearStoredSession,
  isGoogleConfigured,
  readStoredSession,
  saveStoredSession,
  verifySessionWithBackend,
} from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!session?.user?.expiresAt) return undefined;

    const delay = Math.max(session.user.expiresAt - Date.now(), 0);
    const timeoutId = window.setTimeout(() => {
      clearStoredSession();
      setSession(null);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [session?.user?.expiresAt]);

  const signInWithCredential = useCallback(async (credential) => {
    const user = buildUserFromCredential(credential);
    const nextSession = { credential, user };

    saveStoredSession(nextSession);
    setSession(nextSession);
    setIsVerifying(true);

    try {
      const backendUser = await verifySessionWithBackend(credential);
      if (backendUser) {
        const verifiedSession = {
          credential,
          user: {
            ...user,
            ...backendUser,
            isAdmin: backendUser.role === "admin",
          },
        };
        saveStoredSession(verifiedSession);
        setSession(verifiedSession);
      }
    } catch (error) {
      clearStoredSession();
      setSession(null);
      throw error;
    } finally {
      setIsVerifying(false);
    }

    return user;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    window.google?.accounts?.id?.disableAutoSelect?.();
  }, []);

  const value = useMemo(() => {
    const user = session?.user || null;

    return {
      user,
      idToken: session?.credential || "",
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin" || user?.isAdmin === true,
      isVerifying,
      isGoogleConfigured: isGoogleConfigured(),
      signInWithCredential,
      logout,
    };
  }, [isVerifying, logout, session, signInWithCredential]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
