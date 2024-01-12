import ConditionalCardWrapper from "./ConditionalCardWrapper"
import { formatMoney } from "@/lib/utils/numberHelpers"
import { InfoIcon } from "lucide-react";
import { LONG_MONTHS, SHORT_MONTHS } from "@/lib/utils/timeHelpers";
import { StarIcon } from "lucide-react";
import { Tooltipable } from "@/components/ui/tooltip"
import useSheet from "@/hooks/useSheet";

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
    <div className='flex justify-center'>
      <div>
        <div className='flex flex-nowrap m-auto overflow-x-scroll p-2'>
          <div className='inline-flex flex-col w-fit'>
            <span className='text-xs mb-1' style={{ height: '16px' }}>&nbsp;</span>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className='m-[0.075rem] flex items-center w-fit mr-1 text-xs'
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
                      className='bg-gray-200 animate-pulse rounded border border-gray-200 m-[0.075rem] flex items-center justify-center hover:scale-105 transition-all'
                      style={{ width: '16px', height: '16px' }}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
        <div className='flex justify-end mt-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center text-xs gap-x-1'>
              <div
                className='bg-gray-200 animate-pulse rounded border border-gray-200 m-[0.075rem] flex items-center justify-center hover:scale-105 transition-all'
                style={{ width: '16px', height: '16px' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </ConditionalCardWrapper>
)

export default function Heatmap({ data, title = 'Revenue Heatmap' }) {
  if (data === undefined) return <LoadingState />
  const { openSheetWithContent } = useSheet();

  const largestValue = Math.max(...data.map(d => d.value));
  const bucketSize = largestValue / 5;
  let lastDisplayedMonthIndex = null;

  const getColorForValue = value => {
    if (value === 0) return '#E5E7EB';
    if (value <= bucketSize) return '#acebca';
    if (value <= bucketSize * 2) return '#84e2b0';
    if (value <= bucketSize * 3) return '#66cb95';
    if (value <= bucketSize * 4) return '#48b67c';
    return '#009546';
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
      <div className='flex justify-center'>
        <div>
          <div className='flex flex-nowrap m-auto overflow-x-scroll p-2'>
            <div className='inline-flex flex-col w-fit'>
              <span className='text-xs mb-1' style={{ height: '16px' }}>&nbsp;</span>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className='m-[0.075rem] flex items-center w-fit mr-1 text-xs'
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
                    return (
                      <Tooltipable
                        content={
                          <div className='text-center'>
                            {formatMoney(d.value)} in revenue on {LONG_MONTHS[new Date(d.date).getUTCMonth()]} {new Date(d.date).getUTCDate()}.
                            {d.value === largestValue && (
                              <span className='block flex items-center gap-x-1'>
                                <StarIcon className='w-3 h-3 text-yellow-400' /> This is the highest revenue day in the past year.
                              </span>
                            )}
                          </div>
                        }
                      >
                        <div
                          key={j}
                          className='rounded border border-gray-200 m-[0.075rem] flex items-center justify-center hover:scale-105 transition-all'
                          style={{ width: '16px', height: '16px', backgroundColor: getColorForValue(d.value) }}
                        >
                          {d.value === largestValue && <StarIcon className='w-2 h-2 text-yellow-400' />}
                        </div>
                      </Tooltipable>
                    )
                  })}
                </div>
              )
            })}
          </div>
          <div className='flex justify-end mt-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center text-xs gap-x-1'>
                {i === 0 && <span>$0</span>}
                <div
                  className='rounded border border-gray-200 m-[0.075rem] flex items-center justify-center hover:scale-105 transition-all'
                  style={{ width: '16px', height: '16px', backgroundColor: getColorForValue(bucketSize * i) }}
                />
                {i === 4 && <span>{formatMoney(largestValue)}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ConditionalCardWrapper>
  )
}