'use client'

import { useEffect, useState } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EventFeed from "@/components/DashboardComponents/EventFeed";
import LineChartWithValue from '@/components/DashboardComponents/LineChartWithValue';
import BarListCard from "@/components/DashboardComponents/BarListCard";

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
              className="h-5 w-5 flex-shrink-0 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
            <a href='/users' className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">Users</a>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <svg
              className="h-5 w-5 flex-shrink-0 text-gray-300"
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
    SwishjamAPI.Users.get(userId).then(setUserData);
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
        <BreadCrumbs userName={userData.full_name} />
        <div className='grid grid-cols-10 gap-4 mt-4'>
          <Card className='col-span-6'>
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
              <div>
                <div className="mt-4">
                  <dl className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="px-4 py-4 sm:col-span-1 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Full name</dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{userData?.full_name}</dd>
                    </div>
                    <div className="px-4 py-4 sm:col-span-1 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Organizations</dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
                        {userData.organizations.map(org => (
                          <a className='hover:underline hover:text-blue-700' key={org.id} href={`/organizations/${org.id}`}>{org.name}</a> 
                        ))}
                  
                        {userData.organizations.length > 1 && (
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
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>


          <div className="col-span-4">
            <LineChartWithValue
              title='Sessions'
              value={sessionTimeseriesData?.value}
              timeseries={sessionTimeseriesData?.timeseries}
              valueFormatter={numSessions => numSessions.toLocaleString('en-US')}
            />
          </div>
          <div className="col-span-5">
            <BarListCard title='Page Views' items={pageViewsData} />
          </div>
          <EventFeed
            className="col-span-5"
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
      </main>
    ) : <LoadingState />
  )
}

export default UserProfile;