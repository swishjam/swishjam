"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CalendarIcon } from "@heroicons/react/24/outline";
import ConditionalCardWrapper from "./utils/ConditionalCardWrapper";

export default function ValueCard({
  includeCard = true,
  includeComparisonData = true,
  previousValue,
  previousValueDate,
  QueryDetails,
  subtitle,
  title,
  value,
  valueFormatter = val => val,
}) {
  if ([null, undefined].includes(value)) {
    return (
      <ConditionalCardWrapper title={title} subtitle={subtitle} includeCard={includeCard} QueryDetails={QueryDetails}>
        <Skeleton className="w-12 h-10 rounded-sm mt-1" />
      </ConditionalCardWrapper>
    )
  }

  const changeInValue = typeof previousValue !== 'undefined' ? value - previousValue : null;

  return (
    <ConditionalCardWrapper title={title} subtitle={subtitle} includeCard={includeCard} QueryDetails={QueryDetails}>
      <div className="flex">
        <div className="text-2xl font-bold cursor-default">
          {valueFormatter(value)}
        </div>
        {includeComparisonData && changeInValue && changeInValue !== 0
          ? (
            <HoverCard>
              <HoverCardTrigger className='block w-fit ml-2 pt-2'>
                <p className="text-xs text-muted-foreground cursor-default">
                  {changeInValue < 0 ? <ArrowTrendingDownIcon className="h-4 w-4 inline-block text-red-500 mr-1" /> : <ArrowTrendingUpIcon className="h-4 w-4 inline-block text-green-500 mr-1" />}
                  <span className='underline decoration-dotted'>{valueFormatter(Math.abs(changeInValue))}</span>
                </p>
              </HoverCardTrigger>
              <HoverCardContent className='flex items-center text-gray-500'>
                <CalendarIcon className="h-6 w-6 inline-block mr-2" />
                <span className='text-xs'>{title} was measured at {valueFormatter(previousValue)} on {new Date(previousValueDate).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })}.</span>
              </HoverCardContent>
            </HoverCard>
          ) : <></>
        }
      </div>
    </ConditionalCardWrapper>
  )
}