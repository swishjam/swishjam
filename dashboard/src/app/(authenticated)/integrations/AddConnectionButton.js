import Image from 'next/image';
import { PlusIcon } from '@heroicons/react/20/solid'
import { Button } from '@/components/ui/button';

export default function AddConnectionButton({ img, connection, onConnectionClick, borderImage = false }) {

  return (
    <div
      className="border-b border-gray-200 group cursor-pointer duration-300 transition offset-2"
      onClick={onConnectionClick}
    >
      <div className="flex items-center gap-x-4 py-4">
        <Image
          src={img}
          alt={connection.name}
          className={`w-12 flex-none rounded-lg bg-white object-cover ${borderImage ? 'ring-1 ring-gray-900/10' : ''}`}
        />
        <div className="text-sm font-medium leading-6 text-gray-900">{connection.name}</div>
        <div className='relative ml-auto'>
          <Button className="bg-white text-slate-900 border border-gray-200 hover:bg-white group-hover:text-swishjam duration-300 transition-all">
            <PlusIcon className='h-6 w-6 text-gray-600 group-hover:text-swishjam duration-300 transition' />
            Add {connection.name} 
          </Button> 
        </div>
      </div>
    </div>
  )
}