import { useEffect, useState } from 'react';
import Modal from '@/components/utils/Modal';
import { API } from '@/lib/api-client/base';
import Link from 'next/link';
import { BeakerIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function OneOffLabTestModal({ onClose, isDisplayed = false, onLabTestCreated }) {
  const [isOpened, setIsOpened] = useState(isDisplayed);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [url, setUrl] = useState('');
  const [oneOffLabTestId, setOneOffLabTestId] = useState();

  const onSubmit = async e => {
    e.preventDefault();
    setError();
    setIsSubmitting(true);
    try {
      const { testId, error } = await API.get('/api/lab-tests/run', { url, label: 'One-off' });
      if (error) {
        setError(error);
      } else {
        setOneOffLabTestId(testId);
      }
      setUrl('');
      setIsSubmitting(false);
    } catch (err) {
      setError('Unable to initiate lab test, please try again later.');
      setIsSubmitting(false);
    }
  }

  useEffect(() => setIsOpened(isDisplayed));

  return (
    <Modal 
      onClose={() => {
        setIsOpened(false);
        setOneOffLabTestId();
        setUrl('');
        setError();
        onClose && onClose();
      }} 
      isOpen={isOpened}
    >
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {oneOffLabTestId
          ? (
            <div className='text-center'>
              <CheckCircleIcon className='h-16 w-16 mx-auto text-green-500 bg-green-100 rounded-full' />
              <h3 className="text-lg text-gray-900 text-center mt-3">Lab test initiated.</h3>
              <Link
                className="transition mt-3 duration-300 inline-flex w-full justify-center rounded-md bg-swishjam px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-swishjam-dark sm:w-auto"
                href={`/lab-tests/results/${oneOffLabTestId}/overview`}
              >
                View results
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className='w-full px-2'>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-swishjam-blue sm:mx-0 sm:h-10 sm:w-10">
                  <BeakerIcon className="h-6 w-6 text-swishjam-cello" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Run a one-off lab test
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Or setup <Link href='/lab-tests/manage' className='underline text-blue-500'>scheduled lab tests</Link> to run periodically.
                    </p>
                  </div>
                  <div className='mt-6'>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                      URL
                    </label>
                    <div className='flex w-full rounded-md border border-gray-300 px-1 py-1 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-swishjam focus:ring-swishjam'>
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
                  {error && (
                    <div className="my-2 border-l-4 border-red-400 bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="sm:flex sm:flex-row-reverse mt-3">
                <button
                  type="submit"
                  className={`${isSubmitting ? 'bg-gray-300' : 'bg-swishjam hover:bg-swishjam-dark'} transition duration-300 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <div className='mx-8'><LoadingSpinner color="white" /></div> : 'Run lab test'}
                </button>
              </div>
            </form>
          )
        }
      </div>
    </Modal>
  )
}