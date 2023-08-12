'use client';

import { useEffect, useState } from 'react';
import { API } from '@lib/api-client/base'

const LOCAL_STORAGE_TOKEN_KEY = 'swishjam-token';

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  }
}

export const logUserOut = async () => {
  const { error } = await API.post('/auth/logout');
  if (error) {
    throw error;
  } else {
    clearToken();
  }
}

const setToken = tokenValue => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, tokenValue);
  } else {
    throw new Error('localStorage is not defined yet, cannot set token.');
  }
}

export const signUserUp = async ({ email, password, organizationName, organizationUrl }) => {
  const { error, user, organization, token } = await API.post('/auth/register', { email, password, organization_name: organizationName, organization_url: organizationUrl });
  if (token) {
    setToken(token);
  }
  return { error, user, organization, token };
}

export const logUserIn = async ({ email, password }) => {
  const { error, user, token } = await API.post('/auth/login', { email, password });
  if (token) {
    setToken(token);
  }
  return { error, user, token };
}

export const getToken = () => {
  const [token, setToken] = useState();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY));
    }
  }, []);

  return token;
}

export const useAuthData = () => {
  const [authData, setAuthData] = useState();
  const [isAwaitingData, setIsAwaitingData] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const decodeJWT = token => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (token) {
        try {
          const decoded = decodeJWT(token);
          setAuthData({
            token: () => token,
            email: () => decoded.user.email,
            userId: () => decoded.user.id,
            organizationId: () => decoded.current_organization.id,
            organizationName: () => decoded.current_organization.name,
            organizations: () => decoded.organizations,
            epiresAtEpoch: () => decoded.expires_at_epoch,
            isExpired: () => decoded.expires_at_epoch < Date.now() / 1000,
          });
        } catch(err) {
          setIsLoggedOut(true);
        }
      } else {
        setIsLoggedOut(true);
      }
      setIsAwaitingData(false);
    }
  }, []);

  return { authData, isAwaitingData, isLoggedOut, isLoggedIn: isAwaitingData ? null : !isLoggedOut };
}

























// 'use client';

// import { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/navigation';
// // import supabase from 'src/lib/supabase-browser';
// import { SwishjamMemory } from '@/lib/swishjam-memory';

// // export const EVENTS = {
// //   SIGNED_IN: 'SIGNED_IN',
// //   TOKEN_REFRESHED: 'SIGNED_OUT',
// //   PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
// //   SIGNED_OUT: 'SIGNED_OUT',
// //   USER_UPDATED: 'USER_UPDATED',
// // };

// export const AuthContext = createContext();

// export const AuthProvider = (props) => {
//   // const [initial, setInitial] = useState(true);
//   // const [session, setSession] = useState();
//   const [user, setUser] = useState();
//   // const [userOrg, setUserOrg] = useState();
//   // const [userOrgs, setUserOrgs] = useState();
//   // const [projects, setProjects] = useState([]);
//   // const [currentProject, setCurrentProject] = useState();
//   // const [isAwaitingData, setIsAwaitingData] = useState(true);
//   const router = useRouter();
//   // const { accessToken, ...rest } = props;

//   function updateCurrentProject({ name, public_id }) {
//     SwishjamMemory.set("currentProjectName", name);
//     SwishjamMemory.set("currentProjectKey", public_id);
//     setCurrentProject({ name, public_id });
//   }

//   async function updateCurrentOrganization(organization) {
//     if (organization) {
//       SwishjamMemory.set('currentOrganization', organization.id);
//       // setUserOrg(organization);
//       // const { data: projects } = await supabase.from('projects').select('*').eq('organization_id', organization.id)
//       // setProjects(projects);

//       const inMemoryProject = SwishjamMemory.get("currentProjectKey") ? projects.find(({ public_id }) => public_id === SwishjamMemory.get("currentProjectKey")) : null;

//       if (inMemoryProject) {
//         setCurrentProject({ name: inMemoryProject.name, public_id: inMemoryProject.public_id });
//       } else if (projects.length > 0) {
//         setCurrentProject({ name: projects[0].name, public_id: projects[0].public_id });
//         SwishjamMemory.set("currentProjectName", projects[0].name);
//         SwishjamMemory.set("currentProjectKey", projects[0].public_id);
//       }
//     } else {
//       SwishjamMemory.delete('currentOrganization');
//       setUserOrg(null);
//     }
//   }

//   useEffect(() => {
//     async function getCoreUserData(localUser) {
//       if (localUser) {
//         if(window?.location?.href?.includes('register')) return;
        
//         const orgUsers = await supabase.from('organization_users').select('*').eq('user_id', localUser.id)
//         if (orgUsers.error) { throw orgUsers.error } 
      
//         const orgs = await supabase.from('organizations').select('id, name').in('id', orgUsers.data.map(orgUser => orgUser.organization_id))
//         if (orgs.error) { throw orgs.error } 
//         setUserOrgs(orgs.data);

//         const currentOrganization = SwishjamMemory.get('currentOrganization') ? orgs.data.find(org => org.id === SwishjamMemory.get('currentOrganization')) : orgs.data[0];
//         updateCurrentOrganization(currentOrganization);
      
//         const { data: projects } = await supabase.from('projects').select('*').eq('organization_id', currentOrganization.id)
//         setProjects(projects)

//         const inMemoryProject = SwishjamMemory.get("currentProjectKey") ? projects.find(({ public_id }) => public_id === SwishjamMemory.get("currentProjectKey")) : null;
        
//         if (inMemoryProject) {
//           setCurrentProject({ name: inMemoryProject.name, public_id: inMemoryProject.public_id });  
//         } else if (projects.length > 0) {
//           setCurrentProject({ name: projects[0].name, public_id: projects[0].public_id });
//           SwishjamMemory.set("currentProjectName", projects[0].name);
//           SwishjamMemory.set("currentProjectKey", projects[0].public_id);
//         }
//       }
//       setIsAwaitingData(false);
//     }

//     async function getActiveSession() {
//       const { data: { session: activeSession }} = await supabase.auth.getSession();
//       setSession(activeSession);
//       setUser(activeSession?.user ?? null);
//       setInitial(false);
//       getCoreUserData(activeSession?.user ?? null);
//     }
//     getActiveSession();

//     const { data: { subscription: authListener }} = supabase.auth.onAuthStateChange((event, currentSession) => {  
//       if (currentSession?.access_token !== accessToken) {
//         router.refresh();
//       }

//       setSession(currentSession);
//       setUser(currentSession?.user ?? null);

//       if(event === EVENTS.SIGNED_OUT) {
//         setSession(null)
//         setUser(null)
//         updateCurrentOrganization(null);
//         setProjects([]);
//         setCurrentProject(null);
//         SwishjamMemory.delete('currentProjectName')
//         SwishjamMemory.delete('currentProjectKey')
//       }
//       // check if user is signed in and then try to pull the user's org, sites, & set site
//       if(event === EVENTS.SIGNED_IN) {
//         if(currentSession?.user) {
//           getCoreUserData(currentSession.user);
//         } 
//       }

//     });

//     return () => {
//       authListener?.unsubscribe();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const value = useMemo(() => {
//     return {
//       initial,
//       session,
//       user,
//       userOrg,
//       userOrgs,
//       currentProject,
//       projects,
//       isAwaitingData,
//       updateCurrentOrganization,
//       setUserOrgs,
//       updateCurrentProject,
//       setProjects,
//       signOut: () => supabase.auth.signOut(),
//     };
//   }, [initial, session, user, userOrg, currentProject, projects]);

//   return <AuthContext.Provider value={value} {...rest} />;
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
