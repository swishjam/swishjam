import ConditionalCardWrapper from "./ConditionalCardWrapper"
import { formatMoney } from "@/lib/utils/numberHelpers"
import { InfoIcon } from "lucide-react";
import { SHORT_MONTHS } from "@/lib/utils/timeHelpers";
import useSheet from "@/hooks/useSheet";
import { useState } from "react";
import HeatMapCell from "./HeatMap/HeatMapCell";
import { Tooltipable } from "@/components/ui/tooltip";
import HeatMapLegend from "./HeatMap/HeatMapLegend";

const DocumentationContent = () => (
  <p>
    The Revenue Heatmap shows the revenue collected (when a charge succeeds) on each day over the past 12 months. The darker the color, the higher the revenue collected on that day.
  </p>
)

const LoadingState = ({ title }) => (
  <ConditionalCardWrapper
    className='group'
    includeCard={true}
    title={
      <div className='flex items-center gap-x-1'>
        {title}
      </div>
    }
  >
    <div className='w-full overflow-x-scroll'>
      <div className='flex flex-nowrap mx-auto p-2 w-fit'>
        <div className='inline-flex flex-col w-fit'>
          <span className='text-xs mb-1' style={{ height: '16px' }}>&nbsp;</span>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className='flex items-center w-fit mr-1 text-xs'
              style={{ height: '16px' }}
            >
              {i === 0 && 'Mon'}
              {i === 2 && 'Wed'}
              {i === 4 && 'Fri'}
              {i === 6 && 'Sun'}
            </div>
          ))}
        </div>
        {Array.from({ length: 53 }).map((_, weekIndex) => {
          return (
            <div key={weekIndex} className='inline-flex flex-col w-fit'>
              <div className='mb-1' style={{ width: '16px', height: '16px' }}>
                <span className='text-xs'>&nbsp;</span>
              </div>
              {Array.from({ length: 7 }).map((_, j) => {
                return (
                  <div
                    key={j}
                    className='bg-gray-200 animate-pulse outline outline-white'
                    style={{ width: '16px', height: '16px' }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
    <div className='flex justify-center mt-4'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex items-center text-xs gap-x-1'>
          <div
            className='bg-gray-200 animate-pulse outline outline-white'
            style={{ width: '25px', height: '25px' }}
          />
        </div>
      ))}
    </div>
  </ConditionalCardWrapper>
)

export default function Heatmap({ data, title = 'Revenue Heatmap' }) {
  if (data === undefined) return <LoadingState />
  const { openSheetWithContent } = useSheet();
  const [hoveredLegendItemValueRange, setHoveredLegendItemValueRange] = useState();
  const [hoveredCellValue, setHoveredCellValue] = useState();

  const largestValue = Math.max(...data.map(d => d.value));
  const bucketSize = largestValue / 5;
  let lastDisplayedMonthIndex = null;
  let numCellsInEachBucket = [0, 0, 0, 0, 0, 0]

  const bucketIndexForValue = value => {
    if (value === 0) return 0;
    if (value <= bucketSize) return 1;
    if (value <= bucketSize * 2) return 2;
    if (value <= bucketSize * 3) return 3;
    if (value <= bucketSize * 4) return 4;
    return 5;
  }

  const getColorForValue = value => {
    return ['#E5E7EB', '#acebca', '#84e2b0', '#66cb95', '#48b67c', '#009546'][bucketIndexForValue(value)]
  }

  const shouldDisplayMonth = (index, lastDisplayedMonth) => {
    const monthIndex = new Date(data[index * 7].date).getMonth(); // Get the month of the first day of the week
    // Display the month if it's the first element or if it's been two months since the last displayed month
    return index === 0 || (lastDisplayedMonth !== null && Math.abs(monthIndex - lastDisplayedMonth) >= 2)
  }

  return (
    <ConditionalCardWrapper
      className='group'
      includeCard={true}
      title={
        <div className='flex items-center gap-x-1'>
          {title}
          <a
            onClick={() => openSheetWithContent({ title, content: DocumentationContent })}
            className='cursor-pointer text-gray-500 hover:text-gray-700 transition-all rounded-full hover:bg-gray-100 p-1'
          >
            <InfoIcon className='h-3 w-3' />
          </a>
        </div>
      }
    >
      <div className='w-full overflow-x-scroll'>
        <div className='flex flex-nowrap mx-auto p-2 w-fit'>
          <div className='inline-flex flex-col w-fit'>
            <span className='text-xs mb-1' style={{ height: '16px' }}>&nbsp;</span>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center w-fit mr-1 text-xs'
                style={{ height: '16px' }}
              >
                {i === 0 && 'Mon'}
                {i === 2 && 'Wed'}
                {i === 4 && 'Fri'}
                {i === 6 && 'Sun'}
              </div>
            ))}
          </div>
          {Array.from({ length: 53 }).map((_, weekIndex) => {
            let monthLabel = null;
            if (shouldDisplayMonth(weekIndex, lastDisplayedMonthIndex)) {
              const monthIndex = new Date(data[weekIndex * 7].date).getMonth();
              monthLabel = <span className='text-xs'>{SHORT_MONTHS[monthIndex]}</span>;
              lastDisplayedMonthIndex = monthIndex;
            }
            return (
              <div key={weekIndex} className='inline-flex flex-col w-fit'>
                <div className='mb-1' style={{ width: '16px', height: '16px' }}>
                  {monthLabel || <span className='text-xs'>&nbsp;</span>}
                </div>
                {data.slice(weekIndex * 7, (weekIndex * 7) + 7).map((d, j) => {
                  numCellsInEachBucket[bucketIndexForValue(d.value)]++;
                  return (
                    <HeatMapCell
                      key={j}
                      backgroundColor={getColorForValue(d.value)}
                      date={d.date}
                      isLargestValueInSet={d.value > 0 && d.value === largestValue}
                      isHighlighted={
                        (hoveredLegendItemValueRange && hoveredLegendItemValueRange[0] === 0 && hoveredLegendItemValueRange[1] === 0 && d.value === 0) ||
                        (hoveredLegendItemValueRange && d.value > hoveredLegendItemValueRange[0] && d.value <= hoveredLegendItemValueRange[1])
                      }
                      onHover={({ value }) => setHoveredCellValue(value)}
                      onHoverEnd={() => setHoveredCellValue()}
                      value={d.value}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
      <HeatMapLegend
        numCellsInEachBucket={numCellsInEachBucket}
        hoveredCellValue={hoveredCellValue}
        onHover={setHoveredLegendItemValueRange}
        onHoverEnd={() => setHoveredLegendItemValueRange()}
        bucketSize={bucketSize}
        largestValue={largestValue}
        getColorForValue={getColorForValue}
      />
    </ConditionalCardWrapper>
  )
}