import { XMarkIcon } from '@heroicons/react/20/solid'

export default function Banner({ message, bgColor='bg-indigo-600', textColor='white', dismissable=true, onDismiss, icon }) {
  return (
    <div className={`flex items-center gap-x-6 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 ${bgColor} -mr-8`}>
      {icon} 
      <p className={`text-sm leading-6 text-${textColor}`}>
        {message}
      </p>
      {dismissable && (
        <div className="flex flex-1 justify-end">
          <button type="button" className="-m-3 p-3 focus-visible:outline-offset-[-4px]" onClick={onDismiss}>
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
