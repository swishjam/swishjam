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
    return (
      <main className='w-screen h-screen px-8 py-8'>
        <h1 className='text-lg text-gray-700'>Admin</h1>
        <div className="pr-4 sm:pr-6 lg:pr-8 mt-8">{children}</div>
      </main>
    )
  } else {
    router.push('/')
  }
}