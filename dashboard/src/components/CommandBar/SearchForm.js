import { useState } from 'react'
import { Combobox } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SearchForm({ isSearching, onSubmit }) {
  const [onInputChangeTimeoutId, setOnInputChangeTimeoutId] = useState();

  return (
    <form className="flex items-center">
      <Combobox.Input
        className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
        placeholder="Search for users, organizations, or dashboards..."
        onChange={e => {
          const query = e.target.value;
          if (onInputChangeTimeoutId) clearTimeout(onInputChangeTimeoutId)
          setOnInputChangeTimeoutId(setTimeout(() => {
            onSubmit(query);
          }, 500));
        }}
      />
      <button
        className='border-none bg-white p-2 rounded-full hover:bg-gray'
        type='submit'
        disabled={isSearching}
      >
        {isSearching
          ? (
            <div className='flex-shrink mr-4 left-4 top-3.5 text-gray-400 animate-spin'>
              <LoadingSpinner size={5} center={true} />
            </div>
          ) : <MagnifyingGlassIcon className="flex-shrink mr-4 left-4 top-3.5 h-5 w-5 text-gray-400" />}
      </button>
    </form>
  )
}