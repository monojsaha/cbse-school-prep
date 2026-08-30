"use client";

import {
  createContext, useContext, useEffect, useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { getProfile } from "@/lib/firebase/firestore";
import type { Profile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const p = await getProfile(uid);
    setProfile(p);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadProfile(u.uid);
        // Set a simple session cookie for middleware
        document.cookie = `sf_session=1; path=/; max-age=86400; SameSite=Lax`;
      } else {
        setProfile(null);
        document.cookie = "sf_session=; path=/; max-age=0";
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string): Promise<User> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    document.cookie = "sf_session=; path=/; max-age=0";
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.uid);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
