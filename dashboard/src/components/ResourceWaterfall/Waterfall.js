import WaterfallRow from './WaterfallRow';

export default function Waterfall({ resources }) {
  const sortedResources = resources.sort((a, b) => parseFloat(a.start_time) - parseFloat(b.start_time));
  const lastResource = sortedResources[sortedResources.length - 1];
  const roughlyLastTimestamp = parseFloat(lastResource.average_start_time) + parseFloat(lastResource.average_duration);

  return (
    <div className='w-full p-2 m-2'>
      <div className='w-[25%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
        Resource
      </div>
      <div className='w-[10%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
        Size
      </div>
      <div className='w-[65%] border-gray-300 truncate text-sm text-gray-700 inline-block text-center'>
        Waterfall
      </div>
      {sortedResources.map((resource, i) => <WaterfallRow resource={resource} roughlyLastTimestamp={roughlyLastTimestamp} index={i} /> )}
    </div>
  )
}