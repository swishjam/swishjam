'use client'

import { useRouter } from 'next/navigation'
import { useAuthData } from "@/hooks/useAuthData";
import LoadingSpinner from "@/components/LoadingSpinner";
import SheetProvider from '@/providers/SheetProvider';
import EnlargableDashboardComponentProvider from '@/providers/EnlargableDashboardComponentProvider';
import ConfirmationModalProvider from '@/providers/ConfirmationModalProvider';

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
      <SheetProvider>
        <EnlargableDashboardComponentProvider>
          <ConfirmationModalProvider>
            {children}
          </ConfirmationModalProvider>
        </EnlargableDashboardComponentProvider>
      </SheetProvider>
    )
  } else {
    router.push('/')
  }
}