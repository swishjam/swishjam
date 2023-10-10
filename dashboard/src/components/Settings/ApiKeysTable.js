// import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Skeleton } from '../ui/skeleton';
import ApiKeyRow from './ApiKeyRow';

export default function ApiKeysTable({ apiKeys }) {
  return (
    <div>
      {/* <div className='flex justify-end'>
        <button 
          className='flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark'
        >
          <PlusCircleIcon className='w-4 h-4 mr-1' />
          Generate new API Key
        </button>
      </div> */}
      <h2 className="block text-sm font-medium leading-6 text-gray-900">API Keys</h2>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col" className="px-3 py-3.5 text-left text-xs text-gray-900 font-normal">
              DATA SOURCE
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs text-gray-900 font-normal">
              PUBLIC KEY
            </th>
            {/* <th scope="col" className="px-3 py-3.5 text-left text-xs text-gray-900 font-normal">
              PRIVATE KEY
            </th> */}
            <th scope="col" className="px-3 py-3.5 text-left text-xs text-gray-900 font-normal">
              STATUS
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs text-gray-900 font-normal">
              CREATED
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {apiKeys
            ? apiKeys.map((apiKey, i) => <ApiKeyRow key={i} apiKey={apiKey} />)
            : (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i} className="group hover:bg-gray-50 duration-300 transition cursor-default">
                  <td className="px-3 py-3">
                    <Skeleton className='w-24 h-4 bg-gray-200' />
                  </td>
                  <td className="px-3 py-3">
                    <Skeleton className='w-24 h-4 bg-gray-200' />
                  </td>
                  <td className="px-3 py-3">
                    <Skeleton className='w-24 h-4 bg-gray-200' />
                  </td>
                  {/* <td className="px-3 py-3">
                    <Skeleton className='w-24 h-4 bg-gray-200' />
                  </td> */}
                  <td className="px-3 py-3">
                    <Skeleton className='w-24 h-4 bg-gray-200' />
                  </td>
                </tr>
              ))
            )}
        </tbody>
      </table>
    </div>
  )
}