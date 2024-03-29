import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@components/EmptyState"
import { HiCursorArrowRays } from 'react-icons/hi2'
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import {
  BanIcon,
  FormInputIcon,
  GlobeIcon,
  MailIcon,
  MailWarningIcon,
  MailCheckIcon,
  MailOpenIcon,
  MessageSquareIcon,
  MousePointerClickIcon,
  PiggyBankIcon,
  ReceiptIcon,
  PanelTopIcon,
  PointerIcon,
  ZapIcon,
  ChevronRightIcon,
} from "lucide-react";

import CalComLogo from '@public/logos/calcom.png'
import IntercomLogo from '@public/logos/intercom.png'
import ResendLogo from '@public/logos/resend.png'
import StripeLogo from '@public/logos/stripe.jpeg'
// import SwishjamLogo from '@public/logos/swishjam.png'
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { AccordionOpen } from "@/components/ui/accordion"

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const EVENT_ICON_DICT = {
  'new_session': <PanelTopIcon className='h-4 w-4 text-swishjam' />,
  'page_view': <GlobeIcon className='h-4 w-4 text-swishjam' />,
  'click': <PointerIcon className='h-4 w-4 text-swishjam' />,
  'form_submit': <FormInputIcon className='h-4 w-4 text-swishjam' />,
  'intercom': <MessageSquareIcon className='h-4 w-4 text-gray-400' />,
  'resend.email.sent': <MailIcon className="h-4 w-4 text-gray-400" />,
  'resend.email.bounced': <MailWarningIcon className="h-4 w-4 text-red-400" />,
  'resend.email.complained': <MailWarningIcon className="h-4 w-4 text-red-400" />,
  'resend.email.delivered': <MailCheckIcon className="h-4 w-4 text-gray-400" />,
  'resend.email.opened': <MailOpenIcon className="h-4 w-4 text-gray-400" />,
  'resend.email.clicked': <MousePointerClickIcon className="h-4 w-4 text-gray-400" />,
  'stripe.charge.succeeded': <PiggyBankIcon className="h-4 w-4 text-gray-400" />,
  'stripe.subscription.created': <ReceiptIcon className="h-4 w-4 text-gray-400" />,
  'stripe.charge.failed': <BanIcon className="h-4 w-4 text-red-400" />,
}

const DATA_SOURCE_IMG_SRC_DICT = {
  'cal': CalComLogo,
  'intercom': IntercomLogo,
  'stripe': StripeLogo,
  'resend': ResendLogo,
}

const iconForEvent = event => {
  const dataSource = event.name.split('.')[0];
  const eventIcon = EVENT_ICON_DICT[event.name] || EVENT_ICON_DICT[dataSource] || <ZapIcon className="h-4 w-4 text-gray-400" />;
  const dataSourceIconUrl = DATA_SOURCE_IMG_SRC_DICT[dataSource];
  if (eventIcon) {
    return <div className='relative rounded-full w-fit flex items-center p-1 bg-gray-100'>
      {eventIcon}
      {dataSourceIconUrl && (
        <Image src={dataSourceIconUrl} className='h-4 w-4 rounded-full absolute left-[-8px] top-[-8px] z-10 border border-gray-200 bg-white' />
      )}
    </div>
  }
}

const RecursivePropertiesDisplay = ({ properties }) => {
  if (!properties) return <></>
  return (
    <>
      {Object.keys(properties).map((key, i) => {
        const value = properties[key];
        if (typeof value === 'object') {
          return (
            <div key={i} className="pt-1">
              <div className="text-gray-500">{key}:</div>
              <div className="ml-4">
                <RecursivePropertiesDisplay properties={value} />
              </div>
            </div>
          )
        } else {
          return (
            <div key={i} className="flex space-x-2 pt-1">
              <div className="text-gray-500">{key}:</div>
              <div className="text-gray-900">{value}</div>
            </div>
          )
        }
      })}
    </>
  )
}

