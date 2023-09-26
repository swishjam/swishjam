'use client'

import dynamic from 'next/dynamic';
import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import LoadingSpinner from '@/components/LoadingSpinner';

export default function layout({ children }) {
  const LoadingView = getLoadingView(children);
  return (
    <AuthenticatedView LoadingView={<LoadingView />}>
      {children}
    </AuthenticatedView>
  )
}

const getLoadingView = children => {
  if (process.env.NEXT_PUBLIC_DISABLE_LOADING_STATES) return () => <></>;
  return dynamic(() => {
    return import(`./${children.props.childProp.segment}/LoadingView`).catch(_err => (
      () => (
        <div className='w-full h-screen flex items-center justify-center'>
          <LoadingSpinner size={8} />
        </div>
      )
    ))
  });
}