'use client';
import { useState } from 'react';
import Sidebar from '@components/Sidebar';
import { useAuth } from '@components/AuthProvider';
import LoadingFullScreen from '@components/LoadingFullScreen';
import SignIn from '@components/Auth/SignIn';
import { SwishjamMemory } from '@/lib/swishjam-memory';
import LoadingSpinner from './LoadingSpinner';

export default function AuthenticatedView({ LoadingView, children }) {
  const { initial, user, currentProject, isAwaitingData } = useAuth();
  const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false);

  if (isAwaitingData) {
    return (
      <>
        <Sidebar onCollapse={() => setSideNavIsCollapsed(true)} onExpand={() => setSideNavIsCollapsed(false)} />
        <main className={`py-10 flex h-screen items-center transition ${sideNavIsCollapsed ? 'lg:pl-10' : 'lg:pl-72'}`}>
          {LoadingView || <div className='w-fit mx-auto'><LoadingSpinner size={8} /></div>}
        </main> 
      </>
    );
  } else if(user && !currentProject) {
    return <></>
  } else if (user) {
    return(
      <>
        <Sidebar onCollapse={() => setSideNavIsCollapsed(true)} onExpand={() => setSideNavIsCollapsed(false)} />
        <main className={`transition-all duration-500 ${sideNavIsCollapsed ? 'lg:pl-10' : 'lg:pl-72'}`}>
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main> 
        
      </>
    );
  } else if (!initial && !user) {
    return <SignIn />
  } else {
    // This is back up for now... 
    return <LoadingFullScreen />;
  } 
}