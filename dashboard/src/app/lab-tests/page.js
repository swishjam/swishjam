'use client';

import AuthenticatedView from '@/components/AuthenticatedView';
import { useAuth } from '@components/AuthProvider';
import { useState } from 'react';
import Link from 'next/link';
import { LabTestsAPI } from '@/lib/api-client/lab-tests';
import PerformanceMetricCard from '@/components/LabTests/PerformanceMetricCard';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
import PathUrlFilterer from '@/components/Filters/PathUrlFilterer';
import { Cog6ToothIcon, BeakerIcon, PlusIcon } from '@heroicons/react/24/outline';
import LabTestTab from '@/components/LabTests/LabTestTab';
import LabTestResultsTable from '@/components/LabTests/ResultsTable';
import { SwishjamMemory } from '@/lib/swishjam-memory';
import Modal from '@/components/utils/Modal';
import { API } from '@/lib/api-client/base';

const GOOD_NEEDS_IMPROVEMENT_POOR_TIERS = {
  largest_contentful_paint: {
    good: 2_500,
    needsImprovement: 4_000
  },
  total_blocking_time: {
    good: 300,
    needsImprovement: 600
  },
  max_first_input_delay: {
    good: 100,
    needsImprovement: 300
  },
  cumulative_layout_shift: {
    good: 0.1,
    needsImprovement: 0.25
  },
  speed_index: {
    good: 1_000,
    needsImprovement: 3_000
  },
  time_to_first_byte: {
    good: 800,
    needsImprovement: 1_800
  }
}

const METRIC_DICT = {
  largest_contentful_paint: {
    title: 'Largest Contentful Paint',
    description: 'description placeholder'
  },
  total_blocking_time: {
    title: 'Total Blocking Time',
    description: 'description placeholder'
  },
  max_first_input_delay: {
    title: 'First Input Delay',
    description: 'description placeholder'
  },
  cumulative_layout_shift: {
    title: 'Cumulative Layout Shift',
    description: 'description placeholder'
  },
  speed_index: {
    title: 'Speed Index',
    description: 'description placeholder'
  },
  time_to_first_byte: {
    title: 'Time to First Byte',
    description: 'description placeholder'
  }
}

