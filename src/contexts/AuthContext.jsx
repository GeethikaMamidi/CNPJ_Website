import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const USERNAMES_STORAGE_KEY = 'techtatva_usernames_map';

function getStoredUsernames() {
  try {
    const raw = localStorage.getItem(USERNAMES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to parse username map:', err);
    return {};
  }
}

function storeUsernameMapping(username, email) {
  if (!username || !email) return;
  try {
    const map = getStoredUsernames();
    map[username.toLowerCase().trim()] = email.toLowerCase().trim();
    localStorage.setItem(USERNAMES_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save username map:', err);
  }
}

function resolveEmailFromIdentifier(identifier) {
  const clean = identifier.trim();
  if (clean.includes('@')) {
    return clean;
  }
  const map = getStoredUsernames();
  const foundEmail = map[clean.toLowerCase()];
  return foundEmail || null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error('Error fetching auth session:', error);
      }
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        const metaUsername = currentSession.user.user_metadata?.username;
        if (metaUsername && currentSession.user.email) {
          storeUsernameMapping(metaUsername, currentSession.user.email);
        }
      }
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        const metaUsername = newSession.user.user_metadata?.username;
        if (metaUsername && newSession.user.email) {
          storeUsernameMapping(metaUsername, newSession.user.email);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function login(identifier, password) {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }

    const emailToUse = resolveEmailFromIdentifier(identifier);
    if (!emailToUse) {
      throw new Error(
        `The username "${identifier}" is not recognized on this device. Please log in using your registered email address.`
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) throw error;

    // Cache username if present
    if (data?.user?.user_metadata?.username && data?.user?.email) {
      storeUsernameMapping(data.user.user_metadata.username, data.user.email);
    }

    return data;
  }

  async function signup({ name, username, email, password }) {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username ? username.trim().toLowerCase() : cleanEmail.split('@')[0];
    const cleanName = name ? name.trim() : cleanUsername;

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
          username: cleanUsername,
        },
      },
    });

    if (error) throw error;

    // Store username -> email mapping
    storeUsernameMapping(cleanUsername, cleanEmail);

    return data;
  }

  async function logout() {
    if (!supabase) {
      setUser(null);
      setSession(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  }

  const value = {
    user,
    session,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
