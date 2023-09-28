import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid'
import { PlusCircleIcon, PauseCircleIcon, TrashIcon, PlayCircleIcon } from '@heroicons/react/24/outline'

export default function ExistingConnectionItem({ connection, enabled, onRemoveClick, onDisableClick, onEnableClick }) {

  return (
    <li key={connection.id} className={`rounded-xl border border-gray-200 ${enabled ? 'bg-white' : 'bg-gray-200'}`}>
      <div className="flex items-center gap-x-4 p-6">
        <Image
          src={CONNECTION_IMAGES[connection.name]}
          alt={connection.name}
          className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
        />
        <div className="text-sm font-medium leading-6 text-gray-900">
          {connection.name}
          {!enabled && (
            <span className="ml-2 inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-800 ring-1 ring-inset ring-orange-600/20">
              Disabled
            </span>
          )}
        </div>
        <Menu as="div" className="relative ml-auto">
          <Menu.Button className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
            <span className="sr-only">Open options</span>
            <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
              <Menu.Item>
                <>
                  {enabled
                    ? (
                      <a
                        href="#"
                        onClick={() => onDisableClick(connection.id)}
                        className='block px-3 py-2 text-sm leading-6 text-gray-900 flex items-center justify-around hover:bg-orange-50 hover:text-orange-500'
                      >
                        Disable<span className="sr-only">, {connection.name}</span>
                        <PauseCircleIcon className='h-6 w-6 inline-block' />
                      </a>
                    ) : (
                      <a
                        href="#"
                        onClick={() => onEnableClick(connection.id)}
                        className='block px-3 py-2 text-sm leading-6 text-gray-900 flex items-center justify-around hover:bg-green-50 hover:text-green-500'
                      >
                        Enable<span className="sr-only">, {connection.name}</span>
                        <PlayCircleIcon className='h-6 w-6 inline-block' />
                      </a>
                    )
                  }
                  <a
                    href="#"
                    onClick={() => onRemoveClick(connection.id)}
                    className='block px-3 py-2 text-sm leading-6 text-gray-900 flex items-center justify-around hover:bg-red-50 hover:text-red-500'
                  >
                    Remove<span className="sr-only">, {connection.name}</span>
                    <TrashIcon className='h-6 w-6 inline-block' />
                  </a>
                </>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </li>
  )
}