import { useEffect } from 'react';
import { useAuthData } from '@/lib/auth';

export default function useLoggedInEffect(callback, dependencies) {
  const { isLoggedIn } = useAuthData();

  useEffect(() => {
    if (isLoggedIn) {
      callback();
    }
  }, [isLoggedIn, ...dependencies]);
}