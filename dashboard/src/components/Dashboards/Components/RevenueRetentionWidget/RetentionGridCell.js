import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMoney } from '@/lib/utils/numberHelpers';
import { LONG_MONTHS } from '@/lib/utils/timeHelpers';

export default function RetentionCell({
  cohortDate,
  retentionDate,
  mrrGeneratedForPeriod,
  startingMrrForCohort,
  isPending,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const OPACITY_BUFFER = -0.15; // leaves room for > 100% retention
  const opacity = startingMrrForCohort === 0 ? 1 : Math.max((mrrGeneratedForPeriod / startingMrrForCohort), 0.25) + OPACITY_BUFFER + (isHovered ? 0.1 : 0);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300} className='cursor-default'>
        <TooltipTrigger>
          <div
            className='relative w-20 h-8 mr-1 flex items-center justify-center p-1 text-gray-900 hover:text-black transition-all cursor-default'
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(false)}
          >
            <span className='text-xs z-10'>{startingMrrForCohort > 0 ? `${(mrrGeneratedForPeriod / startingMrrForCohort * 100).toFixed(2)}%` : 'N/A'}</span>
            {isPending && startingMrrForCohort > 0 && (
              <div
                className='absolute top-0 right-0 left-0 bottom-0 z-0'
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgb(229 231 235), rgb(229 231 235) 5px, rgba(255,255,255,0.5) 5px, rgba(255,255,255,0.5) 12px)' }}
              />
            )}
            <div
              className={`${startingMrrForCohort > 0 ? 'bg-swishjam' : 'bg-gray-200'} absolute top-0 right-0 left-0 bottom-0 z-0 transition-all duration-300`}
              style={{
                opacity,
                fontSize: '0.75rem',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          </div>
          <TooltipContent className='text-xs text-gray-700'>
            <span className='block'>Of the {formatMoney(startingMrrForCohort)} in MRR for the subscriptions that were created in {LONG_MONTHS[new Date(cohortDate).getUTCMonth()]}, {formatMoney(mrrGeneratedForPeriod)} {isPending ? 'has been collected so far' : `remained by the end of ${LONG_MONTHS[new Date(retentionDate).getUTCMonth()]}`}.</span>
            {isPending && <span className='block mt-2'>*This is the current month, therefore recurring revenue is still being collected and this is not the final amount.</span>}
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}