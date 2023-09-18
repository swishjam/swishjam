'use client'

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import { API } from "@/lib/api-client/base";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EventFeed from "@/components/DashboardComponents/EventFeed";
import { HomeIcon } from '@heroicons/react/20/solid'
import Link from "next/link";
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
    API.get(`/api/v1/users/${userId}`).then(setUserData);
    API.get(`/api/v1/users/${userId}/events`).then(setRecentEvents);
    API.get(`/api/v1/users/${userId}/page_views`).then(pageViews => {
      setPageViewsData(pageViews.map(({ url, count }) => ({ name: url, value: count })));
    });
    API.get(`/api/v1/users/${userId}/sessions/timeseries`).then(({ timeseries }) => {
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
                    <div className="px-4 py-4 sm:col-span-2 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Organizations</dt>
                      <dd className="mt-1 sm:mt-2 -ml-2">
                        {userData.organizations.map(org => (
                          <LinkBadge
                            key={org.id}
                            name={org.name}
                            href={`/organizations/${org.id}`}
                          /> 
                        ))}
                  
                        {/*userData.organizations.length > 1 && (
                          <span 
                            className='cursor-pointer underline ml-2 hover:text-swishjam'
                            onClick={() => setOrganizationsListExpanded(!organizationsListExpanded)}
                          >+{userData.organizations.length - 1} others</span>
                        )*/}
                        {/*organizationsListExpanded && (
                          <div className='mt-2'>
                            {userData.organizations.slice(1).map(org => (
                              <div key={org.id} className='flex items-center'>
                                <a href={`/organizations/${org.id}`} className='text-sm text-gray-700 hover:underline'>
                                  {org.name}
                                </a>
                              </div>
                            ))}
                          </div>
                        )*/}
                      </dd>
                    </div>
                    {/* <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Email address</dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">margotfoster@example.com</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Salary expectation</dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">$120,000</dd>
                    </div> */}
                    {/* <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Attachments</dt>
                      <dd className="mt-2 text-sm text-gray-900">
                        <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                          <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                            <div className="flex w-0 flex-1 items-center">
                              <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                <span className="truncate font-medium">resume_back_end_developer.pdf</span>
                                <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Download
                              </a>
                            </div>
                          </li>
                          <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                            <div className="flex w-0 flex-1 items-center">
                              <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                <span className="truncate font-medium">coverletter_back_end_developer.pdf</span>
                                <span className="flex-shrink-0 text-gray-400">4.5mb</span>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Download
                              </a>
                            </div>
                          </li>
                        </ul>
                      </dd>
                    </div> */}
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

export default AuthenticatedView(UserProfile, LoadingState);