import RetentionGridCell from './RetentionGridCell';
import LoadingState from "./LoadingGrid";

export default function RetentionGrid({ retentionCohorts }) {
  if (!retentionCohorts) return <LoadingState />
  if (retentionCohorts.length === 0) {
    return (
      <div className='text-center p-10 text-sm text-gray-700'>
        Retention data is only available for identified users, begin identifying users in order to get retention data.
      </div>
    )
  }

  return (
    <div className='relative'>
      <div className='no-scrollbar overflow-scroll min-w-full relative transition-all max-h-44'>
        <table>
          <tbody className="bg-white">
            {Object.keys(retentionCohorts).map(cohortPeriod => {
              const cohortData = retentionCohorts[cohortPeriod];
              return (
                <tr key={cohortPeriod}>
                  <>
                    <td className="whitespace-nowrap text-sm pr-4">
                      <span className='block' style={{ fontSize: '0.85rem' }}>{new Date(cohortPeriod).toLocaleDateString()}</span>
                      <span className='text-xs text-gray-400 block' style={{ fontSize: '0.7rem' }}>{cohortData.num_users_in_cohort} users</span>
                    </td>
                    {Object.keys(cohortData.activity_periods).map(activityTimePeriod => {
                      return (
                        <td className="whitespace-nowrap text-sm" key={`${cohortPeriod}-${activityTimePeriod}`}>
                          <RetentionGridCell
                            cohortDate={cohortPeriod}
                            activityWeek={activityTimePeriod}
                            numActiveUsers={cohortData.activity_periods[activityTimePeriod].num_active_users}
                            cohortSize={cohortData.num_users_in_cohort}
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
    </div>
  )
}