'use client';

import Image from 'next/image';
import Link from 'next/link';
import AuthenticatedView from '@/components/AuthenticatedView';
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { 
  EllipsisHorizontalIcon
} from '@heroicons/react/20/solid'
import { 
  PlusCircleIcon,
} from '@heroicons/react/24/outline'
import StripeImg from '@public/stripe-logo.jpeg'


const statuses = {
  Paid: 'text-green-700 bg-green-50 ring-green-600/20',
  Withdraw: 'text-gray-600 bg-gray-50 ring-gray-500/10',
  Overdue: 'text-red-700 bg-red-50 ring-red-600/10',
}

const availableConnections = [
  {
    id: 1,
    name: 'Stripe',
    image: StripeImg,
    oAuthLink: "https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_ONSwwqiCfDZHQzg1hURYH5pfTVj1PrAe&scope=read_write"
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const AddConnectionButton = ({ connection }) => (
  <Link
    href={connection.oAuthLink} 
    key={connection.id} className="rounded-xl border border-gray-200 bg-white group cursor-pointer hover:bg-gray-50 duration-300 transition">
    <div className="flex items-center gap-x-4 p-6">
      <Image
        src={connection.image}
        alt={connection.name}
        className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
      />
      <div className="text-sm font-medium leading-6 text-gray-900 group-hover:text-swishjam duration-300 transition">{connection.name}</div>
      <div className='relative ml-auto'>
        <PlusCircleIcon className='h-6 w-6 text-gray-900 group-hover:text-swishjam duration-300 transition' /> 
      </div> 
    </div>
  </Link>
)

const ConnectionDisplay = ({ connection }) => (
  <li key={connection.id} className="rounded-xl border border-gray-200 bg-white">
    <div className="flex items-center gap-x-4 p-6">
      <Image
        src={connection.image}
        alt={connection.name}
        className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
      />
      <div className="text-sm font-medium leading-6 text-gray-900">{connection.name}</div>
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
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? 'bg-gray-50' : '',
                    'block px-3 py-1 text-sm leading-6 text-gray-900'
                  )}
                >
                  Remove<span className="sr-only">, {connection.name}</span>
                </a>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  </li>
)

export default function Connections() {

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='grid grid-cols-2 mt-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium text-gray-700 mb-0">Connections</h1>
          </div>
          <div className="w-full flex items-center justify-end">
          </div>
        </div>
        <div className='pt-12'>
          <h5 className='py-2'>Connected Apps</h5>
          <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
            {availableConnections.map((connection) => (
              <ConnectionDisplay key={connection.id} connection={connection} />
            ))}
          </ul>

          <h5 className='pt-8 pb-2'>Available Connections</h5>
          <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
            {availableConnections.map((connection) => (
              <AddConnectionButton key={connection.id} connection={connection} />
            ))}
          </ul>

        </div>
      </main>
    </AuthenticatedView>
  );
}
