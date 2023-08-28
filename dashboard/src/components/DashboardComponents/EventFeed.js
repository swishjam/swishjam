import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const EventFeed = ({ 
  title, 
  subTitle,
  events, 
  leftItemHeaderKey, 
  leftItemSubHeaderKey, 
  rightItemKey, 
  rightItemKeyFormatter = value => value, 
  noDataMsg = 'No events triggered.'
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {subTitle && <CardDescription>{subTitle}</CardDescription>}
    </CardHeader>
    <CardContent>
      <div className="flow-rzzoot">
        {events && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-gray-500">{noDataMsg}</p>
          </div>
        )}
        <ul role="list" className="space-y-6">
          {events && events.map((event, eventIdx) => (
            <li key={event.id} className="relative flex gap-x-4">
              <div
                className={classNames(
                  eventIdx === events.length - 1 ? 'h-6' : '-bottom-6',
                  'absolute left-0 top-0 flex w-6 justify-center'
                )}
              >
                <div className="w-px bg-gray-200" />
              </div>
              <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
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
      </div>
    </CardContent>
  </Card>
)

export default EventFeed;