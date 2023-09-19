'use client';

import { Fragment, useState } from 'react';
import { API } from '@/lib/api-client/base';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const publishingOptions = [
  { title: 'Product Analytics', type: 'AnalyticsFamilyConfigurations::Product', description: 'Product Analytics data is data collected from your application to help understand product usage trends.' },
  { title: 'Marketing Analytics', type: 'AnalyticsFamilyConfigurations::Marketing', description: 'Marketing Analytics data is for your marketing and landing pages, to help you determine traffic to your marketing site.' },
]

const TypeDropdown = ({ onSelect, defaultOption }) => {
  const [selected, setSelected] = useState(defaultOption)

  return (
    <Listbox 
      value={selected} 
      onChange={option => {
        setSelected(option);
        onSelect(option);
      }}
    >
      {({ open }) => (
        <>
          <Listbox.Label className="sr-only">Change published status</Listbox.Label>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{selected.title}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {publishingOptions.map((option) => (
                  <Listbox.Option
                    key={option.title}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'cursor-pointer select-none p-4 text-sm'
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <p className={selected ? 'font-semibold' : 'font-normal'}>{option.title}</p>
                          {selected ? (
                            <span className={active ? 'text-white' : 'text-indigo-600'}>
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </div>
                        <p className={classNames(active ? 'text-indigo-200' : 'text-gray-500', 'mt-2')}>
                          {option.description}
                        </p>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}

export default function NewAnalyticsFamilyConfigurationForm({ onNewAnalyticsFamilyConfiguration, isSubmittable = true }) {
  const [newAnalyticsFamilyConfigurationUrlRegex, setNewAnalyticsFamilyConfigurationUrlRegex] = useState();
  const [newAnalyticsFamilyConfigurationType, setNewAnalyticsFamilyConfigurationType] = useState(publishingOptions[0]);
  const [newAnalyticsFamilyConfigurationDescription, setNewAnalyticsFamilyConfigurationDescription] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    if (!isSubmittable) return;
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    if (!newAnalyticsFamilyConfigurationUrlRegex || newAnalyticsFamilyConfigurationUrlRegex.length === 0) {
      setErrorMessage('Please enter a name and value for your Analytics Family.');
      setIsLoading(false);
    } else {
      API.post('/api/v1/analytics_family_configurations', { 
        analytics_family_configuration: { 
          type: newAnalyticsFamilyConfigurationType.type,
          url_regex: newAnalyticsFamilyConfigurationUrlRegex,
          description: newAnalyticsFamilyConfigurationDescription
        } 
      }).then(({ analytics_family_configuration, analytics_family_configurations, error }) => {
        setIsLoading(false);
        if (error) {
          setErrorMessage(error);
        } else {
          setNewAnalyticsFamilyConfigurationUrlRegex('');
          setNewAnalyticsFamilyConfigurationDescription('');
          onNewAnalyticsFamilyConfiguration(analytics_family_configurations);
        }
      });
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Analytics Family Configurations
          <br/>
          <span className='text-sm font-light text-gray-500'>Analytics Families are how Swishjam filters data within the UI, such as deciphering between marketing and product analytics.</span>
        </label>
        <div className="grid max-w-4xl grid-cols-5 gap-x-6 mt-4">
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              URL regex
            </label>
            <div className="mt-2">
              <input
                type="text"
                value={newAnalyticsFamilyConfigurationUrlRegex}
                onChange={e => setNewAnalyticsFamilyConfigurationUrlRegex(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder='(www.)[^.]*.[^.]*$'
              />
            </div>
          </div>

          <div className='col-span-2'>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Analytics Family
            </label>
            <div className="mt-2">
              <TypeDropdown defaultOption={newAnalyticsFamilyConfigurationType} onSelect={setNewAnalyticsFamilyConfigurationType} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Description (optional)
            </label>
            <div className="mt-2">
              <input
                type="text"
                value={newAnalyticsFamilyConfigurationDescription}
                onChange={e => setNewAnalyticsFamilyConfigurationDescription(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder='Captures all URLs with a subdomain of `www`.'
              />
            </div>
          </div>

          <div className='flex items-end'>
            {!isSubmittable
              ? <button className='ml-2 w-20 h-10 rounded-md bg-gray-200 animate-pulse' disabled />
              : (
                <button
                  type="submit"
                  className={`ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isLoading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner color='white' className='w-5 h-5' /> : 'Add'}
                </button>
              )
            }
          </div>
        </div>
        {errorMessage && <div className="text-red-600 text-sm mt-2">{errorMessage}</div>}
      </form>
    </div>
  )
}