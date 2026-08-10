import React, { createContext, useContext, useEffect, useState } from 'react';

/* Mock auth (Google sign-in demonstration only — no real backend). */
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
const KEY = 'ars-auth-v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } });
  useEffect(() => { if (user) localStorage.setItem(KEY, JSON.stringify(user)); else localStorage.removeItem(KEY); }, [user]);

  const signInGoogle = () => setUser({ name: 'Tapiwa Chuma', email: 'tapiwa.chuma@mimosa.co.zw', company: 'Mimosa Mine', role: 'Reliability Engineer', via: 'google' });
  const signInDemo = () => setUser({ name: 'Demo User', email: 'demo@ars.co.zw', company: 'ARS Demo', role: 'Client', via: 'email' });
  const signOut = () => setUser(null);
  return <AuthCtx.Provider value={{ user, signInGoogle, signInDemo, signOut }}>{children}</AuthCtx.Provider>;
}
