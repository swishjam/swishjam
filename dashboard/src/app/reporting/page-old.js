'use client';

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/AuthenticatedView"
import { useAuth } from "@/components/AuthProvider";
import { BeakerIcon } from "@heroicons/react/24/outline";
import HostUrlFilterer from "@/components/Filters/HostUrlFilterer";
import { ExclamationTriangleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { ProjectPageUrlsAPI } from '@/lib/api-client/project-page-urls';

export default function Manage() {
  const { currentProject } = useAuth();
  const [ success, setSuccess] = useState();
  const [ error, setError] = useState();
  const [ projectReportSettings, setProjectReportSettings] = useState();
  const [urlHost, setUrlHost] = useState();

  const saveSettings = async () => {
    setSuccess(false);
    setError(false);

    if(false) {
      setSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setSuccess(false); 
    } else {
      setError(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setError(false);
    }

  }

  useEffect(() => {
    //setProjectPageUrls();
    ProjectPageUrlsAPI.getAll().then(res => console.log(res));
  }, [currentProject?.public_id]);

  // todo 
  // data model in supabase
  // api & backend calls to save the data in supabase
  // get the data from supabase 
  

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Reporting Settings</h1>
          </div>
          <div className='justify-end flex'>
            {success && <SuccessMsg />}
            {error && <ErrorMsg />} 
            <button 
              onClick={() => saveSettings()}
              className="ml-6 mt-2 rounded-md bg-swishjam px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-swishjam-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swishjam transition duration-300"
            >
              Save Settings
            </button>
          </div>
        </div>
        <div className="max-w-2xl space-y-10 md:col-span-2">
          <fieldset>
            <legend className="text-sm font-semibold leading-6 text-gray-900">Real User Reporting</legend>
            <div className="mt-6 space-y-6">
              <div className="relative flex gap-x-3">
                <div className="flex h-6 items-center">
                  <input
                    id="comments"
                    name="comments"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-swishjam focus:ring-swishjam cursor-pointer"
                  />
                </div>
                <div className="text-sm leading-6">
                  <label htmlFor="comments" className="font-medium text-gray-900">
                    Weekly Core Web Vitals Report
                  </label>
                  <p className="text-gray-500">Get a weekly email on your real user core web vitals. <br />Know when your users experince changes for the better or worse.</p>
                  <div className="mt-4 ">
                    <p className="font-medium text-gray-900">
                      URL To Report On
                    </p>
                    <HostUrlFilterer onHostSelected={setUrlHost} onNoHostsFound={() => {}} />
                  </div> 
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold leading-6 text-gray-900">Lab Test Reporting</legend>
            <p className="text-gray-500">(Coming Soon)</p>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold leading-6 text-gray-900">Google's CrUX Data Reporting</legend>
            <p className="text-gray-500">(Coming Soon)</p>
          </fieldset>
        </div>
      </main>
    </AuthenticatedView>
  )
}

function SuccessMsg() {
  return (
    <div className="rounded-md bg-green-50 p-2 w-64 mt-2">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">Successfully saved.</p>
        </div>
      </div>
    </div>
  )
}

function ErrorMsg() {
  return (
    <div className="bg-yellow-50 p-2 w-64 mt-2">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            An error occurred try again 
          </p>
        </div>
      </div>
    </div>
  
  )
}
