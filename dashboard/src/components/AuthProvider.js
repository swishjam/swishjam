'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from 'src/lib/supabase-browser';

export const EVENTS = {
  SIGNED_IN: 'SIGNED_IN',
  TOKEN_REFRESHED: 'SIGNED_OUT',
  PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
  SIGNED_OUT: 'SIGNED_OUT',
  USER_UPDATED: 'USER_UPDATED',
};

export const AuthContext = createContext();

export const AuthProvider = (props) => {
  const [initial, setInitial] = useState(true);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userOrg, setUserOrg] = useState(null);
  const [allSites, setAllSites] = useState(null);
  const [currentSite, setCurrentSite] = useState(null);
  const router = useRouter();
  const { accessToken, ...rest } = props;

  useEffect(() => {
    console.log('does this load only once?');
    async function getCoreUserData(lUser) {
      try { 
        if (lUser) {
          const uO = await supabase.from('organization_users').select('*').eq('user_id', lUser.id)
          if (uO.error) { throw uO.error } 
        
          const org = await supabase.from('organizations').select('*').eq('id', uO.data[0].organization_id)
          if (org.error) { throw org.error } 
          setUserOrg(org.data[0])  
        
          const sites = await supabase.from('sites').select('*').eq('organization_id', org.data[0].id)
          setAllSites(sites.data)

          const lsCurSite = JSON.parse(await localStorage.getItem("currentSite")); 
          if(!lsCurSite) {
            setCurrentSite(sites.data[0]);
            localStorage.setItem("currentSite", JSON.stringify(sites.data[0]));
          } else {
            setCurrentSite(lsCurSite);
          }
        }
      } catch (error) {
        console.error(error);
      }
      return;
    }

    async function getActiveSession() {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      setInitial(false);
      getCoreUserData(activeSession?.user ?? null);
      console.log('user is logged in when page loads') 
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

      if(event === EVENTS.SIGNED_OUT) {
        setUserOrg(null);
        setAllSites(null);
        setCurrentSite(null);
      }
      // check if user is signed in and then try to pull the user's org, sites, & set site
      console.log(event) 
      if(event === EVENTS.SIGNED_IN) {
        if(currentSession?.user) {
          getCoreUserData(currentSession.user);
        } 
      }

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
      userOrg,
      setUserOrg,
      currentSite,
      setCurrentSite,
      allSites,
      setAllSites,
      signOut: () => supabase.auth.signOut(),
    };
  }, [initial, session, user, userOrg, currentSite, allSites]);

  return <AuthContext.Provider value={value} {...rest} />;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
