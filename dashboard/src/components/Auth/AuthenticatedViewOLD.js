'use client';

import { useEffect, useState, createContext } from 'react';
import { useRouter } from 'next/navigation';
import { SwishjamMemory } from '@/lib/swishjam-memory';
import Sidebar from '@/components/SideNav/Nav';
import LoadingSpinner from '../LoadingSpinner';
import { useAuthData, clearToken } from './AuthProviderOLD';
import { LOCAL_STORAGE_TOKEN_KEY } from './AuthProviderOLD';

const AuthenticationContext = createContext();
export const useAuthData = () => useContext(AuthenticationContext);

export function AuthenticatedView({ children, LoadingView }) {
  const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(false);
  const router = useRouter();
  // const { isAwaitingData, authData, isLoggedOut } = useAuthData();
  const [authStates, setAuthStates] = useState({ isAwaitingData: true, isLoggedOut: null, authData: null });
  // const [isAwaitingData, setIsAwaitingData] = useState(true);
  // const [isLoggedOut, setIsLoggedOut] = useState(false);

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
          setAuthStates({
            isLoggedOut: false,
            isAwaitingData: false,
            authData: {
              token: () => token,
              email: () => decoded.user.email,
              userId: () => decoded.user.id,
              workspaceId: () => decoded.current_workspace.id,
              workspaceName: () => decoded.current_workspace.name,
              currentWorkspaceName: () => decoded.current_workspace.name,
              currentWorkspaceId: () => decoded.current_workspace.id,
              currentWorkspacePublicKey: () => decoded.current_workspace.api_key,
              workspaces: () => decoded.workspaces,
              epiresAtEpoch: () => decoded.expires_at_epoch,
              isExpired: () => decoded.expires_at_epoch < Date.now() / 1000,
            }
          });
        } catch (err) {
          // setIsLoggedOut(true);
          setAuthStates({ isLoggedOut: true, isAwaitingData: false, authData: null });
        }
      } else {
        // setIsLoggedOut(true);
        setAuthStates({ isLoggedOut: true, isAwaitingData: false, authData: null });
      }
      // setIsAwaitingData(false);
    }
  }, []);

  return { authData, isAwaitingData, isLoggedOut, isLoggedIn: isAwaitingData ? null : !isLoggedOut };

  // useEffect(() => {
  //   if (isLoggedOut) {
  //     router.push('/login');
  //     return;
  //   } else if (authData && authData.isExpired()) {
  //     clearToken();
  //     router.push('/login');
  //     return;
  //   }
  // }, [isAwaitingData, authData, isLoggedOut]);

  console.log('STATE OF AUTHENTICATED VIEW');
  console.log('isAwaitingData', isAwaitingData);
  console.log('authData', authData);
  console.log('isLoggedOut', isLoggedOut);
  if (isAwaitingData) {
    return (
      <>
        <Sidebar onCollapse={() => setSideNavIsCollapsed(true)} onExpand={() => setSideNavIsCollapsed(false)} authData={authData} />
        <main className={`${sideNavIsCollapsed ? 'lg:pl-12' : 'lg:pl-64'}`}>
          <div className="pr-4 sm:pr-6 lg:pr-8">
            {LoadingViewComponent ? <LoadingViewComponent /> : (
              <div className="flex min-h-screen items-center justify-center">
                <LoadingSpinner size={8} />
              </div>
            )}
          </div>
        </main>
      </>
    )
  } else if (authData && !authData.isExpired()) {
    return (
      <>
        <Sidebar onCollapse={() => setSideNavIsCollapsed(true)} onExpand={() => setSideNavIsCollapsed(false)} authData={authData} />
        <main className={`${sideNavIsCollapsed ? 'lg:pl-12' : 'lg:pl-64'} `}>
          <div className="pr-4 sm:pr-6 lg:pr-8">
            <WrappedComponent {...props} user={{ id: 'foo?' }} />
          </div>
        </main>
      </>
    )
  } else {
    throw new Error('AuthenticatedView component was rendered without authData or isAwaitingData being set.');
  }
}

export function AuthenticatedViewOLD(WrappedComponent, LoadingViewComponent) {
  return (props) => {
    // const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false);
    const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(false);
    const router = useRouter();
    const { isAwaitingData, authData, isLoggedOut } = useAuthData();

    useEffect(() => {
      if (isLoggedOut) {
        router.push('/login');
        return;
      } else if (authData && authData.isExpired()) {
        clearToken();
        router.push('/login');
        return;
      }
    }, [isAwaitingData, authData, isLoggedOut]);

    console.log('STATE OF AUTHENTICATED VIEW');
    console.log('isAwaitingData', isAwaitingData);
    console.log('authData', authData);
    console.log('isLoggedOut', isLoggedOut);
    if (isAwaitingData) {
      return (
        <>
          <Sidebar onCollapse={() => setSideNavIsCollapsed(true)} onExpand={() => setSideNavIsCollapsed(false)} authData={authData} />
          <main className={`${sideNavIsCollapsed ? 'lg:pl-12' : 'lg:pl-64'}`}>
            <div className="pr-4 sm:pr-6 lg:pr-8">
              {LoadingViewComponent ? <LoadingViewComponent /> : (
                <div className="flex min-h-screen items-center justify-center">
                  <LoadingSpinner size={8} />
                </div>
              )}
            </div>
          </main>
        </>
      )
    } else if(authData && !authData.isExpired()) {
      return (
        <>
          <Sidebar onCollapse={() => setSideNavIsCollapsed(true)} onExpand={() => setSideNavIsCollapsed(false)} authData={authData} />
          <main className={`${sideNavIsCollapsed ? 'lg:pl-12' : 'lg:pl-64'} `}>
            <div className="pr-4 sm:pr-6 lg:pr-8">
              <WrappedComponent {...props} user={{ id: 'foo?' }} />
            </div>
          </main>
        </>
      )
    } else {
      throw new Error('AuthenticatedView component was rendered without authData or isAwaitingData being set.');
    }
  };
};