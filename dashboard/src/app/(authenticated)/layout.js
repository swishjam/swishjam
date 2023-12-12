'use client'

import dynamic from 'next/dynamic';
import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import CommandBarProvider from '@/providers/CommandBarProvider';
import HotKeyProvider from '@/providers/HotKeyProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import { IntercomProvider } from 'react-use-intercom';

export default function layout({ children }) {
  const LoadingView = getLoadingView(children);
  return (
    <>
      {/* <Head>
        <Script id="intercom-script" strategy="lazyOnload">
          {`(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/p7d72soi';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload', l);}else{w.addEventListener('load', l, false);}}})();`}
        </Script>
      </Head > */}
      <IntercomProvider appId="p7d72soi" autoBoot={true}>
        {/* <IntercomProvider appId="dqzjmrph" autoBoot={true}> */}
        <CommandBarProvider>
          <HotKeyProvider>
            <AuthenticatedView LoadingView={LoadingView}>
              {children}
            </AuthenticatedView>
          </HotKeyProvider>
        </CommandBarProvider>
      </IntercomProvider>
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