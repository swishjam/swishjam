"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CalendarIcon, Cog8ToothIcon } from "@heroicons/react/24/outline";

const LoadingState = ({ title }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton className="w-full h-12 rounded-sm mt-1" />
    </CardContent>
  </Card>
)

export default function ClickableValueCard({ 
  title, 
  selected,
  value, 
  previousValue, 
  previousValueDate, 
  valueFormatter = val => val,
  onClick = () => {}
}) {
  if ([null, undefined].includes(value)) return <LoadingState title={title} />;
  
  const changeInValue = typeof previousValue !== 'undefined' ? value - previousValue : null;

  return (
    <Card
      className={`${selected ? 'ring-1':null} group hover:ring-2 offset-2 ring-swishjam duration-300 transition cursor-pointer`}
      onClick={()=> onClick(title)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex">
          <div className="text-2xl font-bold cursor-default">
            {valueFormatter(value)}
          </div>
          {changeInValue && changeInValue !== 0 
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
      </CardContent>
    </Card>
  )
}