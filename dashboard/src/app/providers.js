// app/providers.js
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

if (typeof window !== 'undefined') {
  posthog.init(
    process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'http://app.posthog.com',
    // Disable in development
    loaded: (posthog) => {
      //console.log('posthog loaded') 
      if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing()
    }
  })
}

export default function PHProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Utilized this: https://posthog.com/tutorials/nextjs-app-directory-analytics
  useEffect(() => {
    if (pathname) {
      //console.log('pathname', pathname) 
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture(
        '$pageview',
        {
          '$current_url': url,
        }
      )
    }
  }, [pathname, searchParams]) 
  
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}