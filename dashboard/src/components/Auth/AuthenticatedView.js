'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SwishjamMemory } from '@/lib/swishjam-memory';
import Sidebar from '@/components/SideNav/Nav';
import LoadingSpinner from '../LoadingSpinner';
import { useAuthData, clearToken } from './AuthProvider';

export default function AuthenticatedView(WrappedComponent, LoadingViewComponent) {
  return (props) => {
    //const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false);
    const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(false)
    const router = useRouter();
    const { isAwaitingData, authData, isLoggedOut } = useAuthData();

    useEffect(() => {

      try {
        //const typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false);     
      } catch(e) {} 

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
    }
  };
};