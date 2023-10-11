'use client'

import { useEffect, useState } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EventFeed from "@/components/DashboardComponents/EventFeed";
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
import BarListCard from "@/components/DashboardComponents/BarListCard";
import PowerUserBadge from "./PowerUserBadge";
import ChurnWarningUserBadge from "./ChurnWarningUserBadge";

const LoadingState = () => (
  <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
    <BreadCrumbs userName={<Skeleton className='h-6 w-48' />} />
    <div className='grid grid-cols-10 gap-4 mt-4'>
      <Card className='col-span-6'>
        <CardHeader>
          <div className='flex items-center'>
            <Skeleton className='rounded-full h-20 w-20 mr-4' />
            <div>
              <Skeleton className='h-12 w-24' />
              <Skeleton className='h-6 w-48 mt-2' />
            </div>
          </div>
        </CardHeader>
      </Card>
      <EventFeed className="col-span-4" title='Recent Events' />
    </div>
  </main>
)

const BreadCrumbs = ({ userName }) => (
  <div>
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div className="flex items-center">
            <a href='/users' className="text-sm font-medium text-gray-500 hover:text-swishjam duration-300 transition">Users</a>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <svg
              className="h-5 w-5 flex-shrink-0 text-gray-900"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
            <a href='#' className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{userName}</a>
          </div>
        </li>
      </ol>
    </nav>
  </div>
)

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

  return (
    userData ? (
      <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
        <BreadCrumbs userName={userData.full_name || `Anonymous User: `} />
        <div className='grid grid-cols-10 gap-4 mt-8'>
          <Card className='col-span-4 relative'>
            <CardHeader>
              <div className='grid grid-cols-2 items-center'>
                <div className='flex items-center'>
                  <Avatar className="h-16 w-16 mr-4">
                    {userData.avatar_url
                      ? <AvatarImage src={userData.avatar_url} alt="Avatar" />
                      : <AvatarFallback className="text-lg">{userData.initials}</AvatarFallback>
                    }
                  </Avatar>
                  <div>
                    {false ? <PowerUserBadge className="absolute top-5 right-5" size={8}/>:''}
                    {true ? <ChurnWarningUserBadge className="absolute top-5 right-5" size={8} />:''}
                    <CardTitle className='text-2xl'>
                      {userData.full_name}
                    </CardTitle>
                    <CardDescription className='text-base text-gray-500'>
                      {userData.email}
                    </CardDescription>
                  </div>
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
                      <dd className="text-sm leading-6 text-gray-700 text-right">{userData?.full_name}</dd>
                    </div>
                    <div className="px-4 py-2 col-span-1 grid grid-cols-2 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Organizations</dt>
                      <dd className="text-sm leading-6 text-gray-700 text-right flex flex-col">
                        {userData.organizations.map((org, i) => (
                          <div>
                            <a key={org.id} href={`/organizations/${org.id}`} className={`${i > 0 ? 'mt-2':''} inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:underline`}>
                            {org.name}
                            </a>
                          </div> 
                        ))}
                      </dd>
                    </div>
                    <>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Plan/Subscription Type</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {'Paid'}
                          </span>   
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Plan/Subscription Value</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {'$20/mo'}
                          </span>   
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Role</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">{'CEO'}</dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Title</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">{'Co-founder, CEO'}</dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Twitter Handle</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">
                          <a
                            className="hover:underline hover:text-blue-400 transition duration-500"
                            href={`https://twitter.com/zzimbler`}
                          >{'@zzimbler'}
                          </a>
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Linkedin</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right"><a href={`https://www.linkedin.com/in/zzimbler`}>{'Profile Link'}</a></dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Company</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">{'Wedget Co.'}</dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Location</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">{'San Francisco, CA'}</dd>
                      </div>
                      <div className="my-4 border-t border-slate-100 w-full" />
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Additional Data</dt>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900"></dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">No additional data</dd>
                      </div>
                      <div className="my-4 border-t border-slate-100 w-full" />
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Connected Apps</dt>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900"></dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">No additional data</dd>
                      </div>
                    </>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>


          <div className="col-span-6">
            <LineChartWithValue
              title='Activity'
              value={sessionTimeseriesData?.value}
              timeseries={sessionTimeseriesData?.timeseries}
              valueFormatter={numSessions => numSessions.toLocaleString('en-US')}
            />
            <BarListCard className="mt-4" title='Page Views' items={pageViewsData} />
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
    ) : <LoadingState />
  )
}

export default UserProfile;
                        /*{userData.organizations.length > 1 && (
                          <span 
                            className='cursor-pointer underline ml-2 hover:text-swishjam'
                            onClick={() => setOrganizationsListExpanded(!organizationsListExpanded)}
                          >+{userData.organizations.length - 1} others</span>
                        )}
                        {organizationsListExpanded && (
                          <div className='mt-2'>
                            {userData.organizations.slice(1).map(org => (
                              <div key={org.id} className='flex items-center'>
                                <a href={`/organizations/${org.id}`} className='text-sm text-gray-700 hover:underline'>
                                  {org.name}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}*/