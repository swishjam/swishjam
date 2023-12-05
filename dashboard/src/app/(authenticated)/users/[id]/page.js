'use client'

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import BarList from "@/components/Dashboards/Components/BarList";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ChurnWarningUserBadge from "./ChurnWarningUserBadge";
import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";
import EnrichedDataItem from "@/components/Profiles/EnrichedDataItem";
import EventFeed from "@/components/Dashboards/Components/EventFeed";
import LoadingView from "./LoadingView";
import LineChartWithValue from '@/components/Dashboards/Components/LineChartWithValue';
import PowerUserBadge from "./PowerUserBadge";
import { safelyParseURL } from "@/lib/utils/misc";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";


const dateFormatter = dateFormatterForGrouping('minute')

const UserProfile = ({ params }) => {
  const { id: userId } = params;
  const [userData, setUserData] = useState();
  const [sessionTimeseriesData, setSessionTimeseriesData] = useState();
  const [recentEvents, setRecentEvents] = useState();
  const [pageViewsData, setPageViewsData] = useState();
  const [organizationsListExpanded, setOrganizationsListExpanded] = useState(false);

  useEffect(() => {
    SwishjamAPI.Users.retrieve(userId).then(setUserData);
    SwishjamAPI.Users.Events.list(userId).then(setRecentEvents);
    SwishjamAPI.Users.PageViews.list(userId).then(pageViews => {
      setPageViewsData(pageViews.map(({ url, count }) => ({ name: url, value: count })));
    });
    SwishjamAPI.Users.Sessions.timeseries(userId).then(({ timeseries }) => {
      setSessionTimeseriesData({
        timeseries,
        value: timeseries.map(({ value }) => value).reduce((a, b) => a + b, 0),
      })
    });
  }, [])

  const breadcrumbPaths = [
    {
      title: 'Users',
      url: '/users'
    },
    {
      title: userData?.full_name || userData?.email || `Un-named User: ${userData?.user_unique_identifier}`,
      url: null
    }
  ]

  return (
    userData ? (
      <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
        <Breadcrumbs paths={breadcrumbPaths} />
        <div className='grid grid-cols-10 gap-4 mt-8'>
          <Card className='col-span-4 relative'>
            <CardHeader>
              <div className='flex items-center'>
                <Avatar className="h-16 w-16 mr-4 border border-slate-200">
                  {userData.avatar_url
                    ? <AvatarImage src={userData.avatar_url} alt="Avatar" />
                    : <AvatarFallback className="text-lg">{userData.initials}</AvatarFallback>
                  }
                </Avatar>
                <div>
                  {userData.poweruser ? <PowerUserBadge className="absolute top-5 right-5" size={8} /> : ''}
                  {userData.churnwarning ? <ChurnWarningUserBadge className="absolute top-5 right-5" size={8} /> : ''}
                  <CardTitle className='text-2xl'>
                    {userData.full_name || userData.email}
                  </CardTitle>
                  {userData.full_name && (
                    <CardDescription className='text-base text-gray-500'>
                      {userData.email}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-t border-slate-100 w-full" />
              <div>
                <div className="mt-4">
                  <dl className="grid grid-cols-1">
                    <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Full name</dt>
                      <dd className="text-sm leading-6 text-gray-700 text-right">
                        {userData.full_name || (userData.enrichment_data.first_name || '') + (userData.enrichment_data.last_name || '')}
                      </dd>
                    </div>
                    <div className="px-4 py-2 col-span-1 grid grid-cols-2 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Registered at</dt>
                      <dd className="text-sm leading-6 text-gray-700 text-right">
                        {dateFormatter(userData.created_at)}
                      </dd>
                    </div>
                    <div className="px-4 py-2 col-span-1 grid grid-cols-2 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Organizations</dt>
                      <dd className="text-sm leading-6 text-gray-700 text-right flex flex-col">
                        {userData.organizations.length === 0
                          ? '-'
                          : userData.organizations.map((org, i) => (
                            <div>
                              <a key={org.id} href={`/organizations/${org.id}`} className={`${i > 0 ? 'mt-2' : ''} inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:underline`}>
                                {org.name}
                              </a>
                            </div>
                          ))
                        }
                      </dd>
                    </div>
                    <>
                      <EnrichedDataItem
                        title='Initial Referrer'
                        enrichmentData={{ initial_referrer: userData?.immutable_metadata?.initial_referrer }}
                        enrichmentKey='initial_referrer'
                        formatter={referrer => referrer === '' ? 'Direct' : referrer}
                      />
                      <EnrichedDataItem
                        title='Initial Landing Page'
                        enrichmentData={{ initial_url: userData?.immutable_metadata?.initial_url }}
                        enrichmentKey='initial_url'
                        formatter={url => (
                          <a
                            className="hover:underline hover:text-blue-400 transition duration-500 flex items-center justify-end"
                            href={url}
                            target="_blank"
                          >
                            {url}
                            <ArrowTopRightOnSquareIcon className='inline-block ml-1 h-3 w-3' />
                          </a>
                        )}
                      />
                      <EnrichedDataItem
                        title='Plan/Subscription Type'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='subscription_plan'
                        formatter={val => (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {val}
                          </span>
                        )}
                      />
                      <EnrichedDataItem
                        title='Plan/Subscription Value'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='subscription_value'
                        formatter={val => (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {val}
                          </span>
                        )}
                      />
                      <EnrichedDataItem
                        title='Role'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='job_title'
                      />
                      <EnrichedDataItem
                        title='Twitter Profile'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='twitter_url'
                        formatter={url => (
                          <a
                            className="hover:underline hover:text-blue-400 transition duration-500"
                            href={url}
                            target="_blank"
                          >
                            {(safelyParseURL(url).pathname?.split('/') || ['', url])[1]}
                          </a>
                        )}
                      />
                      <EnrichedDataItem
                        title='LinkedIn Profile'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='linkedin_url'
                        formatter={url => (
                          <a
                            className="hover:underline hover:text-blue-400 transition duration-500 flex items-center justify-end"
                            href={`https://${url}`}
                            target="_blank"
                          >
                            {(safelyParseURL(`https://${url}`).pathname?.split('/') || ['', '', url])[2]}
                            <ArrowTopRightOnSquareIcon className='inline-block ml-1 h-3 w-3' />
                          </a>
                        )}
                      />
                      <EnrichedDataItem
                        title='Company'
                        enrichmentData={userData.enrichment_data}
                        enrichmentKey='company_name'
                        formatter={name => {
                          if (userData.enrichment_data.company_website) {
                            return (
                              <a
                                className="hover:underline hover:text-blue-400 transition duration-500 flex items-center justify-end"
                                href={`https://${userData.enrichment_data.company_website}`}
                                target="_blank"
                              >
                                {name}
                                <ArrowTopRightOnSquareIcon className='inline-block ml-1 h-3 w-3' />
                              </a>
                            )
                          } else {
                            return name;
                          }
                        }}
                      />
                      <EnrichedDataItem title='Company Size' enrichmentData={userData.enrichment_data} enrichmentKey='company_size' />
                      <EnrichedDataItem title='Industry' enrichmentData={userData.enrichment_data} enrichmentKey='company_industry' />
                      <EnrichedDataItem title='Location' enrichmentData={userData.enrichment_data} enrichmentKey='company_location_metro' />

                      <div className="my-4 border-t border-slate-100 w-full" />
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Attributes</dt>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900"></dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">
                          {userData.metadata
                            ? (
                              Object.keys(userData.metadata).map(key => (
                                <span className='block'>{key}: {userData.metadata[key]}</span>
                              ))
                            )
                            : 'No attributes provided.'}
                        </dd>
                      </div>
                      {/* <div className="my-4 border-t border-slate-100 w-full" />
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Connected Apps</dt>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900"></dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">No additional data</dd>
                      </div> */}
                    </>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>


          <div className="col-span-6">
            <LineChartWithValue
              title='Sessions'
              value={sessionTimeseriesData?.value}
              timeseries={sessionTimeseriesData?.timeseries}
              valueFormatter={numSessions => numSessions.toLocaleString('en-US')}
            />
            <BarList className="mt-4" title='Page Views' items={pageViewsData} />
            <EventFeed
              className="col-span-6 mt-4"
              title='Recent Events'
              events={recentEvents}
              leftItemHeaderKey='name'
              rightItemKey='occurred_at'
              initialLimit={5}
              loadMoreEventsIncrement={5}
              rightItemKeyFormatter={date => {
                return new Date(date)
                  .toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })
                  .replace(`, ${new Date(date).getFullYear()}`, '')
              }}
            />
          </div>
        </div>
      </main>
    ) : <LoadingView />
  )
}

export default UserProfile;