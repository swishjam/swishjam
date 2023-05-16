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
  const [session, setSession] = useState();
  const [user, setUser] = useState();
  const [userOrg, setUserOrg] = useState();
  const [userOrgs, setUserOrgs] = useState();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState();
  const router = useRouter();
  const { accessToken, ...rest } = props;

  function updateCurrentProject({ name, public_id }) {
    SwishjamMemory.set("currentProjectName", name);
    SwishjamMemory.set("currentProjectKey", public_id);
    setCurrentProject({ name, public_id });
  }

  async function updateCurrentOrganization(organization) {
    if (organization) {
      SwishjamMemory.set('currentOrganization', organization.id);
      setUserOrg(organization);
      // getCoreUserData(user);
    } else {
      SwishjamMemory.delete('currentOrganization');
      setUserOrg(null);
    }
  }

  useEffect(() => {
    async function getCoreUserData(localUser) {
      try { 
        if (localUser) {
          if(window?.location?.href?.includes('register')) return;
          
          const orgUsers = await supabase.from('organization_users').select('*').eq('user_id', localUser.id)
          if (orgUsers.error) { throw orgUsers.error } 
        
          const orgs = await supabase.from('organizations').select('id, name').in('id', orgUsers.data.map(orgUser => orgUser.organization_id))
          if (orgs.error) { throw orgs.error } 
          setUserOrgs(orgs.data);

          const currentOrganization = SwishjamMemory.get('currentOrganization') ? orgs.data.find(org => org.id === SwishjamMemory.get('currentOrganization')) : orgs.data[0];
          updateCurrentOrganization(currentOrganization);
        
          const loadedProjects = await supabase.from('projects').select('*').eq('organization_id', currentOrganization.id)
          setProjects(loadedProjects.data)

          const inMemoryProject = SwishjamMemory.get("currentProjectKey") ? loadedProjects.data.find(project => project.public_id === SwishjamMemory.get("currentProjectKey")) : null;
          
          if (inMemoryProject) {
            setCurrentProject({ name: inMemoryProject.name, public_id: inMemoryProject.public_id });  
          }
          if (!inMemoryProject && loadedProjects.data.length > 0) {
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

    const { data: { subscription: authListener }} = supabase.auth.onAuthStateChange((event, currentSession) => {
      
      if (currentSession?.access_token !== accessToken) {
        router.refresh();
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if(event === EVENTS.SIGNED_OUT) {
        setSession(null)
        setUser(null)
        updateCurrentOrganization(null);
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
  }, [userOrg]);

  const value = useMemo(() => {
    return {
      initial,
      session,
      user,
      userOrg,
      userOrgs,
      updateCurrentOrganization,
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
