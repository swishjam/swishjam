import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@components/EmptyState"
import { HiCursorArrowRays } from 'react-icons/hi2'
import Image from "next/image"
import { useState } from "react"

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
  BotIcon,
  ArrowUpIcon,
  SparklesIcon,
} from "lucide-react";

import CalComLogo from '@public/logos/calcom.png'
import IntercomLogo from '@public/logos/intercom.png'
import ResendLogo from '@public/logos/resend.png'
import StripeLogo from '@public/logos/stripe.jpeg'
import { Skeleton } from "@/components/ui/skeleton"
import { MaybeExternalLink } from "@/components/utils/MaybeExternalLink"
import Link from "next/link"

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const EVENT_ICON_DICT = {
  'new_session': <PanelTopIcon className='h-4 w-4 text-swishjam' />,
  'page_view': <GlobeIcon className='h-4 w-4 text-swishjam' />,
  'click': <PointerIcon className='h-4 w-4 text-swishjam' />,
  'form_submit': <FormInputIcon className='h-4 w-4 text-swishjam' />,
  'swishjam_bot': <BotIcon className='h-4 w-4 text-swishjam' />,
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

const RecursivePropertiesDisplay = ({ properties, linkToUrls = true }) => {
  if (!properties) return <></>
  return (
    <>
      {Object.keys(properties).map((key, i) => {
        const value = properties[key];
        if (typeof value === 'object' && value !== null && value !== undefined) {
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
              <div className="text-gray-900">
                {linkToUrls && key === 'url' && value
                  ? (
                    <MaybeExternalLink href={value} onClick={e => e.stopPropagation()}>
                      {value}
                    </MaybeExternalLink>
                  ) : value === undefined || value === null ? <span className='italic text-gray-700'>{'undefined'}</span> : value.toString()
                }
              </div>
            </div>
          )
        }
      })}
    </>
  )
}