const EventFeedItem = ({ event, isExpandable, leftItemHeaderKey, rightItemKey, rightItemKeyFormatter, leftItemSubHeaderFormatter, isLastItem = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const properties = JSON.parse(event.properties);

  return (
    <li
      key={event.id}
      className={`relative ${isExpandable ? 'hover:bg-gray-50 rounded-md py-2 pr-2 cursor-pointer' : ''}`}
      onClick={() => isExpandable && setIsExpanded(!isExpanded)}
    >
      <div className="flex gap-x-4">
        <div className={classNames(isLastItem ? 'h-10' : '-bottom-6', 'absolute left-0 top-0 flex w-6 justify-center')}>
          <div className="w-px bg-gray-200" />
        </div>
        <div className="relative flex h-6 w-6 flex-none items-center justify-center">
          {iconForEvent(event) || <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />}
        </div>
        <div className="flex flex-auto py-0.5 text-xs leading-5 items-center space-x-1">
          <ChevronRightIcon className={classNames('h-3 w-3 text-gray-900 transition-transform', isExpanded ? 'rotate-90' : '')} />
          <span className='font-medium text-gray-900'>{event[leftItemHeaderKey]}</span>
          {leftItemSubHeaderFormatter && (
            <span className="ml-2 text-gray-400">{leftItemSubHeaderFormatter(event)}</span>
          )}
        </div>
        <span className="flex-none py-0.5 text-xs leading-5 text-gray-500">
          {rightItemKeyFormatter(event[rightItemKey])}
        </span>
      </div>
      <div className={`px-12 py-2 ${isExpanded ? '' : 'hidden'}`}>
        <pre className="text-xs text-gray-500 whitespace-pre-wrap">
          <RecursivePropertiesDisplay properties={properties} />
        </pre>
      </div>
    </li>
  )
}

const EventFeed = ({
  className,
  isExpandable = true,
  events,
  includeDateSeparators = false,
  initialLimit = 5,
  leftItemHeaderKey,
  leftItemSubHeaderFormatter,
  loadMoreEventsIncrement = 1,
  noDataMsg = 'No events triggered.',
  rightItemKey,
  rightItemKeyFormatter = value => value,
  subTitle,
  title,
  viewAllLink,
}) => {
  const [eventCount, setEventCount] = useState(initialLimit);
  const router = useRouter();
  let currentDay = null;

  if (!events) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
            {subTitle && <CardDescription>{subTitle}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="flow-root">
              {Array.from({ length: initialLimit }).map((_, idx) => (
                <Skeleton className='w-full rounded h-6 m-2' key={idx} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              <EmptyState msg={noDataMsg} border={true} icon={<HiCursorArrowRays className="mx-auto h-12 w-12 text-gray-300 group-hover:animate-pulse" />} />
            )}
            <ul role="list" className={isExpandable ? '' : "space-y-6"}>
              {events && events.slice(0, eventCount).map((event, eventIdx) => {
                const thisEventsDay = new Date(event.occurred_at).toLocaleDateString('en-us', { month: "long", day: "numeric", year: "numeric" });
                const showDayHeader = includeDateSeparators && thisEventsDay !== currentDay;
                currentDay = thisEventsDay;
                const isLastItem = eventIdx === events.length - 1 || thisEventsDay !== new Date(events[eventIdx + 1].occurred_at).toLocaleDateString('en-us', { month: "long", day: "numeric", year: "numeric" });
                return (
                  <>
                    {showDayHeader && (
                      <li key={event.id} className={`relative flex gap-x-4 mb-2 ${eventIdx > 0 ? 'mt-8' : ''}`}>
                        <p className="flex-auto py-0.5 text-sm leading-5">
                          <span className="font-medium text-gray-900">{thisEventsDay}</span>
                        </p>
                      </li>
                    )}
                    <EventFeedItem
                      event={event}
                      isLastItem={isLastItem}
                      isExpandable={isExpandable}
                      leftItemHeaderKey={leftItemHeaderKey}
                      rightItemKey={rightItemKey}
                      rightItemKeyFormatter={rightItemKeyFormatter}
                      leftItemSubHeaderFormatter={leftItemSubHeaderFormatter}
                    />
                  </>
                )
              })}
            </ul>

            {events && events.length > eventCount
              ? (
                <Button
                  onClick={() => setEventCount(eventCount + loadMoreEventsIncrement)}
                  variant="outline"
                  className='mt-10 w-full'
                >
                  Show More Events
                </Button>
              ) : viewAllLink && (
                <Button
                  onClick={() => router.push(viewAllLink)}
                  variant="outline"
                  className='mt-10 w-full'
                >
                  View All Events
                </Button>
              )
            }
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EventFeed;