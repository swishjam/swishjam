import { CategoryBar } from "@tremor/react";
import { cwvMetricBounds } from "@lib/cwvCalculations";
import { formattedMsOrSeconds } from "@lib/utils";

export default function MetricGauge({ accronym, percentileValue }) {
  const cwvBounds = cwvMetricBounds[accronym];
  const sizeOfBad = Math.min(cwvBounds.good, cwvBounds.medium);
  const totalSize = cwvBounds.good + cwvBounds.medium + sizeOfBad;

  const startingPercentage = percentileValue <= cwvBounds.medium ? 0 : (cwvBounds.good / totalSize) * 100;
  const percentageValue = Math.min(100, startingPercentage + ((percentileValue / totalSize) * 100));
  return (
    <div className='w-full'>
      {typeof percentileValue === 'number' 
        ? (
          <CategoryBar
            categoryPercentageValues={[(cwvBounds.good / totalSize) * 100, (cwvBounds.medium / totalSize) * 100, (sizeOfBad / totalSize) * 100]}
            colors={["emerald", "yellow", "rose"]}
            percentageValue={percentageValue}
            showLabels={false}
          />
        ) : <div className='w-full h-2 rounded bg-gray-400' />
      }
      <div className='block'>
        <div className='inline-block text-xs text-gray-400 text-center' 
              style={{ width: `${((cwvBounds.good / totalSize) + ((cwvBounds.medium / totalSize) / 2)) * 100}%` }}>
          {accronym === 'CLS' ? parseFloat(cwvBounds.good).toFixed(2) : formattedMsOrSeconds(cwvBounds.good)}
        </div>
        <div className='inline-block text-xs text-gray-400 text-center' 
              style={{ width: `${((cwvBounds.good / totalSize) + ((cwvBounds.medium / totalSize) / 2)) * 100}%` }}>
          {accronym === 'CLS' ? parseFloat(cwvBounds.medium).toFixed(2) : formattedMsOrSeconds(cwvBounds.medium)}
        </div>
      </div>
    </div>
  )
}