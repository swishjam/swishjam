'use client';

import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import { useState, useEffect } from "react";
import { API } from "@/lib/api-client/base";
import NewUrlSegmentForm from "@/components/Settings/UrlSegmentForm";
import UrlSegmentPill from "@/components/Settings/UrlSegmentPill";
import WorkspaceForm from "@/components/Settings/WorkspaceForm";

const Divider = () => (
  <div className="my-6 w-full border-t border-gray-300" />
)

const LoadingState = () => (
  <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
    <div className='grid grid-cols-2 my-8 flex items-center'>
      <div>
        <h1 className="text-lg font-medium text-gray-700 mb-0">Settings</h1>
      </div>
    </div>

    <WorkspaceForm isSubmittable={false} />
    <Divider />
    <NewUrlSegmentForm isSubmittable={false} />

    <div className='mt-4 space-x-4'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="inline-flex items-center gap-x-0.5 rounded-md animate-pulse bg-gray-200 w-48 h-10 ring-1 ring-inset ring-gray-500/10" />
      ))}
    </div>
  </main>
)

const SettingsPage = () => {
  const [urlSegments, setUrlSegments] = useState();

  useEffect(() => {
    API.get('/api/v1/url_segments').then(setUrlSegments);
  }, []);

  return (
    urlSegments === undefined 
      ? <LoadingState />
      : (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
          <div className='grid grid-cols-2 my-8 flex items-center'>
            <div>
              <h1 className="text-lg font-medium text-gray-700 mb-0">Settings</h1>
            </div>
          </div>

          <WorkspaceForm />
          <Divider />
          <NewUrlSegmentForm onNewUrlSegment={urlSegment => setUrlSegments([urlSegment, ...urlSegments])} />

          <div className='mt-4 space-x-4 space-y-4'>
            {urlSegments.map((urlSegment, i) => (
              <UrlSegmentPill 
                key={i} 
                urlSegment={urlSegment} 
                onDelete={urlSegment => setUrlSegments(urlSegments.filter(us => us.id !== urlSegment.id))} 
              />
            ))}
          </div>
        </main>
      )
  )
}

export default AuthenticatedView(SettingsPage, LoadingState);