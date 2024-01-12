import { formatMoney } from "@/lib/utils/numberHelpers"
import { LONG_MONTHS } from "@/lib/utils/timeHelpers"
import { StarIcon } from "lucide-react"
import { Tooltipable } from "@/components/ui/tooltip"

export default function HeatMapCell({
  backgroundColor,
  date,
  isLargestValueInSet,
  isHighlighted,
  onHover,
  onHoverEnd,
  value,
}) {
  if (isHighlighted) {
    console.log('Am i highlighted?', isHighlighted, date, value)
  }
  return (
    <Tooltipable
      content={
        <div className='text-center text-sm'>
          {formatMoney(value)} in revenue on {LONG_MONTHS[new Date(date).getUTCMonth()]} {new Date(date).getUTCDate()}.
          {isLargestValueInSet && (
            <span className='block flex items-center gap-x-1'>
              <StarIcon className='w-3 h-3 text-yellow-400' /> This is the highest revenue day in the past year.
            </span>
          )}
        </div>
      }
    >
      <div
        onMouseEnter={() => onHover({ date, value })}
        onMouseLeave={() => onHoverEnd({ date, value })}
        className={`flex items-center justify-center transition-all hover:shadow-lg hover:outline hover:outline-black hover:rounded hover:z-10 ${isHighlighted ? 'shadow-lg outline outline-black rounded z-10' : ''} `}
        style={{ width: '16px', height: '16px', backgroundColor }}
      >
        {isLargestValueInSet && <StarIcon className='w-2 h-2 text-yellow-400' />}
      </div>
    </Tooltipable>
  )
}