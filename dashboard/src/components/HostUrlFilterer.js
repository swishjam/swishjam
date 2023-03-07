'use client';
import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { FunnelIcon } from '@heroicons/react/24/outline'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function HostUrlFilterer({ options, selectedHost, onHostSelected }) {
  const [selectedOption, setSelectedOption] = useState(selectedHost);

  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            {selectedOption}
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400 mt-1" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none cursor-pointer">
            <div className="py-1">
              <Menu.Item disabled={true}>
                <div className="px-4 py-2 text-sm text-gray-500 border-b cursor-default">Filter by URL host</div>
              </Menu.Item>
              {options.map(option => {
                const isSelectedOption = option === selectedOption;
                return (
                  <Menu.Item key={option}>
                    {({ active }) => (
                      <div
                        onClick={() => {
                          if(isSelectedOption) return;
                          setSelectedOption(option)
                          onHostSelected(option)
                        }}
                        className={classNames(
                          isSelectedOption ? 'bg-blue-100 text-gray-900' : active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          `truncate group flex items-center px-4 py-2 text-sm`
                        )}
                      >
                        {option}
                      </div>
                    )}
                  </Menu.Item>
                )
                })}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}