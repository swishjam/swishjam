"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SwishjamMemory } from '@/lib/swishjam-memory';
import Sidebar from "@/components/SideNav/Nav";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuthData } from "@/hooks/useAuthData";

export default function AuthenticatedView({ children, LoadingView }) {
  const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(typeof SwishjamMemory.get('isNavCollapsed') === 'boolean' ? SwishjamMemory.get('isNavCollapsed') : false);
  const router = useRouter();
  // const [sideNavIsCollapsed, setSideNavIsCollapsed] = useState(false);
  const { isAwaitingData, isLoggedOut, email } = useAuthData();

  if (isLoggedOut) {
    router.push(`/login?return_url=${window.location.pathname + window.location.search}`);
  } else if (isAwaitingData) {
    return (
      <>
        <Sidebar
          onCollapse={() => setSideNavIsCollapsed(true)}
          onExpand={() => setSideNavIsCollapsed(false)}
          email={email}
        />
        <main className={`${sideNavIsCollapsed ? "lg:pl-12" : "lg:pl-64"}`}>
          {process.env.NEXT_PUBLIC_GLOBAL_BANNER_NOTIFICATION_MESSAGE && (
            <div className="w-full text-sm bg-swishjam px-4 py-4 rounded-b-md text-white drop-shadow-md flex items-center justify-center">
              {process.env.NEXT_PUBLIC_GLOBAL_BANNER_NOTIFICATION_MESSAGE}
            </div>
          )}
          {process.env.NEXT_PUBLIC_ENABLE_LOADING_STATES_BETWEEN_AUTH && (
            <div className="pr-4 sm:pr-6 lg:pr-8">
              {LoadingView ? (
                <LoadingView />
              ) : (
                <div className="flex min-h-screen items-center justify-center">
                  <LoadingSpinner size={10} />
                </div>
              )}
            </div>
          )}
        </main>
      </>
    );
  } else if (!isLoggedOut) {
    return (
      <>
        <Sidebar
          onCollapse={() => setSideNavIsCollapsed(true)}
          onExpand={() => setSideNavIsCollapsed(false)}
          email={email}
        />
        <main className={`${sideNavIsCollapsed ? "lg:pl-12" : "lg:pl-64"} `}>
          {process.env.NEXT_PUBLIC_GLOBAL_BANNER_NOTIFICATION_MESSAGE && (
            <div className="w-full text-sm bg-swishjam px-4 py-4 rounded-b-md text-white drop-shadow-md flex items-center justify-center">
              {process.env.NEXT_PUBLIC_GLOBAL_BANNER_NOTIFICATION_MESSAGE}
            </div>
          )}
          {/* <div className="pr-4 sm:pr-6 lg:pr-8">{children}</div> */}
          <div className="">{children}</div>
        </main>
      </>
    );
  } else {
    throw new Error("AuthenticatedView component was rendered without authData or isAwaitingData being set.");
  }
}
