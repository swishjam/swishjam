import { AreaChart } from "@tremor/react";
import LighthouseScore from "../WebPageTest/LighthouseScore";
import { formattedDate } from "@/lib/utils";
import { ChevronRightIcon } from '@heroicons/react/20/solid'

export default function LighthouseCard({ labTests }) {
  const formattedLabTestsData = (labTests || [])
                                                .filter(test => test.lighthouse_performance_score !== null)
                                                .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at))
                                                .map(test => ({ 
                                                  ...test,
                                                  'Lighthouse Score': test.lighthouse_performance_score, 
                                                  completed_at: formattedDate(test.completed_at)
                                                }));
  return (
    <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200 p-4">
      <h3 className='text-md font-medium mb-4'>Lighthouse Results</h3>
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
                categories={['Lighthouse Score']}
                valueFormatter={val => parseFloat(val * 100).toFixed(0)}
              />
              <ul
                role="list"
                className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm sm:rounded-md max-h-80 overflow-y-scroll border border-gray-100"
              >
                {formattedLabTestsData.slice().reverse().map(labTest => (
                  <li key={labTest.uuid} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div className="flex gap-x-4">
                      {labTest.lighthouse_performance_score === null 
                          ? '--' 
                          : <LighthouseScore score={parseInt(labTest.lighthouse_performance_score * 100)} size='tiny' />}
                      <div className="flex items-center">
                        <p className="text-sm leading-6 text-gray-900">
                          <a href={`/lab-test/${labTest.uuid}`}>
                            {labTest.full_url}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-4">
                      <div className="hidden sm:flex sm:flex-col sm:items-end">
                        <p className="text-xs text-gray-900">{labTest.completed_at}</p>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )
      }
    </div>
  )
}