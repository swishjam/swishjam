'use client'

import dynamic from 'next/dynamic';
import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import CommandBarProvider from '@/providers/CommandBarProvider';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function layout({ children }) {
  const LoadingView = getLoadingView(children);
  return (
    <CommandBarProvider>
      <AuthenticatedView LoadingView={LoadingView}>
        {children}
      </AuthenticatedView>
    </CommandBarProvider>
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