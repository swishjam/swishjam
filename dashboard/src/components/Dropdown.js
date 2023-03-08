'use client';

import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { CheckCircleIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

const classNames = (...classes) => classes.filter(Boolean).join(' ');

export default function Dropdown({ dropdownIcon, label, options, selected, onSelect }) {
  const [selectedOption, setSelectedOption] = useState(selected);

  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            {dropdownIcon}
            {selectedOption}
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400 mt-1" aria-hidden="true" />
          </Menu.Button>
        </div>
        <Transition as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute min-w-full right-0 z-10 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none cursor-pointer">
            <div className="py-1">
              {label && (
                <Menu.Item disabled={true}>
                  <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500 border-b cursor-default">{label}</div>
                </Menu.Item>
              )}
              {options.map(option => {
                const isSelectedOption = option === selectedOption;
                return (
                  <Menu.Item key={option}>
                    {({ active }) => (
                      <div
                        onClick={() => {
                          if (isSelectedOption) return;
                          setSelectedOption(option);
                          onSelect(option);
                        }}
                        className={classNames(
                          isSelectedOption ? 'bg-blue-100 text-gray-900' : active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          `truncate group flex items-center px-4 py-2 text-sm relative`
                        )}
                      >
                        {isSelectedOption && 
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        }
                        <span className='pl-10'>
                          {option}
                        </span>
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