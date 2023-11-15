import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { useState } from 'react'
import { BsArrowsAngleExpand, BsArrowsAngleContract } from 'react-icons/bs'
import RetentionGridCell from './RetentionGridCell';
import LoadingState from "./LoadingGrid";

const weekFormatter = dateFormatterForGrouping('week');

export default function RetentionGrid({ retentionCohorts, isExpandable }) {
  if (!retentionCohorts) return <LoadingState />
  if (retentionCohorts.length === 0) {
    return (
      <div className='text-center p-10 text-sm text-gray-700'>
        Retention data is only available for identified users, begin identifying users in order to get retention data.
      </div>
    )
  }

  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = isExpandable && retentionCohorts.length > 4;

  const sortedCohorts = retentionCohorts.sort((a, b) => new Date(a.time_period) - new Date(b.time_period))
  const maxNumWeeks = sortedCohorts[0].retention_cohort_activity_periods.length;

  return (
    <div className='relative'>
      <div className={`no-scrollbar overflow-scroll min-w-full relative transition-all ${isExpanded ? '' : 'max-h-96'}`}>
        <table>
          <thead>
            <tr className='font-normal'>
              <th className="text-left text-sm text-gray-700 font-normal pr-4" style={{ fontSize: '0.75rem' }}>
                {/* Cohort */}
              </th>
              {Array.from({ length: maxNumWeeks }).map((_, i) => (
                <th key={i} className="text-left text-sm text-gray-700 text-center font-normal" style={{ fontSize: '0.75rem' }}>
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
      {canExpand && (
        <div className='absolute bottom-0 right-0 bg-white p-2 rounded-full bg-opacity-50 duration-500 cursor-pointer transition-all hover:bg-gray-100' onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <BsArrowsAngleContract className='h-4 w-4 text-gray-700' /> : <BsArrowsAngleExpand className='h-4 w-4 text-gray-700' />}
        </div>
      )}
    </div>
  )
}