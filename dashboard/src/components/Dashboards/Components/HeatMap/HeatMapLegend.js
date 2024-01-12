import { Tooltipable } from "@/components/ui/tooltip"
import { formatMoney } from "@/lib/utils/numberHelpers"

export default function HeatMapLegend({ numCellsInEachBucket, hoveredCellValue, onHover, onHoverEnd, bucketSize, largestValue, getColorForValue }) {
  return (
    <div className='flex items-center justify-center mt-4'>
      {Array.from({ length: 6 }).map((_, i) => {
        const tooltipMsg = i === 0
          ? `You have ${numCellsInEachBucket[i]} days where you made $0.00 in revenue.`
          : `You have ${numCellsInEachBucket[i]} days where you made between ${formatMoney(bucketSize * (i - 1))} and ${formatMoney(bucketSize * i)} in revenue.`
        const matchesHoveredCellValue = hoveredCellValue === 0 && i === 0 || (hoveredCellValue > bucketSize * (i - 1) && hoveredCellValue <= bucketSize * i)
        return (
          <Tooltipable content={tooltipMsg}>
            <div key={i} className='flex items-center text-xs gap-x-1'>
              {i === 0 && <span>$0</span>}
              <div
                onMouseEnter={() => onHover([Math.max(bucketSize * (i - 1), 0), bucketSize * i])}
                onMouseLeave={onHoverEnd}
                className={`hover:scale-105 transition-all ${matchesHoveredCellValue ? 'scale-105 rounded outline outline-black' : ''}`}
                style={{ width: '25px', height: '25px', backgroundColor: getColorForValue(bucketSize * i) }}
              />
              {i === 5 && <span>{formatMoney(largestValue)}</span>}
            </div>
          </Tooltipable>
        )
      })}
    </div>
  )
}