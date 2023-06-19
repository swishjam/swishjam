import { formattedMsOrSeconds } from "@/lib/utils"
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

export default function LabTestTab({ 
  title, 
  currentValue, 
  previousValue, 
  metric,
  goodNeedsImprovementPoorTiers, 
  onClick, 
  isActive,
  isFirstTab = false
}) {
  const percentChange = typeof previousValue === undefined || parseFloat(previousValue) === 0 
                          ? undefined 
                          : parseFloat(((currentValue - previousValue) / previousValue) * 100).toFixed(2);
  
  const isAwaitingData = typeof currentValue === 'undefined';
  const currentValueIsInvalid = currentValue < 0;
  const hasNoCurrentData = currentValue === null;
  const hasNoPreviousData = previousValue === null;
  const canCalculatePercentChange = !isAwaitingData && !hasNoCurrentData && !hasNoPreviousData && ![currentValue.toString(), previousValue.toString()].includes('0') && ![undefined, '0.00'].includes(percentChange);

  let tabValueContent;
  if (isAwaitingData) {
    tabValueContent = <div className='animate-pulse bg-gray-200 h-6 w-16 rounded-md' />;
  } else if (hasNoCurrentData || currentValueIsInvalid) {
    tabValueContent = <span className='text-md text-gray-700'>--</span>;
  } else {
    tabValueContent = (
      <span className={
        currentValue < goodNeedsImprovementPoorTiers.good
          ? 'text-green-600'
          : currentValue < goodNeedsImprovementPoorTiers.needsImprovement
            ? 'text-yellow-600'
            : 'text-red-600'
      }>
        {metric === 'cumulative_layout_shift' ? parseFloat(currentValue).toFixed(4) : formattedMsOrSeconds(currentValue)}
      </span>
    )
  }

  return (
    <div
      key={metric}
      className={`px-4 py-5 transition ${isFirstTab ? '' : 'border-l border-gray-200'} cursor-pointer ${isActive ? 'bg-white border-b-0' : 'border-b bg-gray-50 hover:bg-white hover:border-b-0'}`}
      onClick={() => onClick(metric)}
    >
      <h3 className={`text-sm text-gray-500 hover:underline ${isActive ? 'underline text-gray-900 font-medium' : ''}`}>{title}</h3>
      <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
        <div className="flex items-baseline text-2xl font-semibold">
          {tabValueContent}
        </div>

        {canCalculatePercentChange && (
          <div
            className={`
              ${percentChange < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              inline-flex items-baseline rounded-full px-2.5 py-0.5 text-xs
            `}
          >
            {percentChange > 0 
              ? <ArrowUpIcon className="-ml-1 mr-0.5 h-3 w-3 flex-shrink-0 self-center text-red-800" />
              : <ArrowDownIcon className="-ml-1 mr-0.5 h-3 w-3 flex-shrink-0 self-center text-green-800" />
            }
            {percentChange}%
          </div>
        )
        }
      </dd>
    </div>
  )
}