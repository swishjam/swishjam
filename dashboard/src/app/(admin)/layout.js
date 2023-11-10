'use client'

import { useRouter } from 'next/navigation'
import { useAuthData } from "@/hooks/useAuthData";
import LoadingSpinner from "@/components/LoadingSpinner";

const ADMINS = (process.env.NEXT_PUBLIC_SWISHJAM_ADMINS || '').split(',').map(email => email.trim());

export default function Layout({ children }) {
  const { isAwaitingData, isLoggedOut, email } = useAuthData();
  const router = useRouter();

  if (isAwaitingData) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <LoadingSpinner size={12} />
      </div>
    )
  } else if (!isLoggedOut && ADMINS.includes(email)) {
    return children
  } else {
    router.push('/')
  }
}