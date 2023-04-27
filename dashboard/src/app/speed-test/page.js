'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@components/Logo';
import LoadingSpinner from '@components/LoadingSpinner';
import { LabTestsAPI } from '@/lib/api-client/lab-tests';

export default function SpeedTest() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [urlToTest, setUrlToTest] = useState();

  async function initSpeedTest(e) {
    e.preventDefault();
    if (/^(?:\S+(?::\S*)?@)?(?:\S+(?:\.[^\s.]+)+(?:\:\d{2,5})?)(?:\/[\w#!:.?+=&%@!-/])?$/.test(urlToTest)) {
      setLoading(true);
      const { testId, error } = await LabTestsAPI.initiate({ url: urlToTest });
      if(error) {
        setLoading(false);
        setErrorMsg(error)
      } else {
        router.push(`/lab-test/${testId}`);
      }
    } else {
      setErrorMsg('Invalid URL');
      return;
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="mx-auto w-52">
          <Logo className="h-12 inline-block" words={true} />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 sm:border sm:rounded-lg sm:px-10 shadow-sm text-center">
          <h2 className="text-2xl mb-6 text-gray-900">Run page speed audit</h2>
          <form className="" onSubmit={initSpeedTest}>
            <div> 
              <div className="mt-1">
                <div 
                  className={`flex w-full rounded-md border border-gray-300 px-5 py-1 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-swishjam focus:ring-swishjam`}
                >
                  <span className="flex select-none items-center pl-3 py-0.5 text-gray-500 sm:text-sm">https://</span>
                  <input 
                    className="block flex-1 border-0 bg-transparent pl-1 py-0.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    onChange={e => setUrlToTest(e.target.value)}
                    placeholder='www.swishjam.com' 
                    type='text' 
                    required 
                  />
                </div>
              </div>
            </div>
            {errorMsg && !loading && <div className="text-red-600 text-sm mt-4">{errorMsg}</div>}
            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 mt-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
              disabled={loading}
            >
              {loading ? <div className="h-6"><LoadingSpinner size={6} color='white' /></div> : 'Run page speed audit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
};