const EventFeedItem = ({ event, onExpandClick, isExpanded, isExpandable, leftItemHeaderKey, rightItemKey, rightItemKeyFormatter, leftItemSubHeaderFormatter, isLastItem = false }) => {
  const properties = JSON.parse(event.properties);

  return (
    <li
      key={event.id}
      className={`relative ${isExpandable ? 'hover:bg-gray-50 rounded-md py-2 pr-2 cursor-pointer' : ''}`}
      onClick={() => isExpandable && onExpandClick()}
    >
      <div className="flex gap-x-4">
        <div className={classNames(isLastItem ? 'h-10' : '-bottom-6', 'absolute left-0 top-0 flex w-6 justify-center')}>
          <div className="w-px bg-gray-200" />
        </div>
        <div className="relative flex h-6 w-6 flex-none items-center justify-center">
          {iconForEvent(event) || <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />}
        </div>
        <div className={classNames("flex flex-auto py-0.5 text-xs leading-5 items-center space-x-1", event.isHighlighted ? 'text-swishjam font-medium' : 'text-gray-900')}>
          <ChevronRightIcon className={classNames('h-3 w-3 transition-transform', isExpanded ? 'rotate-90' : '')} />
          <span className='font-medium'>{event[leftItemHeaderKey]}</span>
          {leftItemSubHeaderFormatter && (
            <span className={classNames("ml-2", event.isHighlighted ? 'text-swishjam font-medium' : 'text-gray-400')}>
              {leftItemSubHeaderFormatter(event)}
            </span>
          )}
        </div>
        <span className={classNames("flex-none py-0.5 text-xs leading-5", event.isHighlighted ? 'text-swishjam font-medium' : "text-gray-500")}>
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
  className = '',
  isExpandable = true,
  displayShowMoreButton = true,
  events,
  includeDateSeparators = false,
  initialLimit,
  leftItemHeaderKey = "name",
  leftItemSubHeaderFormatter = event => {
    if (event.name === 'page_view') {
      return JSON.parse(event.properties).url
    } else if (event.name === 'click') {
      return JSON.parse(event.properties).clicked_text || JSON.parse(event.properties).clicked_id || JSON.parse(event.properties).clicked_class
    } else if (event.name === 'form_submit') {
      return JSON.parse(event.properties).form_id || JSON.parse(event.properties).form_action || JSON.parse(event.properties).form_class
    }
  },
  loadMoreEventsIncrement = 1,
  noDataMsg = 'No events triggered.',
  rightItemKey = "occurred_at",
  rightItemKeyFormatter = date => new Date(date).toLocaleTimeString('en-us', { hour: 'numeric', minute: "2-digit", second: "2-digit" }),
  subTitle,
  title,
  viewAllLink,
}) => {
  const [expandedEvents, setExpandedEvents] = useState([]);
  const [eventCount, setEventCount] = useState(initialLimit);
  let currentDay = null;

  const toggleEventExpansion = eventId => {
    if (expandedEvents.includes(eventId)) {
      setExpandedEvents(expandedEvents.filter(id => id !== eventId));
    } else {
      setExpandedEvents([...expandedEvents, eventId]);
    }
  }

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
              {Array.from({ length: initialLimit || 10 }).map((_, idx) => (
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
        {title && (
          <CardHeader>
            <CardTitle className="text-sm font-medium cursor-default">{title}</CardTitle>
            {subTitle && <CardDescription>{subTitle}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className={title ? '' : 'py-6'}>
          <div className="flow-root">
            {events && events.length === 0 && (
              <EmptyState msg={noDataMsg} border={true} icon={<HiCursorArrowRays className="mx-auto h-12 w-12 text-gray-300 group-hover:animate-pulse" />} />
            )}
            <ul role="list" className={isExpandable ? '' : "space-y-6"}>
              {events && (initialLimit ? events.slice(0, eventCount) : events).map((event, eventIdx) => {
                const thisEventsDay = new Date(event.occurred_at).toLocaleDateString('en-us', { month: "long", day: "numeric", year: "numeric" });
                const showDayHeader = includeDateSeparators && thisEventsDay !== currentDay;
                currentDay = thisEventsDay;
                const isLastItem = eventIdx === events.length - 1 || thisEventsDay !== new Date(events[eventIdx + 1].occurred_at).toLocaleDateString('en-us', { month: "long", day: "numeric", year: "numeric" });
                const isLastHighlightedItem = event.isHighlighted && events[eventIdx + 1] && !events[eventIdx + 1].isHighlighted;
                return (
                  <>
                    {showDayHeader && (
                      <li key={`header-${event.uuid || eventIdx}`} className={`relative flex gap-x-4 mb-2 ${eventIdx > 0 ? 'mt-8' : ''}`}>
                        <p className="flex-auto py-0.5 text-sm leading-5">
                          <span className="font-medium text-gray-900">{thisEventsDay}</span>
                        </p>
                      </li>
                    )}
                    <EventFeedItem
                      key={event.uuid || eventIdx}
                      event={event}
                      isLastItem={isLastItem}
                      isExpandable={isExpandable}
                      isExpanded={expandedEvents.includes(event.uuid || eventIdx)}
                      leftItemHeaderKey={leftItemHeaderKey}
                      onExpandClick={() => toggleEventExpansion(event.uuid || eventIdx)}
                      rightItemKey={rightItemKey}
                      rightItemKeyFormatter={rightItemKeyFormatter}
                      leftItemSubHeaderFormatter={leftItemSubHeaderFormatter}
                    />
                    {isLastHighlightedItem && (
                      <li key={`highlighted-${event.uuid || eventIdx}`}>
                        <div className="border-b-2 border-swishjam h-0 relative">
                          <div className='absolute left-0 right-0 mx-auto flex items-center rounded-b-md bg-swishjam text-white text-xs font-medium px-1 py-0.5 w-fit z-10'>
                            <SparklesIcon className='h-3 w-3 mr-1' />
                            New Events
                            <ArrowUpIcon className='h-3 w-3 ml-1' />
                          </div>
                        </div>
                      </li>
                    )}
                  </>
                )
              })}
            </ul>

            {events && displayShowMoreButton && (
              events.length > eventCount
                ? (
                  <Button
                    onClick={() => setEventCount(eventCount + loadMoreEventsIncrement)}
                    variant="outline"
                    className='mt-10 w-full'
                  >
                    Show More Events
                  </Button>
                ) : viewAllLink && events.length > 0 && (
                  <Link href={viewAllLink} className={`w-full mt-10 ${buttonVariants({ variant: 'outline' })}`}>
                    View All Events
                  </Link>
                )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EventFeed;