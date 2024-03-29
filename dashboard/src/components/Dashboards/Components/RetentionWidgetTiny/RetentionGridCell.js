import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";

const weekFormatter = dateFormatterForGrouping('weeky');

export default function RetentionCell({ cohortDate, activityWeek, numActiveUsers, cohortSize }) {
  const [isHovered, setIsHovered] = useState(false);
  const OPACITY_BUFFER = 0;
  const opacity = Math.max((numActiveUsers / cohortSize), 0.1) + OPACITY_BUFFER + (isHovered ? 0.1 : 0);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300} className='cursor-default'>
        <TooltipTrigger>
          <div
            className={`${cohortSize > 0 ? 'bg-swishjam' : 'bg-gray-200'} w-6 h-6 flex items-center justify-center text-gray-900 hover:text-black transition-all cursor-default`}
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(false)}
            style={{ opacity, fontSize: '0.75rem', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          >
          </div>
          <TooltipContent className='text-xs text-gray-700'>
            {numActiveUsers} of the {cohortSize} users that registered the week of {weekFormatter(cohortDate)} were active within the week of {weekFormatter(activityWeek)}.
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}