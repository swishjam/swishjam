import RetentionGridCell from './RetentionGridCell';
import LoadingState from "./LoadingGrid";

export default function RetentionGrid({ retentionCohorts }) {
  if (!retentionCohorts) return <LoadingState />
  if (Object.keys(retentionCohorts).length === 0) {
    return (
      <div className='text-sm text-gray-500 text-center p-4 group'>
        <div className='mx-auto grid grid-cols-3 gap-1 w-fit'>
          <div className='border-2 border-gray-300 rounded h-3 w-3 group-hover:border-swishjam duration-500 transition-all' />
          <div className='border-2 border-gray-300 rounded h-3 w-3 group-hover:border-swishjam duration-500 transition-all' />
          <div className='border-2 border-gray-300 rounded h-3 w-3' />
          <div className='border-2 border-gray-300 rounded h-3 w-3 group-hover:border-swishjam duration-500 transition-all' />
          <div className='border-2 border-gray-300 rounded h-3 w-3' />
          <div className='h-3 w-3' />
          <div className='border-2 border-gray-300 rounded h-3 w-3' />
        </div>
        <h3 className='mt-2 tracking-tight text-sm font-medium cursor-default'>No Retention Data</h3>
        <p className='mt-2'>Upon identify users, retention data will appear here</p>
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