'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from 'src/lib/supabase-browser';
import { SwishjamMemory } from '@/lib/swishjam-memory';

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
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const router = useRouter();
  const { accessToken, ...rest } = props;

  function updateCurrentProject({ name, public_id }) {
    SwishjamMemory.set("currentProjectName", name);
    SwishjamMemory.set("currentProjectKey", public_id);
    setCurrentProject({ name, public_id });
  }

  useEffect(() => {
    async function getCoreUserData(localUser) {
      try { 
        if (localUser) {
          if(window?.location?.href?.includes('register')) {
            return
          }
          
          const orgUsers = await supabase.from('organization_users').select('*').eq('user_id', localUser.id)
          if (orgUsers.error) { throw orgUsers.error } 
        
          const orgs = await supabase.from('organizations').select('*').eq('id', orgUsers.data[0].organization_id)
          if (orgs.error) { throw orgs.error } 
          setUserOrg(orgs.data[0])
        
          const loadedProjects = await supabase.from('projects').select('*').eq('organization_id', orgs.data[0].id)
          setProjects(loadedProjects.data)

          const inMemoryProjectKey = SwishjamMemory.get("currentProjectKey");
          const inMemoryProjectName = SwishjamMemory.get("currentProjectName");
          
          if (inMemoryProjectKey && inMemoryProjectName) {
            setCurrentProject({ name: inMemoryProjectName, public_id: inMemoryProjectKey });  
          }
          if ((!inMemoryProjectKey || !inMemoryProjectName) && loadedProjects.data.length > 0) {
            setCurrentProject({ name: loadedProjects.data[0].name, public_id: loadedProjects.data[0].public_id });
            SwishjamMemory.set("currentProjectName", loadedProjects.data[0].name);
            SwishjamMemory.set("currentProjectKey", loadedProjects.data[0].public_id);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    async function getActiveSession() {
      const { data: { session: activeSession }} = await supabase.auth.getSession();
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      setInitial(false);
      getCoreUserData(activeSession?.user ?? null);
    }
    getActiveSession();

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      
      if (currentSession?.access_token !== accessToken) {
        router.refresh();
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if(event === EVENTS.SIGNED_OUT) {
        setSession(null)
        setUser(null)
        setUserOrg(null);
        setProjects([]);
        setCurrentProject(null);
        SwishjamMemory.delete('currentProjectName')
        SwishjamMemory.delete('currentProjectKey')
      }
      // check if user is signed in and then try to pull the user's org, sites, & set site
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
      currentProject,
      updateCurrentProject,
      projects,
      setProjects,
      signOut: () => supabase.auth.signOut(),
    };
  }, [initial, session, user, userOrg, currentProject, projects]);

  return <AuthContext.Provider value={value} {...rest} />;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
