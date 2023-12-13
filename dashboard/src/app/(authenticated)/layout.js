'use client'

import dynamic from 'next/dynamic';
import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import CommandBarProvider from '@/providers/CommandBarProvider';
import HotKeyProvider from '@/providers/HotKeyProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Toaster } from 'sonner'
import { IntercomProvider } from 'react-use-intercom';

export default function layout({ children }) {
  const LoadingView = getLoadingView(children);
  return (
    <>
      {/* <IntercomProvider appId="p7d72soi" autoBoot={true}> */}
      <CommandBarProvider>
        <HotKeyProvider>
          <AuthenticatedView LoadingView={LoadingView}>
            {children}
          </AuthenticatedView>
        </HotKeyProvider>
      </CommandBarProvider>
      {/* </IntercomProvider> */}
      <Toaster richColors closeButton />
    </>
  )
}

const getLoadingView = children => {
  if (process.env.NEXT_PUBLIC_ENABLE_LOADING_STATES_BETWEEN_AUTH) {
    return dynamic(() => {
      return import(`./${children.props.childProp.segment}/LoadingView`).catch(_err => (
        <div className='w-full h-screen flex items-center justify-center'>
          <LoadingSpinner size={8} />
        </div>
      ))
    });
  } else {
    return <></>
  }
}