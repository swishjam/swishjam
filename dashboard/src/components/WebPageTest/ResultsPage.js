import { useState } from 'react';
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import Logo from '@components/Logo';
import LighthouseSection from './LighthouseSection'
import FilmstripSection from './FilmstripSection';

const navigation = [{ name: 'Lighthouse Audit' }, { name: 'Performance Metrics' }];

export default function ResultsPage({ webPageTestResults }) {
  const [currentTabName, setCurrentTabName] = useState('Lighthouse Audit');

  return (
    <>
      <div className="min-h-full">
        <div className="bg-swishjam pb-32">
          <Disclosure as="nav" className="bg-swishjam">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                  <div className="relative flex h-16 items-center justify-between lg:border-b lg:border-indigo-400 lg:border-opacity-25">
                    <div className="flex items-center px-2 lg:px-0">
                      <div className="w-12 h-12">
                        <Logo words={false} />
                      </div>
                      <div className="hidden lg:ml-10 lg:block">
                        <div className="flex space-x-4">
                          {navigation.map((item) => (
                            <a
                              key={item.name}
                              onClick={() => setCurrentTabName(item.name)}
                              className={`cursor-pointer rounded-md py-2 px-3 text-sm font-medium ${item.name === currentTabName ? 'bg-indigo-700 text-white' : 'text-white hover:bg-indigo-500 hover:bg-opacity-75'}`}
                              aria-current={item.current ? 'page' : undefined}
                            >
                              {item.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>
                    </div>
                    <div className="hidden lg:ml-4 lg:block">
                      <div className="flex items-center">
                        <button className='cursor-pointer flex items-center rounded-md py-2 px-3 text-sm font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75'>
                          <EnvelopeIcon className='h-5 w-5 inline-block mr-1' /> Receive weekly audits to your inbox?
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel className="lg:hidden">
                  <div className="space-y-1 px-2 pb-3 pt-2">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        onClick={() => setCurrentTabName(item.name)}
                        className={`block rounded-md py-2 px-3 text-base font-medium ${currentTabName === item.name ? 'bg-indigo-700 text-white' : 'text-white hover:bg-indigo-500 hover:bg-opacity-75'}`}
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
          <header className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">{currentTabName}</h1>
              <h2 className="text-lg tracking-tight text-white">{webPageTestResults.auditDate()}</h2>
              <h2 className="text-lg tracking-tight text-white w-fit">{`${new URL(webPageTestResults.auditedUrl()).hostname}${new URL(webPageTestResults.auditedUrl()).pathname}`}</h2>
            </div>
          </header>
        </div>

        <main className="-mt-32">
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 bg-white rounded-lg p-4 min-h-[70vh]">
            {currentTabName === 'Lighthouse Audit' 
                    ? <LighthouseSection webPageTestResults={webPageTestResults}/>
                    : <FilmstripSection filmstrip={webPageTestResults.filmstrip()} />}
          </div>
        </main>
      </div>
    </>
  )
}