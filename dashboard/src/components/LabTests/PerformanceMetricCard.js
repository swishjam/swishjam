import { AreaChart } from "@tremor/react";
import { formattedDate, formattedMsOrSeconds } from "@/lib/utils";

export default function LighthouseCard({ labTests, title, metric, color }) {
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
  const percentChange = previousValue === undefined ? undefined : ((currentValue - previousValue) / previousValue) * 100;
  return (
    <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200 p-4">
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-md font-medium'>{title}</h3>
        <h3 className='text-md font-medium'>
          {typeof currentValue === 'number' 
            ? metric === 'cumulative_layout_shift' 
              ? parseFloat(currentValue).toFixed(4)
              : formattedMsOrSeconds(currentValue)
            : '--'}
          {percentChange && (
            <span className={`rounded-md text-xs py-1 px-2 ml-1 ${percentChange > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {percentChange > 0 ? '+' : ''}{percentChange.toFixed(2)}%
            </span>
          )}
        </h3>
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
                valueFormatter={val => metric === 'cumulative_layout_shift' ? val : formattedMsOrSeconds(val)}
                showGridLines={false}
              />
            </>
          )
      }
    </div>
  )
}