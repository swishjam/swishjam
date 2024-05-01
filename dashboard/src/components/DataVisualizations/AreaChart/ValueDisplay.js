import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

export default function ValueDisplay({
  comparisonDate,
  comparisonValue,
  date,
  dateFormatter = d => d,
  title,
  value,
  valueFormatter = v => v,
  ...props
}) {
  return (
    <div className={props.className || ''}>
      <div className="text-2xl font-bold cursor-default flex">
        {typeof value !== 'undefined' ? valueFormatter(value) : ''}
        {typeof value !== 'undefined' && typeof comparisonValue !== 'undefined' ? (
          <HoverCard>
            <HoverCardTrigger className='block w-fit ml-2 pt-2'>
              <p className="text-xs text-muted-foreground cursor-default">
                {value < comparisonValue ? <ArrowTrendingDownIcon className="h-4 w-4 inline-block text-red-500 mr-1" /> : <ArrowTrendingUpIcon className="h-4 w-4 inline-block text-green-500 mr-1" />}
                <span className='underline decoration-dotted'>{valueFormatter(Math.abs(value - comparisonValue))}</span>
              </p>
            </HoverCardTrigger>
            <HoverCardContent align={'center'} sideOffset={0} className='flex items-center text-gray-500'>
              <CalendarIcon className="h-6 w-6 inline-block mr-2" />
              <span className='text-xs'>There were {valueFormatter(comparisonValue)} {title} on {dateFormatter(comparisonDate)}.</span>
            </HoverCardContent>
          </HoverCard>
        ) : <></>
        }
      </div>
      <div className=''>
        <span className='text-xs font-light cursor-default block'>{date ? dateFormatter(date) : ''}</span>
      </div>
    </div>
  )
}