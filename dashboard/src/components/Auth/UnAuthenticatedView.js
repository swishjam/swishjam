'use client';

import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthData } from '@/components/Auth/AuthenticationProvider';

export default function AuthenticatedView({ children }) {
  const router = useRouter();
  const { isAwaitingData, isLoggedOut } = useAuthData();

  console.log('isAwaitingData', isAwaitingData)
  console.log('isLoggedOut', isLoggedOut)
  if (isAwaitingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size={8} />
      </div>
    )
  } else if (!isLoggedOut) {
    router.push('/');
  } else if (isLoggedOut) {
    return children
  } else {
    throw new Error('UnAuthenticatedView component was rendered without authData or isAwaitingData being set.');
  }
};