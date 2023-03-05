import { useState, Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

export default function MultiSelectDropdown({ selectedOptions, options, onChange }) {
  const [currentlySelectedOptions, setCurrentlySelectedOptions] = useState(selectedOptions)

  const onChangeHandler = newSelectedOptions => {
    setCurrentlySelectedOptions(newSelectedOptions)
    onChange( newSelectedOptions.map(option => option.value) )
  }

  return (
    <div className='relative'>
      <Listbox value={currentlySelectedOptions} by="value" onChange={onChangeHandler} multiple>
        <Listbox.Button className="relative cursor-default min-w-[8rem] rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          <span className='block'>
            {currentlySelectedOptions.length === 0 ? 'Select resource types' : currentlySelectedOptions.map(option => option.name).join(', ')}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-10 mt-1 right-0 overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <Listbox.Option key='none' value={'none'} disabled={true} className={'relative cursor-default select-none py-2 px-4 text-gray-500 bg-gray-100'} >
              <span>Select resource types</span>
            </Listbox.Option>
            {options.map(option => (
              <Listbox.Option 
                        key={option.value} 
                        value={option} 
                        className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`} >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {option.name}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  )
}