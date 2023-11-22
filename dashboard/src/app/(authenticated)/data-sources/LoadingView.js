export default function LoadingView() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-2 mt-8 flex items-center'>
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Data Sources</h1>
        </div>
        <div className="w-full flex items-center justify-end">
        </div>
      </div>
      <div className='pt-12'>
        <h5 className='py-2'>Connected Data Sources</h5>
        <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="rounded-xl border border-gray-200 bg-gray-100 animate-pulse h-24" />
          ))}
        </ul>

        <h5 className='pt-8 pb-2'>Available Data Sources to Connect</h5>
        <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="rounded-xl border border-gray-200 bg-gray-100 animate-pulse h-24" />
          ))}
        </ul>
      </div>
    </main>
  )
}