import { Skeleton } from "@/components/ui/skeleton";
import ConditionalCardWrapper from "./ConditionalCardWrapper";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";

const dateFormatter = dateFormatterForGrouping('minute')

const SessionTimelineItem = ({ session }) => {
  return (
    <div className='rounded hover:bg-gray-100 transition-all cursor-pointer w-fit flex items-center gap-x-2 mt-2 px-2 py-1'>
      <ChevronRightIcon className='h-3 w-3' />
      <span className='text-sm text-gray-700'>Session</span>
    </div>
  )
}

export default function SessionTimeline({ timeline, includeCard, ...props }) {
  return (
    <ConditionalCardWrapper includeCard={includeCard} title='Activity' {...props}>
      {timeline
        ? (
          <ul role="list" className="space-y-6">
            {timeline.map((session, i) => (
              <li key={session.id} className="relative flex gap-x-4">
                <div className={`${i === timeline.length - 1 ? 'h-6' : '-bottom-6'} absolute left-0 top-0 flex w-6 justify-center`}>
                  <div className="w-px bg-gray-200" />
                </div>
                <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                </div>
                <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                  <SessionTimelineItem session={session} />
                </p>
                <time dateTime={session.occurred_at} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                  {dateFormatter(session.occurred_at)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <Skeleton className='h-8 w-12' />
            <Skeleton className='h-8 w-12' />
            <Skeleton className='h-8 w-12' />
            <Skeleton className='h-8 w-12' />
          </>
        )
      }
    </ConditionalCardWrapper>
  )
}