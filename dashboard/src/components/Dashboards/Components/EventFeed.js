import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyState from "@components/EmptyState"
import { HiCursorArrowRays } from 'react-icons/hi2'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const EventFeed = ({ 
  title, 
  className,
  subTitle,
  events, 
  leftItemHeaderKey, 
  rightItemKey, 
  rightItemKeyFormatter = value => value, 
  noDataMsg = 'No events triggered.',
  initialLimit = 5,
  loadMoreEventsIncrement = 1
}) => {
  const [eventCount, setEventCount] = useState(initialLimit);

  return (
  <div className={className}>
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
        {subTitle && <CardDescription>{subTitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          {events && events.length === 0 && (
            <EmptyState msg={noDataMsg} border={true} icon={<HiCursorArrowRays className="mx-auto h-12 w-12 text-gray-300 group-hover:animate-pulse"/>} />
          )}
          <ul role="list" className="space-y-6">
            {events && events.slice(0, eventCount).map((event, eventIdx) => (
              <li key={event.id} className="relative flex gap-x-4">
                <div
                  className={classNames(
                    eventIdx === events.length - 1 ? 'h-6' : '-bottom-6',
                    'absolute left-0 top-0 flex w-6 justify-center'
                  )}
                >
                  <div className="w-px bg-gray-200" />
                </div>
                <div className="relative flex h-6 w-6 flex-none items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                </div>
                <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                  <span className="font-medium text-gray-900">{event[leftItemHeaderKey]}</span>
                </p>
                <span className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                  {rightItemKeyFormatter(event[rightItemKey])}
                </span>
              </li>
            ))}
          </ul>
          
          {events &&
          <Button
            onClick={() => setEventCount(eventCount + loadMoreEventsIncrement)} 
            variant="outline"
            className={`${events.length > eventCount ? 'opacity-100':'hidden'} mt-10 w-full transition duration-1000 ease-out`}
          >
            Show More Events
          </Button>}
        </div>
      </CardContent>
    </Card>
  </div>
  )
}

export default EventFeed;