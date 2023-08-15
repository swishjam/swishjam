'use client';

import { useState } from "react";
import { API } from "@/lib/api-client/base";
import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import LoadingSpinner from "@/components/LoadingSpinner";
import Logo from "@/components/Logo";

export default function Onboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [url, setUrl] = useState();

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError();
    const { error, success, numCreated, numFound } = await API.get('/api/sitemap/import', { url });
    setIsLoading(false);
    if (error) {
      setError(error);
    } else {

    }
  }

  return (
    <AuthenticatedView>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="mx-auto w-52">
            <Logo className="h-12 inline-block" words={true} />
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white py-8 px-4 sm:border sm:rounded-lg sm:px-10 shadow-sm">
            <h2 className="text-2xl text-gray-900">Your site URL</h2> 
            <h3 className="text-sm mb-6 text-gray-500">What is the URL of the site you would like to monitor on Swishjam?</h3> 
            <form onSubmit={onSubmit}>
              <div className="my-2">
                <div
                  className={`flex w-full rounded-md border border-gray-300 px-5 py-1 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-swishjam focus:ring-swishjam`}
                >
                  <span className="flex select-none items-center pl-3 py-0.5 text-gray-500 sm:text-sm">https://</span>
                  <input
                    className="block flex-1 border-0 bg-transparent pl-1 py-0.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    onChange={e => setUrl(e.target.value)}
                    placeholder='www.swishjam.com'
                    type='text'
                    required
                  />
                </div>
              </div>
              <div>
                {error && <div className="text-red-600 mt-1 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark focus:outline-none focus:ring-2'}`}
                  disabled={isLoading}
                >
                  {isLoading ? <div className="h-6"><LoadingSpinner size={6} color='white' /></div> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedView>
  )
}