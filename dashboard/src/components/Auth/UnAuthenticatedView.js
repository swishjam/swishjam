'use client';

import { useRouter } from 'next/navigation';
import LoadingSpinner from '../LoadingSpinner';
import { useAuthData } from '@/hooks/useAuthData';

export default function AuthenticatedView({ children, LoadingView }) {
  const router = useRouter();
  const { isAwaitingData, isLoggedOut } = useAuthData();

  if (isAwaitingData) {
    return (
      <main className='w-screen h-screen flex items-center justify-center'>
        {LoadingView || <LoadingSpinner size={8} />}
      </main>
    )
  } else if (isLoggedOut) {
    return (
      <main className='w-full'>
        {children}
      </main>
    )
  } else if (!isLoggedOut) {
    router.push('/');
  } else {
    throw new Error('UnAuthenticatedView component was rendered without authData or isAwaitingData being set.');
  }
};