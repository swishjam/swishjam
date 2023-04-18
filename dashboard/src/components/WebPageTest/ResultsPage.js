import { useEffect, useState } from 'react';
import { Disclosure } from '@headlessui/react'
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Bars3Icon, XMarkIcon, ArrowUpOnSquareIcon, BeakerIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { DateTime } from "luxon";
import Link from 'next/link';
import { CalendarIcon, ComputerDesktopIcon, MapPinIcon, BoltIcon } from '@heroicons/react/20/solid'
import Logo from '@components/Logo';
import LighthouseSection from '@components/WebPageTest/LighthouseSection'
import LoadingSpinner from '@components/LoadingSpinner';
import SuccessMsg from '@components/SuccessMsg';
import CruxData from '../CruxData/CruxData';

const navigation = [{ name: 'Real User Data' }, { name: 'Lighthouse Audit' }];

export default function ResultsPage({ webPageTestResults, auditedUrl }) {
  const testDate = DateTime.fromSeconds(webPageTestResults?.results?.data?.completed || 0).toLocaleString(DateTime.DATETIME_MED)
  const [currentTabName, setCurrentTabName] = useState('Real User Data');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [swishjamShareUrl, setSwishjamShareUrl] = useState();
  const [copyBtnTxt, setcopyBtnTxt] = useState('Copy');
  const [cruxDataUrl, setCruxDataUrl] = useState(auditedUrl);

  console.log(webPageTestResults);
  useEffect(() => {
    setSwishjamShareUrl(window.location.href)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('https://swishjam.com/api/sendSlack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'msg': 'Weekly Audit Sign Up: '+email+'\nurl: '+webPageTestResults.auditedUrl()}),
        cache: 'default'
      }) 

      setEmail(''); 
      setLoading(false); 
      setShowSuccessMessage(true) 
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <SuccessMsg show={showSuccessMessage} setShow={setShowSuccessMessage} title="Success!" msg={"You'll Receive Weekly Audits of "+webPageTestResults.auditedUrl() }/> 
      <div className="min-h-full bg-swishjam pb-16">
        <div className="bg-white pb-32">
          <Disclosure as="nav" className="bg-white pt-10 pb-4">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                  <div className="relative flex items-center justify-between ">
                    <div className="pb-4 flex items-center px-2 lg:px-0">
                      <div className="flex">
                        <Logo words={true} className="mt-3 h-10"/>
                        <h1 className="mt-2 ml-4 flex items-center text-3xl tracking-tight mb-8">
                          —
                          <BeakerIcon className="mt-1 ml-4 text-swishjam h-6 w-6 mr-2" aria-hidden="true" />
                          {currentTabName}
                        </h1>
                      </div>
                      <div className="hidden lg:ml-10 lg:block">
                        <div className="flex space-x-4">
                          {navigation.map((item) => (
                            <a
                              key={item.name}
                              onClick={() => setCurrentTabName(item.name)}
                              className={`cursor-pointer rounded-md py-2 px-3 text-sm font-medium ${item.name === currentTabName ? 'bg-indigo-700 ' : ' hover:bg-indigo-500 hover:bg-opacity-75'}`}
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
          <div className="mb-10 mx-auto max-w-7xl px-2 sm:px-4 lg:px-8 grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
            <article className="flex max-w-xl flex-col items-start">
              <h2 className="text-sm font-medium text-gray-500 pb-4">Test Information</h2>
              <div className="space-y-2 w-full">
                <Link href={webPageTestResults.results?.data?.lighthouse?.finalDisplayedUrl || '#'} target='_blank' className="flex items-center space-x-2 hover:underline hover:cursor-pointer text-swishjam hover:text-swishjam-dark transition duration-300">
                  <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-medium">{webPageTestResults.results?.data?.lighthouse?.finalDisplayedUrl}</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-900">
                    Tested on <time dateTime={testDate}> {testDate}</time>
                  </span>
                </div>
                <div className="w-full flex items-center space-x-2">
                  <div className="w-full relative mt-2 rounded-md shadow-sm">
                    <div className="text-gray-400 absolute inset-y-0 left-0 flex items-center pl-2">
                      <ArrowUpOnSquareIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      className="bg-gray-50 block w-full rounded-md border-0 py-1.5 pl-8 pr-14 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-swishjam sm:text-sm sm:leading-6"
                      placeholder={swishjamShareUrl}
                      aria-describedby="price-currency"
                      value={swishjamShareUrl}
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
              </div>
            </article>
            <article className="flex max-w-xl flex-col items-start justify-between ">
              <div className="space-y-8">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Additional Data</h2>
                  <ul role="list" className="mt-3 space-y-3">
                    <li className="flex space-x-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-gray-900">
                        {webPageTestResults?.results?.data?.from.split(' - ')[0] } 
                      </span>
                    </li>
                    <li className="flex space-x-2">
                      <ComputerDesktopIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-gray-900">
                        {webPageTestResults?.results?.data?.location.split(':')[1] } 
                      </span>
                    </li>
                    <li className="flex space-x-2">
                      <BoltIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-gray-900">
                        {`${webPageTestResults?.results?.data?.connectivity} Internet`} 
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </article>
            <article className="flex max-w-xl flex-col items-start justify-between ">
                      
          <form onSubmit={handleSubmit} className="w-full">
            <div className="min-w-0 flex-1">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-500 mb-2">
                Get Free Audits 
              </label>
              <input
                id="hero-email"
                type="email"
                className="block w-full rounded-md border border-gray-300 px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-swishjam focus:ring-swishjam"
                placeholder="Enter Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="transition block w-full rounded-md border border-transparent bg-swishjam px-5 py-3 text-base font-medium text-white shadow hover:bg-swishjam-dark focus:outline-none focus:ring-0 sm:px-10"
              >
                {loading ? <LoadingSpinner className='animate-spin mx-auto h-6 w-6 text-white'/>:'Get Free Weekly Audit'}
              </button>
            </div>
          </form>
            
            </article>
          </div>
        </div>

        <main className="-mt-32">
          <div className="border mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 bg-white rounded-lg p-4 min-h-[70vh]">
            {currentTabName === 'Lighthouse Audit' 
                ? <LighthouseSection webPageTestResults={webPageTestResults}/>
                : currentTabName === 'Real User Data' 
                  ? <CruxData 
                      url={cruxDataUrl}
                      onCruxDataUrlUpdated={url => {
                        console.log('Updating Crux Data URL to: ', url);
                        setCruxDataUrl(url);
                      }} 
                      onLighthouseAuditNavigation={() => setCurrentTabName('Lighthouse Audit')} 
                    /> : null}
          </div>
        </main>
      </div>
    </>
  )
}