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

  const [numActiveUsersToDisplay, setNumActiveUsersToDisplay] = useState();
  const [numUsersInCohortToDisplay, setNumUsersInCohortToDisplay] = useState();
  const [activityDateToDisplay, setActivityDateToDisplay] = useState();
  const [cohortDateToDisplay, setCohortDateToDisplay] = useState();

  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = isExpandable && Object.keys(retentionCohorts).length > 4;

  const cohortDates = Object.keys(retentionCohorts);
  const maxNumWeeks = cohortDates.length > 0 ? Object.keys(retentionCohorts[cohortDates[0]].activity_periods).length : 0;

  return (
    <div className='relative'>
      {/* <div className='h-12'>
        {numUsersInCohortToDisplay && (
          <>
            <h1 className='text-lg font-medium text-gray-700'>{((numActiveUsersToDisplay / numUsersInCohortToDisplay) * 100).toFixed(2)}%</h1>
            <h2 className='text-xs text-gray-400'>
              {numActiveUsersToDisplay} of the {numUsersInCohortToDisplay} users in the {cohortDateToDisplay} cohort were active during the week of {activityDateToDisplay}.
            </h2>
          </>
        )}
      </div> */}
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
            {cohortDates.map(cohortPeriod => {
              const cohortData = retentionCohorts[cohortPeriod];
              return (
                <tr key={cohortPeriod}>
                  <>
                    <td className="whitespace-nowrap text-sm pr-4">
                      <span className='block' style={{ fontSize: '0.85rem' }}>{weekFormatter(cohortPeriod)}</span>
                      <span className='text-xs text-gray-400 block' style={{ fontSize: '0.7rem' }}>{cohortData.num_users_in_cohort} users</span>
                    </td>
                    {Object.keys(cohortData.activity_periods).map(activityTimePeriod => {
                      return (
                        <td className="whitespace-nowrap text-sm" key={`${cohortPeriod}-${activityTimePeriod}`}>
                          <RetentionGridCell
                            cohortDate={cohortPeriod}
                            activityDate={activityTimePeriod}
                            numActiveUsers={cohortData.activity_periods[activityTimePeriod].num_active_users}
                            cohortSize={cohortData.num_users_in_cohort}
                            onActivityPeriodHover={({ numActiveUsers, cohortSize, activityDate, cohortDate }) => {
                              setNumActiveUsersToDisplay(numActiveUsers);
                              setNumUsersInCohortToDisplay(cohortSize);
                              setActivityDateToDisplay(activityDate);
                              setCohortDateToDisplay(cohortDate);
                            }}
                            onActivityPeriodMouseOut={() => {
                              setNumActiveUsersToDisplay();
                              setNumUsersInCohortToDisplay();
                              setActivityDateToDisplay();
                              setCohortDateToDisplay();
                            }}
                          />
                        </td>
                      )
                    })}
                  </>
                </tr>
              )
            })}
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