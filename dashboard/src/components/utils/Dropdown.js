import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function OptionsDropdown({ className, selected, options, label, onSelect = () => { } }) {
  const [selectedOption, setSelectedOption] = useState(selected);

  return (
    <Listbox
      // className={className}
      value={selectedOption}
      onChange={option => {
        setSelectedOption(option);
        onSelect(option);
      }}
    >
      {({ open }) => (
        <>
          <div className="z">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-swishjam sm:text-sm sm:leading-6">
              <span className="block truncate">{selectedOption ? selectedOption : label}</span>
              <span className="pointer-options-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-fit max-w-24 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <Listbox.Option className='text-gray-500 relative cursor-default select-none py-2 pl-3 pr-9' disabled={true}>
                  {label}
                </Listbox.Option>
                {(options || []).map(option => (
                  <Listbox.Option
                    key={typeof option === 'string' ? option : option.name}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-swishjam text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={typeof option === 'string' ? option : option.name}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {typeof option === 'string' ? option : option.name}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-swishjam',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
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
