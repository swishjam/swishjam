import Image from 'next/image';
import { PlusIcon } from '@heroicons/react/20/solid'

export default function AddConnectionButton({ connection, onConnectionClick }) {
  
  return (
    <div 
      className="rounded-xl border border-gray-200 bg-white group cursor-pointer hover:bg-gray-50 duration-300 transition"
      onClick={onConnectionClick}
    >
      <div className="flex items-center gap-x-4 p-6">
        {/*<Image
          src={CONNECTION_IMAGES[connection.name]}
          alt={connection.name}
          className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
  />*/}
        <div className="text-sm font-medium leading-6 text-gray-900 group-hover:text-swishjam duration-300 transition">{connection.name}</div>
        <div className='relative ml-auto'>
          <PlusIcon className='h-6 w-6 text-gray-600 group-hover:text-swishjam duration-300 transition' /> 
        </div> 
      </div>
    </div>
  )
}