export default function LabTests() {
  const { currentProject } = useAuth();
  const [hasNoData, setHasNoData] = useState(false);
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [labTests, setLabTests] = useState();
  const [selectedMetric, setSelectedMetric] = useState(SwishjamMemory.get('labTestsSelectedMetric') ||  'largest_contentful_paint');
  const [displayOneOffLabTestModal, setDisplayOneOffLabTestModal] = useState(false);

  const getLabDataForUrlHostAndPath = (urlHost, urlPath) => {
    setLabTests();
    const params = { urlHost, urlPath };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    LabTestsAPI.getAll(params).then(setLabTests);
  }

  const labTestsMostRecentLast = labTests ? labTests.sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at)) : undefined;
  const labTestsMostRecentFirst = labTestsMostRecentLast ? labTestsMostRecentLast.slice().reverse() : undefined;
  
  return (
    <AuthenticatedView>
      {displayOneOffLabTestModal && <OneOffLabTestModal onClose={() => setDisplayOneOffLabTestModal(false)} />}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Lab tests for {currentProject?.name}</h1>
          </div>
          <div className={`w-full flex items-center justify-end ${hasNoData ? 'hidden' : ''}`}>
            <HostUrlFilterer 
              urlHostAPI='lab'
              onNoHostsFound={() => setHasNoData(true)}
              onHostsFetched={() => {
                setHasNoData(false);
                setLabTests();
                setHostUrlToFilterOn();
              }}
              onHostSelected={hostUrl => {
                setHasNoData(false)
                setLabTests();
                setHostUrlToFilterOn(hostUrl);
              }} 
            />
            <div className='inline-block ml-2'>
              <PathUrlFilterer 
                urlHost={hostUrlToFilterOn}
                urlPathAPI='lab'
                includeAllPathsSelection={true}
                onPathSelected={urlPath => getLabDataForUrlHostAndPath(hostUrlToFilterOn, urlPath)} 
              />
            </div>
            <div className='inline-block ml-2'>
              <button
                onClick={() => setDisplayOneOffLabTestModal(true)}
                className="ml-2 p-1 rounded-md bg-swishjam text-sm font-semibold text-white shadow-sm hover:bg-swishjam-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swishjam transition duration-300"
              >
                <PlusIcon className='h-6 w-6' />
              </button>
            </div>
            <div className='inline-block ml-2'>
              <Link href='/lab-tests/manage'>
                <Cog6ToothIcon className='h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer' />
              </Link>
            </div>
          </div>
        </div>
        {hasNoData 
          ? (
            <>
              <a
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                href='/lab-tests/manage'
              >
                <BeakerIcon className='mx-auto h-12 w-12 text-gray-700' />
                <span className="mt-2 block text-md font-semibold text-gray-700">No lab tests have run yet.</span>
                <span className="mt-2 block text-sm font-semibold text-gray-700">Manage your lab test configuration.</span>
              </a>
            </>
          ) : (
            <>
              <div className='rounded-md border border-gray-200 overflow-hidden'>
                <div className="grid grid-cols-1 md:grid-cols-6 md:divide-x">
                  {[
                    { name: 'Largest Contentful Paint', metric: 'largest_contentful_paint' },
                    { name: 'Cumulative Layout Shift', metric: 'cumulative_layout_shift' },
                    { name: 'First Input Delay', metric: 'max_first_input_delay' },
                    { name: 'Total Blocking Time', metric: 'total_blocking_time' },
                    { name: 'Time to First Byte', metric: 'time_to_first_byte' },
                    { name: 'Speed Index', metric: 'speed_index' },
                  ].map(({ name, metric }, i) => {
                    const successfulLabTestsMostRecentLast = labTestsMostRecentLast ? labTestsMostRecentLast.filter(labTest => parseInt(labTest[metric]) > -1) : undefined;
                    return <LabTestTab 
                      title={name} 
                      isActive={metric === selectedMetric}
                      currentValue={successfulLabTestsMostRecentLast && (successfulLabTestsMostRecentLast[successfulLabTestsMostRecentLast.length - 1]?.[metric] || null)}
                      previousValue={successfulLabTestsMostRecentLast && (successfulLabTestsMostRecentLast[successfulLabTestsMostRecentLast.length - 2]?.[metric] || null)}
                      goodNeedsImprovementPoorTiers={GOOD_NEEDS_IMPROVEMENT_POOR_TIERS[metric]}
                      isFirstTab={i === 0}
                      metric={metric}
                      key={i} 
                      onClick={() => {
                        setSelectedMetric(metric);
                        SwishjamMemory.set('labTestsSelectedMetric', metric);
                      }} 
                    />
                  })}
                </div>
                <PerformanceMetricCard 
                  labTests={labTestsMostRecentLast} 
                  metric={selectedMetric} 
                  title={METRIC_DICT[selectedMetric].title}
                  description={METRIC_DICT[selectedMetric].description} 
                />
                <div className='mt-4'>
                  <LabTestResultsTable 
                    labTests={labTestsMostRecentFirst} 
                    metricToDisplay={selectedMetric} 
                    goodNeedsImprovementPoorTiers={GOOD_NEEDS_IMPROVEMENT_POOR_TIERS[selectedMetric]}
                  />
                </div>
              </div>
            </>
          )}
      </main>
    </AuthenticatedView>
  );
}

const OneOffLabTestModal = ({ onClose, onLabTestCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [url, setUrl] = useState('');
  const [oneOffLabTestId, setOneOffLabTestId] = useState();

  const onSubmit = async e => {
    e.preventDefault();
    setError();
    try {
      const { testId, error } = await API.get('/api/lab-tests/run', { url, label: 'One-off' });
      if (error) {
        setError(error);
      } else {
        setOneOffLabTestId(testId);
      }
      setUrl('');
      setIsSubmitting(false);
    } catch(err) {
      setError('Unable to initiate lab test, please try again later.');
      setIsSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} isOpen={true}>
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