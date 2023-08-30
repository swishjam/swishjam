'use client';

import { useState } from 'react';
import { API } from '@/lib/api-client/base';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function NewUrlSegmentForm({ onNewUrlSegment, isSubmittable = true }) {
  const [newUrlSegmentUrlHost, setNewUrlSegmentUrlHost] = useState();
  const [newUrlSegmentName, setNewUrlSegmentName] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    if (!isSubmittable) return;
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    if (!newUrlSegmentName || !newUrlSegmentUrlHost || newUrlSegmentName.length === 0 || newUrlSegmentUrlHost.length === 0) {
      setErrorMessage('Please enter a name and value for your URL segment.');
      setIsLoading(false);
    } else {
      API.post('/api/v1/url_segments', { url_segment: { name: newUrlSegmentName, url_host: newUrlSegmentUrlHost } }).then(({ url_segment, error }) => {
        setIsLoading(false);
        debugger;
        if (error) {
          setErrorMessage(error);
        } else {
          setNewUrlSegmentUrlHost('');
          setNewUrlSegmentName('');
          onNewUrlSegment(url_segment);
        }
      });
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium leading-6 text-gray-900">
          URL Segment
          <br/>
          <span className='text-sm font-light text-gray-500'>URL segments are used for filtering data, and deciphering between marketing and app analytics.</span>
        </label>
        <div className="grid max-w-2xl grid-cols-3 gap-x-6 mt-4">
          <div className="sm:col-span-1">
            <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
              Segment name
            </label>
            <div className="mt-2">
              <input
                type="text"
                value={newUrlSegmentName}
                onChange={e => setNewUrlSegmentName(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
              URL Host
            </label>
            <div className="mt-2">
              <input
                type="text"
                value={newUrlSegmentUrlHost}
                onChange={e => setNewUrlSegmentUrlHost(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className='sm:col-span-1 flex items-end'>
            {!isSubmittable
              ? <button className='ml-2 w-20 h-10 rounded-md bg-gray-200 animate-pulse' disabled />
              : (
                <button
                  type="submit"
                  className={`ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isLoading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner color='white' className='w-5 h-5' /> : 'Add'}
                </button>
              )
            }
          </div>
        </div>
        {errorMessage && <div className="text-red-600 text-sm mt-2">{errorMessage}</div>}
      </form>
    </div>
  )
}