'use client';

import { useState } from 'react';
import AuthenticatedView from '@/components/AuthenticatedView';
import CwvDashboardView from '@/components/WebVitals/CWVDashboardView';
import CruxDataView from '@/components/CruxData/View';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
import PathUrlFilterer from '@/components/Filters/PathUrlFilterer';
import { SwishjamMemory } from '@/lib/swishjam-memory';
import { Switch } from '@headlessui/react'
import Logo from '@/components/Logo';
import Image from 'next/image';
import { usePopperTooltip } from 'react-popper-tooltip';

export default function Home() {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  const [userHasToggledDataSource, setUserHasToggledDataSource] = useState(false);
  const [dataSource, setDataSource] = useState(SwishjamMemory.get('cwvDataSource') || 'Swishjam');
  const [urlHostToFilterOn, setUrlHostToFilterOn] = useState();
  const [urlPathToFilterOn, setUrlPathToFilterOn] = useState();
  const [hasNoData, setHasNoData] = useState();

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='grid grid-cols-2 mt-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium text-gray-700 mb-0">Core Web Vitals</h1>
            <h2 className='text-sm text-gray-400'>Based on real user data collected by {dataSource === 'Swishjam' ? 'Swishjam' : 'Google Chrome'}</h2>
          </div>

          <div className="w-full flex items-center justify-end">
            <div className='scale-125 inline-flex items-center mr-4 cursor-pointer' ref={setTriggerRef}>
              <Switch
                checked={dataSource === 'Swishjam'}
                onChange={() => {
                  setHasNoData(false);
                  setUserHasToggledDataSource(true);
                  setUrlHostToFilterOn();
                  setUrlPathToFilterOn();
                  const oppositeDataSource = dataSource === 'Swishjam' ? 'Google' : 'Swishjam';
                  setDataSource(oppositeDataSource)
                  SwishjamMemory.set('cwvDataSource', oppositeDataSource);
                }}
                className={`${dataSource === 'Swishjam' ? 'bg-swishjam' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
              >
                <span className={`${dataSource === 'Swishjam' ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}>
                  <span className={`${dataSource === 'Swishjam' ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}>
                    <Image src='/google-logo.webp' width={12} height={12} alt='Google logo' />
                  </span>
                  <span className={`${dataSource === 'Swishjam' ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}>
                    <Logo className="h-4 w-4 ml-1" />
                  </span>
                </span>
              </Switch>
            </div>
            {visible && (
              <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                <div {...getArrowProps({ className: 'tooltip-arrow' })} />
                <div className='p-2 text-xs text-gray-700'>
                  Change the data source for this view to {dataSource === 'Swishjam' ? 'Chrome Real User Experience data' : 'Swishjam data'}.
                </div>
              </div>
            )}
            <div className={hasNoData ? 'hidden' : 'inline-block'}>
              <HostUrlFilterer
                urlHostAPI={dataSource === 'Swishjam' ? 'rum' : 'lab'}
                onHostSelected={setUrlHostToFilterOn}
                disabled={hasNoData}
                onNoHostsFound={() => {
                  if (userHasToggledDataSource) {
                    setHasNoData(true)
                  } else if (dataSource === 'Swishjam') {
                    setUrlHostToFilterOn();
                    setUrlPathToFilterOn();
                    setDataSource('Google')
                    SwishjamMemory.set('cwvDataSource', 'Google');
                  }
                }}
              />
            </div>
            <div className={`inline-block ml-2 ${hasNoData ? 'hidden' : ''}`}>
              <PathUrlFilterer
                urlHost={urlHostToFilterOn}
                includeAllPathsSelection={dataSource === 'Swishjam'}
                urlPathAPI={dataSource === 'Swishjam' ? 'rum' : 'lab'}
                onPathSelected={setUrlPathToFilterOn}
                disabled={hasNoData}
              />
            </div>
          </div>
        </div>
        {dataSource === 'Swishjam' 
          ? <CwvDashboardView urlHost={urlHostToFilterOn} urlPath={urlPathToFilterOn} hasNoData={hasNoData} /> 
          : <CruxDataView url={urlHostToFilterOn && urlPathToFilterOn && `https://${urlHostToFilterOn}${urlPathToFilterOn}`} hasNoData={hasNoData} />}
      </main>
    </AuthenticatedView>
  );
}
