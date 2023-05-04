import Image from "next/image"
import { 
  CalendarDaysIcon,
  WindowIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAmericasIcon,
  RectangleGroupIcon, 
  WifiIcon,
  BeakerIcon, 
  Bars3CenterLeftIcon, 
  ArrowLeftIcon 
} from '@heroicons/react/20/solid'

export default function DetailsHeader({ labTestId, webPageTestResults, selectedNavItem }) {
  return (
    <div className='py-8 px-4'>
      <div className='grid grid-cols-2 h-44 flex items-center'>
        <div className='flex items-center'>
          <div>
            {webPageTestResults 
              ? (
                <>
                  <a href='/lab-tests' className='block text-sm text-swishjam flex items-center hover:underline mb-4'>
                    <ArrowLeftIcon className='inline-block mr-1 h-4 w-4' /> All lab tests
                  </a>
                  <h1 className="text-2xl font-medium">{webPageTestResults.auditedUrl()} audit</h1>
                  <div className='flex items-center justify-between mt-2'>
                    <h4 className='text-sm text-gray-500 w-fit inline-block flex items-center mr-5'>
                      <CalendarDaysIcon className='h-4 w-4 inline-block mr-1' /> {webPageTestResults.auditDate()}
                    </h4>
                    <h4 className='text-sm text-gray-500 w-fit inline-block flex items-center mr-5'>
                      <GlobeAmericasIcon className='h-4 w-4 inline-block mr-1' /> {webPageTestResults.parsedLocation()}
                    </h4>
                    <h4 className='text-sm text-gray-500 w-fit inline-block flex items-center mr-5'>
                      {webPageTestResults.isMobile() ? <DevicePhoneMobileIcon className='h-4 w-4 inline-block mr-1' /> : <ComputerDesktopIcon className='h-4 w-4 inline-block mr-1' />}
                      {webPageTestResults.isMobile() ? 'Mobile' : 'Desktop'}
                    </h4>
                    <h4 className='text-sm text-gray-500 w-fit inline-block flex items-center mr-5'>
                      <WindowIcon className='h-4 w-4 inline-block mr-1' /> {webPageTestResults.browser()}
                    </h4>
                    <h4 className='text-sm text-gray-500 w-fit inline-block flex items-center mr-5'>
                      <WifiIcon className='h-4 w-4 inline-block mr-1' /> {webPageTestResults.connection()}
                    </h4>
                  </div>
                </>
              ) : (
                <>
                  <div className='h-8 w-64 bg-gray-200 animate-pulse rounded' />
                  <div className='h-6 w-48 mt-2 bg-gray-200 animate-pulse rounded' />
                </>
              )}
          </div>
        </div>
        <div className='flex items-center justify-center'>
          {webPageTestResults  
            ? <Image src={webPageTestResults.screenshotUrl()} width={300} height={200} className='border border-gray-200 rounded' />
            : <div className='animate-pulse bg-gray-200 rounded' style={{ width: '300px', height: '200px' }} />}
        </div>
      </div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { name: 'Overview', href: `/lab-tests/results/${labTestId}/overview`, icon: RectangleGroupIcon },
            { name: 'Lighthouse Audit', href: `/lab-tests/results/${labTestId}/lighthouse`, icon: BeakerIcon },
            { name: 'Resource Waterfall', href: `/lab-tests/results/${labTestId}/waterfall`, icon: Bars3CenterLeftIcon },
          ].map(tab => (
            <a
              key={tab.name}
              href={tab.href}
              className={`group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium ${tab.name === selectedNavItem ? 'border-swishjam text-swishjam' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            >
              <tab.icon
                className={`-ml-0.5 mr-2 h-5 w-5 ${tab.name === selectedNavItem ? 'text-swishjam' : 'text-gray-400 group-hover:text-gray-500'}`}
                aria-hidden="true"
              />
              <span>{tab.name}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}