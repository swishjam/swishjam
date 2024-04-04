import { RxCardStack } from 'react-icons/rx';

export default function EmptyState({ msg = 'No data available.', border = false, icon }) {
  return (
    <div
      className={`group relative block w-full rounded-lg ${border ? 'border-2' : 'border-0'} border-dashed border-gray-200 p-12 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
    >
      {icon ? icon : <RxCardStack className="mx-auto h-12 w-12 text-gray-300 group-hover:animate-pulse" />}
      <span className="mt-2 block text-sm font-semibold text-gray-500 capitalize">{msg}</span>
    </div>
  )
}