import {  useState } from 'react';
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, CursorArrowRippleIcon, BeakerIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { DateTime } from "luxon";
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, BoltIcon } from '@heroicons/react/20/solid'
import LighthouseSection from '@components/WebPageTest/LighthouseSection'
import CruxData from '../CruxData/CruxData';
import HeaderPublic from '@/components/WebPageTest/HeaderPublic';

const navigation = [{ name: 'Real User Data' }, { name: 'Lighthouse Audit' }];

export default function ResultsPage({ webPageTestResults, auditedUrl }) {
  const [currentTabName, setCurrentTabName] = useState('Real User Data');

  return (
    <>
      <HeaderPublic finishedUrl={auditedUrl} currentNav={currentTabName} navigation={navigation} setNavigation={(name) => setCurrentTabName(name)}/> 
      <div className="min-h-full bg-swishjam pb-16">
        <div className="bg-white pb-32">
          <Disclosure as="nav" className="bg-white pt-10 pb-4">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                  <div className="relative flex items-center justify-between ">
                    <div className="pb-4 flex items-center px-2 lg:px-0">
                      <div className="flex">
                        <h1 className="flex items-center text-3xl tracking-tight mb-8">
                          { currentTabName == 'Real User Data' ?
                            <CursorArrowRippleIcon className="mt-1 text-swishjam h-6 w-6 mr-2" aria-hidden="true" />:  
                            <BeakerIcon className="mt-1 text-swishjam h-6 w-6 mr-2" aria-hidden="true" />}
                          {currentTabName}
                          {webPageTestResults && (
                            <>
                            <span className='ml-4'>|</span> 
                            <Link
                              href={webPageTestResults.results.data.lighthouse.finalDisplayedUrl || '#'}
                              target='_blank'
                              className="mt-2 ml-4 flex font-base items-center space-x-2 hover:underline hover:cursor-pointer text-swishjam hover:text-swishjam-dark transition duration-300"
                            >
                              <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="text-sm font-medium">{webPageTestResults.results.data.lighthouse.finalDisplayedUrl}</span>
                            </Link></>
                          )}
                        </h1>
                      </div>
                      <div className="hidden lg:ml-10 lg:block">
                        <div className="flex space-x-4">
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:hidden">
                      {/* Mobile menu button */}
                      {navigation.length > 0 && <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover: focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>}
                    </div>
                  </div>
                </div>

                <Disclosure.Panel className="lg:hidden">
                  <div className="space-y-1 px-2 pb-3 pt-2">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        onClick={() => setCurrentTabName(item.name)}
                        className={`block rounded-md py-2 px-3 text-base font-medium ${currentTabName === item.name ? 'bg-indigo-700 ' : ' hover:bg-indigo-500 hover:bg-opacity-75'}`}
                        aria-current={currentTabName === item.name ? 'page' : undefined}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
          </div> 
        </div>

        <main className="-mt-32">
          <div className="px-2 sm:px-4 lg:px-8 mx-auto max-w-7xl min-h-[70vh]">
            <div className='border pb-12 bg-white rounded-lg overflow-hidden'>
              {currentTabName === 'Lighthouse Audit' 
                ? <LighthouseSection webPageTestResults={webPageTestResults}/>
                : currentTabName === 'Real User Data' 
                  ? <CruxData url={auditedUrl} onLighthouseAuditNavigation={() => setCurrentTabName('Lighthouse Audit')} /> 
                  : null}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
          