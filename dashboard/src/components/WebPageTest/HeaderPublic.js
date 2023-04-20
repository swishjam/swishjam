'use client';

import { Fragment, useState, useEffect } from 'react';
import { CopyToClipboard } from "react-copy-to-clipboard";
import Link from 'next/link'
import Logo from '@components/Logo'
import LoadingSpinner from '@components/LoadingSpinner';
import { Disclosure, Transition, Dialog } from '@headlessui/react'
import { ExclamationTriangleIcon, CheckCircleIcon, EnvelopeIcon, ArrowPathRoundedSquareIcon, ArrowUpOnSquareIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function HeaderPublic({ currentNav, navigation, setNavigation, finishedUrl }) {

  const [swishjamShareUrl, setSwishjamShareUrl] = useState();
  const [copyBtnTxt, setcopyBtnTxt] = useState('Copy');
  let [open, setOpen] = useState(false)
  const [email, setEmail ] = useState('');
  const [website, setWebsite ] = useState(null);
  const [frequency, setFrequency ] = useState('Weekly');
  const [loading, setLoading ] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if(website === null) {
      setWebsite(finishedUrl)
    }
    setSwishjamShareUrl(window.location.href)
  }, [])

  const signUpForAudits = async (e) => {
    if(!email || !website) { return } 
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('https://swishjam.com/api/sendSlack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'msg': 'Weekly Audit Sign Up: '+email+'\nurl: '+website+'\nFrequency: Weekly'}),
        cache: 'default'
      }) 
      setEmail(''); 
      setWebsite(''); 
      setLoading(false); 
      setShowSuccessMessage(true) 
    } catch (e) {
      console.log(e);
      setShowError(true) 
    }
  }

  return (
    <>
      <Disclosure as="nav" className="border-b border-gray-200 bg-white">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <Link href="/">
                      <Logo className="h-8" />
                    </Link>
                  </div>
                  <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <div
                        key={item.name}
                        onClick={() => setNavigation(item.name)}
                        className={classNames(
                          currentNav == item.name
                            ? 'border-swishjam text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'cursor-pointer inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">

                  {/* Empty Currently */}
                  {/* Right Side of the Large View For the Report */}
                  <div className='flex'>
                    <div className="w-96 flex items-center space-x-2">
                      <div className="w-full relative mt-2 rounded-md shadow-sm">
                        <div className="text-gray-400 absolute inset-y-0 left-0 flex items-center pl-2">
                          <ArrowUpOnSquareIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <input
                          type="text"
                          className="bg-gray-50 block w-full rounded-md border-0 py-1.5 pl-8 pr-14 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-swishjam sm:text-sm sm:leading-6"
                          placeholder={swishjamShareUrl}
                          aria-describedby="price-currency"
                          defaultValue={swishjamShareUrl}
                          readOnly
                        />
                        <div className="text-gray-500 transition duration-300 hover:cursor-pointer hover:text-swishjam absolute inset-y-0 right-0 flex items-center pr-3">
                          <CopyToClipboard
                            text={swishjamShareUrl}
                            className="sm:text-sm"
                          >
                            <div onClick={() => { setcopyBtnTxt('✓'); setTimeout(() => setcopyBtnTxt('Copy'), 2000) }}>
                              {copyBtnTxt}
                            </div>
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => setOpen(true)} 
                        type="button"
                        className="ml-6 mt-2 rounded-md bg-swishjam px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-swishjam-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swishjam transition duration-300"
                      >
                        Get Free Weekly Audits By Email 
                      </button>

                    </div>
                  </div>

                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-swishjam focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pt-2 pb-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'border-swishjam bg-swishjam text-swishjam-dark'
                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    {/* User Profile Here */}
                  </div>
                  <div className="ml-3">
                    {/*user data was here*/}
                  </div>
                </div>
                {/*<div className="mt-3 space-y-1">
              </div>*/}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-swishjam-blue sm:mx-0 sm:h-10 sm:w-10">
                      <ArrowPathRoundedSquareIcon className="h-6 w-6 text-swishjam-cello" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Free Recurring Audits In Your Inbox
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          <span className='font-semibold'>How it works:</span><br />
                          We'll crawl your site periodically and send you a snapshot of both your real user data and the crawled performance data.
                        </p>
                      </div>
                      <div className='mt-6'>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                          Email
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='mt-2'>
                        <label htmlFor="company-website" className="block text-sm font-medium leading-6 text-gray-900">
                          Website To Monitor
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="company-website"
                            id="company-website"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="example.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)} 
                          />
                        </div>
                      </div>
                      <div className='mt-2'>
                        <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
                          Frequency (More options soon)
                        </label>
                        <select
                          id="location"
                          name="location"
                          disabled 
                          className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200"
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)} 
                        >
                          <option>Weekly</option>
                          <option>Every Other Week</option>
                          <option>Monthly</option>
                        </select>
                      </div>


                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="transition duration-300 inline-flex w-full justify-center rounded-md bg-swishjam px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-swishjam-dark sm:ml-3 sm:w-auto"
                      onClick={(e) => signUpForAudits(e)}
                    >
                      {loading ? <div className={'mx-8'} ><LoadingSpinner color="white" /></div>:'Sign Up'}
                    </button>
                  </div>
                  {showSuccessMessage &&
                  <div className="rounded-md bg-green-50 p-4 mt-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">Successfully uploaded</p>
                      </div>
                    </div>
                  </div>}
                  {showError && 
                  <div className="mt-6 border-l-4 border-yellow-400 bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Sorry there was a problem with registering, please email founders@swishjam.com or reload the page and try again 
                        </p>
                      </div>
                    </div>
                  </div>}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

    </>
  );
}
