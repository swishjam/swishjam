import { Fragment, useState } from 'react'
import { Transition, Dialog } from '@headlessui/react'
import { ProjectReportUrlsAPI } from "@/lib/api-client/project-report-urls";
import { CheckCircleIcon, ExclamationTriangleIcon, FlagIcon, XMarkIcon, LinkIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from "@/components/LoadingSpinner";

export default function UpdateReportModal({ projectReportUrl, onClose, isOpen, onUpdate }) {
  const [url, setUrl] = useState(projectReportUrl.full_url.replace('https://', ''));
  const [dataType, setDataType] = useState(projectReportUrl.dataType);
  const [cadence, setCadence] = useState(projectReportUrl.cadence);
  const [isEnabled, setIsEnabled] = useState(projectReportUrl.enabled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const submitConfiguration = async e => {
    e.preventDefault();
    setError();
    setLoading(true);
    const { record, error } = await ProjectReportUrlsAPI.update({ id: projectReportUrl.id, url: 'https://'+url, dataType, cadence, enabled: isEnabled });
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setShowSuccessMessage(true)
      onUpdate && onUpdate(record);
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                {showSuccessMessage
                  ? (
                    <div className='text-center'>
                      <CheckCircleIcon className='h-16 w-16 mx-auto text-green-500 bg-green-100 rounded-full' />
                      <h3 className="text-lg text-gray-900 text-center mt-3">Report updated.</h3>
                    </div>
                  ) : (
                    <form onSubmit={submitConfiguration}>
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-swishjam-blue sm:mx-0 sm:h-10 sm:w-10">
                          <FlagIcon className="h-6 w-6 text-swishjam-cello" aria-hidden="true" />
                        </div>
                        <div className="w-full mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            Update report configuration
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              {projectReportUrl.lab_test_cadence && `It is currently set to run every ${projectReportUrl.lab_test_cadence.split('-').join(' ')} on ${projectReportUrl.full_url}.`}
                            </p>
                          </div>
                         
                          <div className='mt-6 w-fill'>
                            <label className="block text-sm font-medium leading-6 text-gray-900">
                              Data Source 
                            </label>
                            <select
                              id="source"
                              name="source"
                              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200"
                              value={dataType}
                              onChange={e => setDataType(e.target.value)}
                              disabled 
                            >
                              <option value='rum'>Real User Data</option>
                              <option value='lab-test'>Lab Tests</option>
                              <option value='crux'>CrUX - Google data</option>
                            </select>
                          </div>
                          
                          <div className='mt-2'>
                            <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
                              Report Frequency
                            </label>
                            <select
                              disabled 
                              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200"
                              value={cadence}
                              onChange={e => setCadence(e.target.value)}
                            >
                              <option value='7-day'>Every 7 days</option>
                              <option value='14-day'>Every 14 days</option>
                            </select>
                          </div>
                          
                          <div className='mt-2'>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                              URL
                            </label>
                            <div
                              className={`flex w-full rounded-md border border-gray-300 px-1 py-1 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-swishjam focus:ring-swishjam`}
                            >
                              <span className="flex select-none items-center pl-3 py-0.5 text-gray-500 sm:text-sm">https://</span>
                              <input
                                className="block flex-1 border-0 bg-transparent pl-1 py-0.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                value={url} 
                                onChange={e => setUrl(e.target.value)}
                                onPaste={e => handlePaste(e)} 
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
                      <div className="sm:flex sm:flex-row-reverse mt-6">
                        <button
                          type="submit"
                          className={`${loading ? 'bg-gray-300' : 'bg-swishjam hover:bg-swishjam-dark'} transition duration-300 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto`}
                          disabled={loading}
                        >
                          {loading ? <div className={'mx-8'} ><LoadingSpinner color="white" /></div> : 'Update lab test'}
                        </button>
                      </div>
                    </form>
                  )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}