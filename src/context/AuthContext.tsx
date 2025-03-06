import { AuthContextType } from '../types/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useDispatch } from 'react-redux';
import { fetchTransactions } from '../features/transactionSlice';
import { AppDispatch } from '../store';
import { typesDB } from '../lib/db/types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      if (session?.user) {
        await typesDB.addUserToDefaultTypes(session.user.id);
        dispatch(fetchTransactions());
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(session.user);
        storeUserInLocalStorage(session.user);
        dispatch(fetchTransactions());
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [dispatch]);

  const storeUserInLocalStorage = (user: User) => {
    try {
      localStorage.setItem(
        'users',
        JSON.stringify([
          {
            id: user.id,
            email: user.email,
            name: user.user_metadata.full_name,
          },
        ]),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error storing user in database:', error.message);
      } else {
        console.error('Error storing user in database:', error);
      }
    }
  };

  const signInWithGoogle = async () => {
    if (import.meta.env.MODE === 'development') {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) console.error('Error logging in:', error.message);
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URI,
        },
      });
      if (error) console.error('Error logging in:', error.message);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('users');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signUp,
      signIn,
      signInWithGoogle, 
      signOut, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};