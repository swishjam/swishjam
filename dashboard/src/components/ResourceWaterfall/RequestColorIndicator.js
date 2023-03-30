import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function RequestColorIndicator({ title, bgColor, dashed = false }) {
  return (
    <div className='w-1/6 p-2 text-center'>
      <span className='block text-sm cursor-default text-gray-700'>
        {title}
        {/* <InformationCircleIcon className='h-4 w-4 inline-block ml-1' /> */}
      </span>
      {dashed ? <div className={`w-full border-dashed border-4 ${bgColor}`} /> :
                  <div className={`w-full h-4 rounded ${bgColor}`} />}
    </div>
  )
}