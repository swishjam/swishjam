'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SwishjamMemory } from '@/lib/swishjam-memory';
import Sidebar from '@/components/SideNav/Nav';
import LoadingSpinner from './LoadingSpinner';
import { useAuthData, clearToken } from './AuthProvider';

export default function AuthenticatedView(WrappedComponent) {
  return (props) => {
    const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false);
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

    if (isAwaitingData) {
      return (
        <>
          <Sidebar 
            onCollapse={() => setSideNavIsCollapsed(true)} 
            onExpand={() => setSideNavIsCollapsed(false)} 
            authData={authData}
          />
          <main className={`${sideNavIsCollapsed ? 'lg:pl-10' : 'lg:pl-72'}`}>
            <div className="px-4 sm:px-6 lg:px-8 flex min-h-screen items-center justify-center">
              <LoadingSpinner size={8} />
            </div>
          </main>
        </>
      )
    } else if(authData && !authData.isExpired()) {
      return (
        <>
          <Sidebar 
            onCollapse={() => setSideNavIsCollapsed(true)} 
            onExpand={() => setSideNavIsCollapsed(false)} 
            authData={authData}
          />
          <main className={`transition-all duration-500 ${sideNavIsCollapsed ? 'lg:pl-10' : 'lg:pl-72'}`}>
            <div className="px-4 sm:px-6 lg:px-8">
              <WrappedComponent {...props} user={{ id: 'foo?' }} />
            </div>
          </main>
        </>
      )
    }
  };
};