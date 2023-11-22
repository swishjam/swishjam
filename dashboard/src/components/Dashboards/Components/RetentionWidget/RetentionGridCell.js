import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";

const weekFormatter = dateFormatterForGrouping('weeky');

export default function RetentionCell({
  activityDate,
  cohortDate,
  cohortSize,
  numActiveUsers,
  onActivityPeriodHover = () => { },
  onActivityPeriodMouseOut = () => { },
}) {
  const [isHovered, setIsHovered] = useState(false);
  const OPACITY_BUFFER = 0;
  const opacity = Math.max((numActiveUsers / cohortSize), 0.1) + OPACITY_BUFFER + (isHovered ? 0.1 : 0);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300} className='cursor-default'>
        <TooltipTrigger>
          <div
            className="relative w-20 h-8 mr-1 flex items-center justify-center p-1 text-gray-900 hover:text-black transition-all cursor-default"
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(false)}
          >
            <span className='text-xs z-10'>{cohortSize > 0 ? `${(numActiveUsers / cohortSize * 100).toFixed(2)}%` : 'N/A'}</span>
            <div
              className={`${cohortSize > 0 ? 'bg-swishjam' : 'bg-gray-200'} absolute top-0 right-0 left-0 bottom-0 z-0 transition-all duration-300`}
              style={{ opacity, fontSize: '0.75rem', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            >
            </div>
          </div>
          <TooltipContent className='text-xs text-gray-700'>
            {numActiveUsers} of the {cohortSize} users that registered the week of {cohortDate} were active within the week of {activityDate}.
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
    // TODO: come back to if we want to change from tooltip to showing as a "title" in the card
    // <>
    //   <div
    //     className="relative w-20 h-8 mr-1 flex items-center justify-center p-1 text-gray-900 hover:text-black transition-all cursor-default"
    //     onMouseOver={() => {
    //       setIsHovered(true)
    //       onActivityPeriodHover({ cohortDate, activityDate, numActiveUsers, cohortSize })
    //     }}
    //     onMouseOut={() => {
    //       setIsHovered(false)
    //       onActivityPeriodMouseOut()
    //     }}
    //   >
    //     <span className='text-xs z-10'>{cohortSize > 0 ? `${(numActiveUsers / cohortSize * 100).toFixed(2)}%` : 'N/A'}</span>
    //     <div
    //       className={`${cohortSize > 0 ? 'bg-swishjam' : 'bg-gray-200'} absolute top-0 right-0 left-0 bottom-0 z-0 transition-all duration-300`}
    //       style={{ opacity, fontSize: '0.75rem', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
    //     >
    //     </div>
    //   </div>
    // </>
  )
}