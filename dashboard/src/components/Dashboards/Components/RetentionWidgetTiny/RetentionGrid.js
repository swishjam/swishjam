import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { useState } from 'react'
//import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from 'react-icons/bs'
import RetentionGridCell from './RetentionGridCell';
import LoadingState from "./LoadingGrid";

const weekFormatter = dateFormatterForGrouping('week');

export default function RetentionGrid({ retentionCohorts, }) {
  if (!retentionCohorts) return <LoadingState />
  if (retentionCohorts.length === 0) {
    return (
      <div className='text-center p-10 text-sm text-gray-700'>
        Retention data is only available for identified users, begin identifying users in order to get retention data.
      </div>
    )
  }

  const sortedCohorts = retentionCohorts.sort((a, b) => new Date(a.time_period) - new Date(b.time_period))?.slice(-4)

  return (
    <div className='relative'>
      <div className={`no-scrollbar overflow-scroll min-w-full relative transition-all max-h-44`}>
        <table>
          <tbody className="bg-white">
            {sortedCohorts.map(({ id, num_users_in_cohort, retention_cohort_activity_periods, time_period: cohortDate }) => (
              <tr key={id}>
                <>
                  <td className="whitespace-nowrap text-sm pr-4">
                    <span className='block' style={{ fontSize: '0.85rem' }}>{new Date(cohortDate).toLocaleDateString()}</span>
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
    </div>
  )
}