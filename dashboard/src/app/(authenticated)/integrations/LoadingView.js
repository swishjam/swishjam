import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingView() {
  return (
    <div className=''>
      <ul role="list" className="grid grid-cols-1 mt-6 border-t border-gray-200">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="border-b border-gray-200 group cursor-pointer duration-300 transition offset-2" key={i}>
            <div className="flex items-center gap-x-4 py-4">
              <Skeleton className='w-12 h-12 bg-gray-200 flex-none rounded-lg' />
              <div className="text-sm font-medium leading-6 text-gray-900">
                <Skeleton className='w-32 h-8 bg-gray-200' />
              </div>
              <div className='relative ml-auto'>
                <Skeleton className='w-24 h-8 bg-gray-200' />
              </div>
            </div>
          </div>
        ))}
      </ul>

      <h5 className='pt-8 pb-2'>Available Data Sources</h5>
      <ul role="list" className="grid grid-cols-1 mt-4 border-t border-gray-200">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="border-b border-gray-200 group cursor-pointer duration-300 transition offset-2" key={i}>
            <div className="flex items-center gap-x-4 py-4">
              <Skeleton className='w-12 h-12 bg-gray-200 flex-none rounded-lg' />
              <div className="text-sm font-medium leading-6 text-gray-900">
                <Skeleton className='w-32 h-8 bg-gray-200' />
              </div>
              <div className='relative ml-auto'>
                <Skeleton className='w-24 h-8 bg-gray-200' />
              </div>
            </div>
          </div>
        ))}
      </ul>
    </div>
  )
}