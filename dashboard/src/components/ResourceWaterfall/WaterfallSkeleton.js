export default function WaterfallSkeleton() {
  const maxTimestamp = 5_000;
  const tickIndicatorEverMs = maxTimestamp > 5_000 ? 1_000 : 500;
  const numRows = 50;

  let timeMarkers = [<div key={0} className='inline-block text-gray-400 border-r h-full' style={{ width: '0%' }} />];
  while (timeMarkers.length * tickIndicatorEverMs < maxTimestamp) {
    const formattedTime = timeMarkers.length * tickIndicatorEverMs >= 1_000 ?
      `${(timeMarkers.length * tickIndicatorEverMs) / 1_000} s` :
      `${timeMarkers.length * tickIndicatorEverMs} ms`;
    timeMarkers.push(
      <div key={timeMarkers.length + 1} className='text-end inline-block text-gray-400 text-sm border-r h-full' style={{ width: `${(tickIndicatorEverMs / maxTimestamp) * 100}%` }}>
        {formattedTime}
      </div>
    )
  }

  return (
    <div className='w-full p-2 m-2'>
      <div className='flex'>
        <div className='w-[20%] border-gray-200 truncate text-sm text-gray-700 inline-block rounded-lg'>
          <div className='block h-5 border-l border-gray-200 pl-2'>Resource</div>
          {Array.from(Array(numRows)).map((_dummy, i) => {
            return (
              <div className={`flex items-center h-10 p-2 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
                <div className="animate-pulse flex space-x-4 h-full w-full">
                  <div className={`rounded bg-slate-200 h-full ${['w-1/4', 'w-1/3', 'w-1/2', 'w-2/3', 'w-3/4', 'w-full'][Math.ceil(Math.random() * 5)]}`} />
                </div>
              </div>
            )
          })}
        </div>
        <div className='w-[7.5%] border-gray-300 truncate text-sm text-gray-700 inline-block'>
          <div className='block h-5 border-l border-gray-200 pl-2'>Size</div>
          {Array.from(Array(numRows)).map((_dummy, i) => {
            return (
              <div className={`flex items-center h-10 p-2 border-r border-l border-gray-200 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
              </div>
            )
          })}
        </div>
        <div className='w-[7.5%] border-gray-300 truncate text-sm text-gray-700 inline-block'>
          <div className='block h-5 border-l border-gray-200 pl-2'>Time</div>
          {Array.from(Array(numRows)).map((_dummy, i) => {
            return (
              <div className={`flex items-center h-10 p-2 border-r border-l border-gray-200 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
              </div>
            )
          })}
        </div>
        <div className='w-[8%] border-gray-300 truncate text-sm text-gray-700 inline-block'>
          <div className='block h-5 border-l border-gray-200 pl-2'></div>
          {Array.from(Array(numRows)).map((_dummy, i) => {
            return (
              <div className={`flex items-center h-10 p-2 border-r border-l border-gray-200 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
              </div>
            )
          })}
        </div>
        <div className='w-[57%] border-gray-300 text-sm text-gray-700 inline-block relative overflow-x-scroll'>
          <div className='min-w-[100%] block h-5'>
            {timeMarkers}
          </div>
          {Array.from(Array(numRows)).map((_dummy, i) => {
            return (
              <div className={`flex items-center min-w-[100%] h-10 py-2 ${i % 2 === 0 ? 'bg-gray-100' : ''}`} key={i}>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}