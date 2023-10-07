import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";

const weekFormatter = dateFormatterForGrouping('weeky');

export default function RetentionCell({ cohortDate, activityWeek, numActiveUsers, cohortSize, hasNoData }) {
  const OPACITY_BUFFER = 0;
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300} className='cursor-default'>
        <TooltipTrigger>
          {hasNoData
            ? (
              <>
                <div className="w-20 h-20 flex items-center justify-center border-l p-1 bg-gray-100 text-sm transition-opacity" />
                <TooltipContent className='text-xs text-gray-700'>
                  No activity for the {weekFormatter(cohortDate)} cohort in the week of {weekFormatter(activityWeek)}.
                </TooltipContent>
              </>
            ) : (
              <>
                <div
                  className="w-20 h-20 flex items-center justify-center p-1 bg-swishjam text-gray-900 hover:text-black transition-all cursor-default"
                  style={{
                    opacity: Math.max((numActiveUsers / cohortSize) + OPACITY_BUFFER, 0.1),
                    fontSize: '0.75rem'
                  }}
                >
                  {(numActiveUsers / cohortSize * 100).toFixed(2)}%
                </div>
                <TooltipContent className='text-xs text-gray-700'>
                  {numActiveUsers} of the {cohortSize} users that registered the week of {weekFormatter(cohortDate)} were active within the week of {weekFormatter(activityWeek)}.
                </TooltipContent>
              </>
            )
          }
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}