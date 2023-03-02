'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from 'src/lib/supabase-browser';

export const AuthContext = createContext();

export const AuthProvider = (props) => {
  const [initial, setInitial] = useState(true);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const { accessToken, ...rest } = props;

  useEffect(() => {
    async function getActiveSession() {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      setInitial(false);
    }
    getActiveSession();

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
     
      console.log('Auth State Change', event, currentSession)
      
      if (currentSession?.access_token !== accessToken) {
        router.refresh();
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    });

    return () => {
      authListener?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => {
    return {
      initial,
      session,
      user,
      userData,
      signOut: () => supabase.auth.signOut(),
    };
  }, [initial, session, user, userData]);

  return <AuthContext.Provider value={value} {...rest} />;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
