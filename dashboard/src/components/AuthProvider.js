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
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const router = useRouter();
  const { accessToken, ...rest } = props;

  async function updateCurrentProject(curProject) {
    //update the current project in local storage
    if(curProject) {
      try {
        const lsCurProject = await localStorage.setItem("currentProject", JSON.stringify(curProject))
        setCurrentProject(curProject)
      } catch(err) {
        console.error(err)
      } 
    } else {
      console.error(err)
    } 
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

          const lsCurProject = localStorage.getItem("currentProject");
          
          if (lsCurProject) {
            setCurrentProject(JSON.parse(lsCurProject))  
          }
          if(!lsCurProject && loadedProjects.data.length > 0) {
            setCurrentProject(loadedProjects.data[0]);
            localStorage.setItem("currentProject", JSON.stringify(loadedProjects.data[0]));
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
        setSession(null)
        setUser(null)
        setUserOrg(null);
        setProjects([]);
        setCurrentProject(null);
        localStorage.removeItem("currentProject");
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
