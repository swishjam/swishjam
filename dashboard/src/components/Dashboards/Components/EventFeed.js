import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@components/EmptyState"
import { HiCursorArrowRays } from 'react-icons/hi2'
import Image from "next/image"
import { useState } from "react"

import {
  BanIcon,
  MailIcon,
  MailWarningIcon,
  MailCheckIcon,
  MailOpenIcon,
  MousePointerClickIcon,
  PiggyBankIcon,
  ReceiptIcon,
} from "lucide-react";

import CalComLogo from '@public/logos/calcom.png'
import GoogleSearchConsoleLogo from '@public/logos/Google-Search-Console.png'
// import HubspotLogo from '@public/logos/hubspot.jpeg';
import ResendLogo from '@public/logos/resend.png'
// import SalesforceLogo from '@public/logos/salesforce.png'
import StripeLogo from '@public/logos/stripe.jpeg'
import SwishjamLogo from '@public/logos/swishjam.png'
// import ZendeskLogo from '@public/logos/Zendesk.webp'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const EVENT_ICON_DICT = {
  'resend.email.sent': <MailIcon className="h-4 w-4 text-gray-400" />,
  'resend.email.bounced': <MailWarningIcon className="h-4 w-4 text-red-400" />,
  'resend.email.complained': <MailWarningIcon className="h-4 w-4 text-red-400" />,
  'resend.email.delivered': <MailCheckIcon className="h-4 w-4 text-green-400" />,
  'resend.email.opened': <MailOpenIcon className="h-4 w-4 text-green-400" />,
  'resend.email.clicked': <MousePointerClickIcon className="h-4 w-4 text-green-400" />,
  'stripe.charge.succeeded': <PiggyBankIcon className="h-4 w-4 text-green-400" />,
  'stripe.subscription.created': <ReceiptIcon className="h-4 w-4 text-green-400" />,
  'stripe.charge.failed': <BanIcon className="h-4 w-4 text-red-400" />,
}

const DATA_SOURCE_IMG_SRC_DICT = {
  'cal': CalComLogo,
  'stripe': StripeLogo,
  'resend': ResendLogo,
}


const iconForEvent = event => {
  const eventIcon = EVENT_ICON_DICT[event.name];
  const dataSource = event.name.split('.')[0];
  const dataSourceIconUrl = DATA_SOURCE_IMG_SRC_DICT[dataSource];
  if (eventIcon) {
    return <div className='relative rounded-full w-fit flex items-center p-1 bg-gray-100'>
      {eventIcon}
      {dataSourceIconUrl && (
        <Image src={dataSourceIconUrl} className='h-4 w-4 rounded-full absolute left-[-10px] top-[-10px] z-10 border border-gray-200' />
      )}
    </div>
  }
}

const EventFeed = ({
  className,
  events,
  initialLimit = 5,
  leftItemHeaderKey,
  loadMoreEventsIncrement = 1,
  noDataMsg = 'No events triggered.',
  rightItemKey,
  rightItemKeyFormatter = value => value,
  subTitle,
  title,
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
              <EmptyState msg={noDataMsg} border={true} icon={<HiCursorArrowRays className="mx-auto h-12 w-12 text-gray-300 group-hover:animate-pulse" />} />
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
                    {iconForEvent(event) || <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />}
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
                className={`${events.length > eventCount ? 'opacity-100' : 'hidden'} mt-10 w-full transition duration-1000 ease-out`}
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