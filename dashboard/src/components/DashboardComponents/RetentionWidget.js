import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { dateFormatterForGrouping } from '@/lib/utils/timeseriesHelpers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const weekFormatter = dateFormatterForGrouping('weeky');

const RetentionCell = ({ cohortDate, activityWeek, numActiveUsers, cohortSize }) => {
  const OPACITY_BUFFER = 0.2;
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger>
          <div
            className="w-20 h-20 flex items-center justify-center border-l p-1 bg-swishjam text-sm transition-opacity"
            style={{ opacity: (numActiveUsers / cohortSize) + OPACITY_BUFFER }}
          >
            {(numActiveUsers / cohortSize * 100).toFixed(2)}%
          </div>
          <TooltipContent className='text-xs text-gray-700'>
            {numActiveUsers} of the {cohortSize} users that registered the week of {weekFormatter(cohortDate)} were active within the week of {weekFormatter(activityWeek)}.
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function RetentionWidget({ retentionCohorts }) {
  if (!retentionCohorts) return <>LOADING!</>
  const cohortsArray = [];
  const retentionWeeksArray = [];
  const cohorts = {}

  retentionCohorts.forEach(({ id, num_users, time_period: cohort_time_period, retention_cohort_activities }) => {
    cohorts[cohort_time_period] = { cohortSize: num_users };

    if (!cohortsArray[cohort_time_period]) cohortsArray.push(cohort_time_period);
    retention_cohort_activities.forEach(({ time_period: activity_time_period, num_active_users }) => {
      cohorts[cohort_time_period][activity_time_period] = num_active_users;
      if (!retentionWeeksArray[activity_time_period]) retentionWeeksArray.push(activity_time_period);
    })
  })

  const sortedCohorts = cohortsArray.sort((a, b) => new Date(b) - new Date(a));
  const sortedRetentionWeeks = retentionWeeksArray.sort((a, b) => new Date(b) - new Date(a));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium cursor-default">User Retention</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="retention-grid overflow-x-scroll">
          <div className="flex bg-gray-200 p-2">
            <div className="w-20 h-20 flex items-center justify-center text-sm font-medium">Cohort</div>
            {sortedRetentionWeeks.map((_date, index) => (
              <div key={index} className="w-20 h-20 flex items-center justify-center text-sm">
                {`Week ${index + 1}`}
              </div>
            ))}
          </div>

          {sortedCohorts.map((cohort, cohortIndex) => (
            <div key={cohortIndex} className="flex border-t">
              <div className="w-20 p-2 flex items-center justify-center text-sm">
                {weekFormatter(cohort)}
              </div>
              {sortedRetentionWeeks.map((week, weekIndex) => {
                return (
                  <RetentionCell
                    key={weekIndex}
                    cohortDate={cohort}
                    activityWeek={week}
                    numActiveUsers={cohorts[cohort][week]}
                    cohortSize={cohorts[cohort].cohortSize}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}