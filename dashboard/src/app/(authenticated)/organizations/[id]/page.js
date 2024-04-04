'use client'

import { useEffect, useState } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ItemizedList from "@/components/Dashboards/Components/ItemizedList";
import BarList from "@/components/Dashboards/Components/BarList";
import Breadcrumbs from "@/components/Breadcrumbs";
import { prettyDateTime } from "@/lib/utils/timeHelpers";
import { humanizeVariable } from "@/lib/utils/misc";
import ProfileTags from "@/components/Profiles/ProfileTags";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import EventFeed from "@/components/Dashboards/Components/EventFeed";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import { Skeleton } from "@/components/ui/skeleton";
import { setStateFromTimeseriesResponse } from "@/lib/utils/timeseriesHelpers";

const OrgProfileCard = ({ orgData, ...props }) => {
  if (!orgData) {
    return (
      <Card className={`overflow-hidden ${props.className}`} {...props}>
        <CardHeader>
          <div className='flex items-center'>
            <Skeleton className="h-16 w-16 mr-4" />
            <div>
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-t border-slate-100 w-full" />
          <div className="mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="px-4 py-2 grid grid-cols-2">
                <dt><Skeleton className='h-8 w-28' /></dt>
                <dd className="text-right"><Skeleton className='h-8 w-36' /></dd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const metadataKeysToDisplay = Object.keys(orgData.metadata || {}).filter(key => !['name'].includes(key))
  return (
    <Card className={`overflow-hidden ${props.className}`} {...props}>
      <CardHeader>
        <div className='flex items-center'>
          <Avatar className="h-16 w-16 mr-4 border border-slate-200">
            {orgData.avatarUrl
              ? <AvatarImage src={orgData.avatarUrl} alt="Avatar" />
              : <AvatarFallback className="text-lg">{(orgData.name || orgData.id || '').split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
            }
          </Avatar>
          <div>
            <CardTitle className='text-2xl'>
              {orgData.name || orgData?.organization_unique_identifier}
            </CardTitle>
            {orgData.domain && (
              <CardDescription className='text-base text-gray-500'>
                {orgData.domain}
              </CardDescription>
            )}
            {(orgData.tags || []).length > 0 && (
              <div className='mt-4'>
                <ProfileTags profileTags={orgData.tags} />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-t border-slate-100 w-full" />
        <div className="mt-4">
          <div className="px-4 py-2 grid grid-cols-2">
            <dt className="text-sm font-medium leading-6 text-gray-900">First Seen At</dt>
            <dd className="text-sm leading-6 text-gray-700 text-right">{prettyDateTime(orgData.created_at)}</dd>
          </div>
          <div className="px-4 py-2 grid grid-cols-2">
            <dt className="text-sm font-medium leading-6 text-gray-900">Users</dt>
            <dd className="text-sm leading-6 text-gray-700 text-right">{orgData.analytics_user_profiles.length}</dd>
          </div>
          {metadataKeysToDisplay.map((metadataKey, i) => (
            <div className="px-4 py-2 grid grid-cols-2" key={i}>
              <dt className="text-sm font-medium leading-6 text-gray-900">{humanizeVariable(metadataKey)}</dt>
              <dd className="text-sm leading-6 text-gray-700 text-right">{orgData.metadata[metadataKey]}</dd>
            </div>
          ))}
          {Object.keys(orgData.enriched_data || {}).map((enrichmentKey, i) => (
            <div className="px-4 py-2 grid grid-cols-2" key={i}>
              <dt className="text-sm font-medium leading-6 text-gray-900">{humanizeVariable(enrichmentKey)}</dt>
              <dd className="text-sm leading-6 text-gray-700 text-right">{orgData.enriched_data[enrichmentKey]}</dd>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const OrganizationProfile = ({ params }) => {
  const { id } = params;
  const [recentEvents, setRecentEvents] = useState();
  const [isFetching, setIsFetchingData] = useState(false);
  const [organizationData, setOrganizationData] = useState();
  const [pageHitData, setPageViewData] = useState();
  const [sessionsTimeseriesData, setSessionsTimeseriesData] = useState();
  const [topUsers, setTopUsers] = useState();

  const breadcrumbPaths = [
    {
      title: 'Organizations',
      url: '/organizations'
    },
    {
      title: organizationData ? organizationData.name || `Unknown Org: ${organizationData.id.split('-')[0]}` : <Skeleton className='w-44 h-6' />,
      url: null
    }
  ]

  const getAllData = async () => {
    setIsFetchingData(true);
    setPageViewData();
    setOrganizationData();
    setTopUsers();
    setRecentEvents();
    setSessionsTimeseriesData();
    const [org, users, pageViews, events, sessionsTimeseries] = await Promise.all([
      SwishjamAPI.Organizations.retrieve(id),
      SwishjamAPI.Organizations.Users.list(id),
      SwishjamAPI.Organizations.PageViews.list(id),
      SwishjamAPI.Organizations.Events.list(id, { limit: 5 }),
      SwishjamAPI.Organizations.Sessions.timeseries(id),
    ]);
    const formattedPageViewData = pageViews.map(pageView => ({ name: pageView.url, value: pageView.count }));
    setOrganizationData(org);
    setPageViewData(formattedPageViewData);
    setTopUsers(users);
    setRecentEvents(events);
    setStateFromTimeseriesResponse(sessionsTimeseries, setSessionsTimeseriesData);
    setIsFetchingData(false);
  }

  useEffect(() => {
    getAllData()
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <div className='grid grid-cols-4'>
        <div className='col-span-3'>
          <Breadcrumbs paths={breadcrumbPaths} />
        </div>
        <div className='col-span-1 text-right'>
          <Button variant='ghost' disabled={isFetching} onClick={getAllData}>
            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin cursor-disabled' : ''}`} />
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-10 gap-4 mt-8'>
        <div className='col-span-4 space-y-4'>
          <OrgProfileCard orgData={organizationData} />
        </div>
        <div className='col-span-6 space-y-4'>
          <LineChartWithValue title='Sessions' timeseries={sessionsTimeseriesData?.timeseries} />
          <ItemizedList
            title='Top Users'
            items={topUsers}
            titleFormatter={user => user.full_name || user.email || user.user_unique_identifier}
            subTitleFormatter={user => user.full_name ? user.email : null}
            fallbackAvatarGenerator={item => (item.full_name || item.email || item.user_unique_identifier.slice(0, 3)).split(' ').map(word => word[0]).join('').toUpperCase()}
            linkFormatter={user => `/users/${user.id}`}
          />
          <BarList title='Top pages' items={pageHitData} />
          <EventFeed
            events={recentEvents}
            initialLimit={5}
            includeDateSeparators={true}
            leftItemHeaderKey='name'
            leftItemSubHeaderFormatter={event => {
              if (event.name === 'page_view') {
                return JSON.parse(event.properties).url
              } else if (event.name === 'click') {
                return JSON.parse(event.properties).clicked_text || JSON.parse(event.properties).clicked_id || JSON.parse(event.properties).clicked_class
              } else if (event.name === 'form_submit') {
                return JSON.parse(event.properties).form_id || JSON.parse(event.properties).form_action || JSON.parse(event.properties).form_class
              }
            }}
            loadMoreEventsIncrement={5}
            noDataMsg="No events triggered in the last 30 days."
            rightItemKey='occurred_at'
            rightItemKeyFormatter={date => new Date(date).toLocaleTimeString('en-us', { hour: 'numeric', minute: "2-digit", second: "2-digit" })}
            title='Recent Events'
            viewAllLink={`/organizations/${id}/events`}
          />
        </div>
      </div>
    </main>
  )
}

export default OrganizationProfile;