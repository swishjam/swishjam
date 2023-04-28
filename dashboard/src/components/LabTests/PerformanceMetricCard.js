import { AreaChart } from "@tremor/react";
import { formattedDate, formattedMsOrSeconds } from "@/lib/utils";
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

const formattedMetric = (value, metric) => {
  if (typeof value === 'undefined') return;
  if (metric === 'cumulative_layout_shift') return parseFloat(value).toFixed(4);
  return formattedMsOrSeconds(value);
}

export default function PerformanceMetricCard({ labTests, title, metric, color }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  const formattedLabTestsData = (labTests || [])
    .filter(test => test[metric] !== null)
    .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at))
    .map(test => ({
      ...test,
      [title]: test[metric],
      completed_at: formattedDate(test.completed_at)
    }));
  const currentValue = formattedLabTestsData[formattedLabTestsData.length - 1]?.[title];
  const previousValue = formattedLabTestsData[formattedLabTestsData.length - 2]?.[title];
  const percentChange = typeof previousValue === undefined || parseFloat(previousValue) === 0 ? undefined : ((currentValue - previousValue) / previousValue) * 100;
  return (
    <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200 p-4">
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-md font-medium'>{title}</h3>
        <div>
          {labTests === undefined 
            ? <div className='h-6 w-8 animate-pulse bg-gray-200 rounded-md' />
            : <h3 className='inline-block text-md font-medium'>{typeof currentValue === 'undefined' ? '--' : formattedMetric(currentValue, metric)}</h3>
          }
          {typeof percentChange === 'number' && percentChange.toString() !== 'NaN' && (
            <>
              <span
                className={`rounded-md cursor-default text-xs py-1 px-2 ml-2 ${percentChange > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                ref={setTriggerRef}
              >
                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(2)}%
              </span>
              {visible && (
                <>
                  <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container max-w-[200px]' })}>
                    <div className='text-xs text-center'>
                      The most recent lab test resulted in a {title} of <span className='font-medium'>{formattedMetric(currentValue, metric)}</span>, {percentChange > 0 ? 'an increase' : 'a decrease'} of <span className='font-medium'>{percentChange.toFixed(2)}%</span> from the previous lab test of <span className='font-medium'>{formattedMetric(previousValue, metric)}</span>.
                    </div>
                    <div {...getArrowProps({ className: 'tooltip-arrow' })} />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {labTests === undefined
        ? <div className="h-40 animate-pulse bg-gray-200 rounded-md" />
        : formattedLabTestsData.length === 0
          ? <p className='text-gray-700 text-sm'>No lab tests data.</p>
          : (
            <>
              <AreaChart
                height="h-40"
                data={formattedLabTestsData}
                dataKey="completed_at"
                colors={[color]}
                showLegend={false}
                categories={[title]}
                valueFormatter={val => metric === 'cumulative_layout_shift' ? parseFloat(val).toFixed(4) : formattedMsOrSeconds(val)}
                showGridLines={false}
              />
            </>
          )
      }
    </div>
  )
}