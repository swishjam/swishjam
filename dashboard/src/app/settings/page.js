'use client';

import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import { useState, useEffect } from "react";
import { API } from "@/lib/api-client/base";
import LoadingSpinner from "@/components/LoadingSpinner";

const LoadingState = () => (
  <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
    <div className='grid grid-cols-2 mt-8 flex items-center'>
      <div>
        <h1 className="text-lg font-medium text-gray-700 mb-0">Settings</h1>
      </div>
    </div>

    <div className='mt-8'>
      <NewUrlSegmentForm isSubmittable={false} />
    </div>
    <div className='mt-4 space-x-4'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="inline-flex items-center gap-x-0.5 rounded-md animate-pulse bg-gray-200 w-48 h-10 ring-1 ring-inset ring-gray-500/10" />
      ))}
    </div>
  </main>
)

const UrlSegmentPill = ({ urlSegment, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    API.delete(`/api/v1/url_segments/${urlSegment.id}`).then(({ error }) => {
      setIsDeleting(false);
      if (error) {
      } else {
        onDelete(urlSegment);
      }
    })
  }

  return (
    <span className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-500/10">
      {urlSegment.name}: {urlSegment.url_host}
      {isDeleting && <LoadingSpinner color='gray' className='w-1 h-1 -mr-1' />}
      {!isDeleting && (
        <button type="button" className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20" onClick={handleDelete}>
          <span className="sr-only">Remove</span>
          <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75">
            <path d="M4 4l6 6m0-6l-6 6" />
          </svg>
          <span className="absolute -inset-1" />
        </button>
      )}
    </span>
  )
}

const NewUrlSegmentForm = ({ onNewUrlSegment, isSubmittable = true }) => {
  const [newUrlSegmentUrlHost, setNewUrlSegmentUrlHost] = useState();
  const [newUrlSegmentName, setNewUrlSegmentName] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    if (!isSubmittable) return;
    e.preventDefault();
    setIsLoading(true);
    if (!newUrlSegmentName || !newUrlSegmentUrlHost || newUrlSegmentName.length === 0 || newUrlSegmentUrlHost.length === 0) {
      setErrorMessage('Please enter a name and value for your URL segment.');
      setIsLoading(false);
    } else {
      API.post('/api/v1/url_segments', { url_segment: { name: newUrlSegmentName, url_host: newUrlSegmentUrlHost }}).then(({ url_segment, error }) => {
        setIsLoading(false);
        if (error) {
          setErrorMessage(result.error);
        } else {
          setNewUrlSegmentUrlHost('');
          setNewUrlSegmentName('');
          onNewUrlSegment(url_segment);
        }
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
        URL Segment
      </label>
      <div className="mt-2 flex">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input 
            type="text" 
            value={newUrlSegmentName} 
            onChange={e => setNewUrlSegmentName(e.target.value)} 
            className="input" 
            placeholder="Marketing Site" 
          />
        </div>
        <div className="ml-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input 
            type="text" 
            value={newUrlSegmentUrlHost} 
            onChange={e => setNewUrlSegmentUrlHost(e.target.value)} 
            className="input" 
            placeholder="swishjam.com" 
          />
        </div>
        <button
          type="submit"
          className={`ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isLoading || !isSubmittable ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
          disabled={isLoading || !isSubmittable}
        >
          {isLoading || !isSubmittable ? <LoadingSpinner color='white' className='w-5 h-5' /> : 'Add'}
        </button>
      </div>
      {errorMessage && <div className="text-red-600 text-sm mt-2">{errorMessage}</div>}
    </form>
  )
}

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
          <div className='grid grid-cols-2 mt-8 flex items-center'>
            <div>
              <h1 className="text-lg font-medium text-gray-700 mb-0">Settings</h1>
            </div>
          </div>

          <div className='mt-8'>
            <NewUrlSegmentForm onNewUrlSegment={urlSegment => setUrlSegments([urlSegment, ...urlSegments])} />
          </div>
          <div className='mt-4 space-x-4'>
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