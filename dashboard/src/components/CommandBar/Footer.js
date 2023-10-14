import { ArrowsUpDownIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline"

export default function Footer() {
  return (
    <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 text-xs text-gray-700">
      <div className='flex flex-wrap'>
        Use
        <kbd className='mx-1 flex h-5 w-5 p-1 items-center justify-center rounded border bg-white font-semibold sm:mx-2 border-gray-400 text-gray-900'>
          <ArrowsUpDownIcon className='w-full' />
        </kbd>{' '}
        <span>to navigate between results,</span>
        <kbd className='mx-1 flex h-5 w-5 p-1 items-center justify-center rounded border bg-white font-semibold sm:mx-2 border-gray-400 text-gray-900'>
          <ArrowUturnLeftIcon className='w-full' />
        </kbd>{' '}
        <span>to select result,</span>
        <kbd className='mx-1 flex h-5 w-5 p-1 items-center justify-center rounded border bg-white sm:mx-2 border-gray-400'>
          <span className='text-gray-900' style={{ fontSize: '0.5rem' }}>esc</span>
        </kbd>{' '}
        <span>to exit.</span>
      </div>
      <kbd className='mx-1 flex h-6 w-6 py-1 px-2 items-center justify-center rounded border bg-white border-gray-400 text-gray-600'>
        <span className='text-sm'>⌘</span>
        <span className='text-xs'>K</span>
      </kbd>
    </div>
  )
}