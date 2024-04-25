import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import Dropdown from '@/components/utils/Dropdown'
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useState, useEffect } from 'react'

export default function AdvancedSettingsSection({ selectedDataSource, onDataSourceSelected, children, ...props }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dataSources, setDataSources] = useState();

  useEffect(() => {
    SwishjamAPI.Config.retrieve().then(({ api_keys }) => {
      setDataSources(
        ['all', ...api_keys.map(({ data_source }) => data_source)]
      );
    })
  }, [])

  return (
    <div {...props}>
      <div className='flex items-center flex-nowrap gap-x-4 mt-4'>
        <span
          className='text-xs whitespace-nowrap cursor-pointer hover:bg-gray-100 px-2 py-1 rounded'
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDownIcon className='h-3 w-3 inline-block mr-1' /> : <ChevronRightIcon className='h-3 w-3 inline-block mr-1' />}
          Additional Settings
        </span>
        <div className='border-t border-gray-400 border-dashed w-full' />
      </div>
      <div className={`${isExpanded ? '' : 'hidden'} px-4 py-2 transition-all overflow-hidden`}>
        <div className='flex items-center gap-x-4'>
          <span className='text-sm text-gray-700'>Select the data source to query from.</span>
          <div className='w-fit'>
            <Dropdown
              label={'Select data source.'}
              options={dataSources}
              onSelect={onDataSourceSelected}
              selected={selectedDataSource}
            />
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}