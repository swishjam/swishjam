'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { SwishjamMemory } from '@/lib/swishjam-memory';
import Sidebar from '@/components/SideNav/Nav';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthData } from '@/components/Auth/AuthenticationProvider';

export default function AuthenticatedView({ children, LoadingView }) {
  // const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false);
  const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(false);
  const router = useRouter();
  const { isAwaitingData, isLoggedOut, email } = useAuthData();
  
  if (isLoggedOut) {
    router.push('/login');
  } else if (isAwaitingData) {
    return (
      <>
        <Sidebar onCollapse={() => setSideNavIsCollapsed(true)} onExpand={() => setSideNavIsCollapsed(false)} email={email} />
        <main className={`${sideNavIsCollapsed ? 'lg:pl-12' : 'lg:pl-64'}`}>
          <div className="pr-4 sm:pr-6 lg:pr-8">
            {LoadingView || (
              <div className="flex min-h-screen items-center justify-center">
                <LoadingSpinner size={8} />
              </div>
            )}
          </div>
        </main>
      </>
    )
  } else if(!isLoggedOut) {
    return (
      <>
        <Sidebar onCollapse={() => setSideNavIsCollapsed(true)} onExpand={() => setSideNavIsCollapsed(false)} email={email} />
        <main className={`${sideNavIsCollapsed ? 'lg:pl-12' : 'lg:pl-64'} `}>
          <div className="pr-4 sm:pr-6 lg:pr-8">
            {children}
          </div>
        </main>
      </>
    )
  } else {
    throw new Error('AuthenticatedView component was rendered without authData or isAwaitingData being set.');
  }
};