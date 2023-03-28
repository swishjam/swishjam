import { useState, Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'

export default function MultiSelectDropdown({ selectedOptions, label, options, onChange }) {
  const [currentlySelectedOptions, setCurrentlySelectedOptions] = useState(selectedOptions)

  const onChangeHandler = newSelectedOptions => {
    setCurrentlySelectedOptions(newSelectedOptions)
    onChange( newSelectedOptions.map(option => option.value) )
  }

  return (
    <div className='relative'>
      <Listbox value={currentlySelectedOptions} by="value" onChange={onChangeHandler} multiple>
        <Listbox.Button className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {currentlySelectedOptions.length === 0 ? 'Select resource types' : currentlySelectedOptions.map(option => option.name).join(', ')}
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute min-w-full z-10 mt-1 right-0 overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <Listbox.Option key='none' value={'none'} disabled={true} className={'relative cursor-default select-none py-2 px-4 text-gray-500 bg-gray-100'} >
              <span>{label}</span>
            </Listbox.Option>
            {options.map(option => (
              <Listbox.Option 
                        key={option.value} 
                        value={option} 
                        className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`} >
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