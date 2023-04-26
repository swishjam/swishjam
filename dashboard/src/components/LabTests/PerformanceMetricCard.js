import { AreaChart } from "@tremor/react";
import { formattedDate, formattedMsOrSeconds } from "@/lib/utils";
// import { ChevronRightIcon } from '@heroicons/react/20/solid'

export default function LighthouseCard({ labTests, title, metric }) {
  const formattedLabTestsData = (labTests || [])
    .filter(test => test[metric] !== null)
    .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at))
    .map(test => ({
      ...test,
      [title]: test[metric],
      completed_at: formattedDate(test.completed_at)
    }));
  return (
    <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200 p-4">
      <h3 className='text-md font-medium mb-4'>{title}</h3>
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
                showLegend={false}
                categories={[title]}
                valueFormatter={val => metric === 'cumulative_layout_shift' ? val : formattedMsOrSeconds(val)}
              />
            </>
          )
      }
    </div>
  )
}