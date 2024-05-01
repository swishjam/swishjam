'use client'

import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import CommandBarProvider from '@/providers/CommandBarProvider';
import dynamic from 'next/dynamic';
import EnlargableDataVisualizationProvider from "@/providers/EnlargableDataVisualizationProvider";
import HotKeyProvider from '@/providers/HotKeyProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import SheetProvider from '@/providers/SheetProvider';
import { Toaster, toast } from 'sonner'
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ConfirmationModalProvider } from "@/providers/ConfirmationModalProvider";
// import { IntercomProvider } from 'react-use-intercom';

export default function layout({ children }) {
  const LoadingView = getLoadingView(children);

  const searchParams = useSearchParams();
  useEffect(() => {
    const successMessage = searchParams.get('success');
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [searchParams])

  return (
    <>
      {/* <IntercomProvider appId="p7d72soi" autoBoot={true}> */}
      <CommandBarProvider>
        <HotKeyProvider>
          <SheetProvider>
            <ConfirmationModalProvider>
              <EnlargableDataVisualizationProvider>
                <AuthenticatedView LoadingView={LoadingView}>
                  {children}
                </AuthenticatedView>
              </EnlargableDataVisualizationProvider>
            </ConfirmationModalProvider>
          </SheetProvider>
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