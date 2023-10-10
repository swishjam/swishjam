import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import RetentionGridCell from './RetentionGridCell';
import LoadingState from "./LoadingGrid";

const weekFormatter = dateFormatterForGrouping('week');

export default function RetentionGrid({ retentionCohorts }) {
  if (!retentionCohorts) return <LoadingState />
  if (retentionCohorts.length === 0) {
    return (
      <div className='text-center p-10 text-sm text-gray-700'>
        Retention data is only available for identified users, begin identifying users in order to get retention data.
      </div>
    )
  }

  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandable = retentionCohorts.length > 4;

  const sortedCohorts = retentionCohorts.sort((a, b) => new Date(a.time_period) - new Date(b.time_period))
  const maxNumWeeks = sortedCohorts[0].retention_cohort_activity_periods.length;

  return (
    <>
      <div className={`overflow-scroll min-w-full relative transition-all ${isExpanded ? '' : 'max-h-96'}`}>
        <table>
          <thead>
            <tr className='font-normal'>
              <th className="text-left text-sm text-gray-700 font-normal pr-4" style={{ fontSize: '0.75rem' }}>
                {/* Cohort */}
              </th>
              {Array.from({ length: maxNumWeeks }).map((_, i) => (
                <th className="text-left text-sm text-gray-700 text-center font-normal" style={{ fontSize: '0.75rem' }}>
                  Week {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedCohorts.map(({ id, num_users_in_cohort, retention_cohort_activity_periods, time_period: cohortDate }) => (
              <tr key={id}>
                <>
                  <td className="whitespace-nowrap text-sm pr-4">
                    <span className='block' style={{ fontSize: '0.85rem' }}>{weekFormatter(cohortDate)}</span>
                    <span className='text-xs text-gray-400 block' style={{ fontSize: '0.7rem' }}>{num_users_in_cohort} users</span>
                  </td>
                  {retention_cohort_activity_periods.map(({ time_period: activityTimePeriod, num_active_users, num_periods_after_cohort }) => {
                    return (
                      <td className="whitespace-nowrap text-sm" key={`${id}-${num_periods_after_cohort}`}>
                        <RetentionGridCell
                          cohortDate={cohortDate}
                          activityWeek={activityTimePeriod}
                          numActiveUsers={num_active_users}
                          cohortSize={num_users_in_cohort}
                        />
                      </td>
                    )
                  })}
                </>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isExpandable && (
        <div className='w-full h-10 flex items-center justify-center bg-white bg-opacity-50 w-full text-center cursor-pointer transition-background hover:bg-gray-50' onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUpIcon className='h-4 w-4 text-gray-700' /> : <ChevronDownIcon className='h-4 w-4 text-gray-700' />}
        </div>
      )}
    </>
  )
}