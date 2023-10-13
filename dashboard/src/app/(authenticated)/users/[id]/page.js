'use client'

import { useEffect, useState } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PowerUserBadge from "./PowerUserBadge";
import ChurnWarningUserBadge from "./ChurnWarningUserBadge";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingView from "./LoadingView";
import EventFeed from "@/components/Dashboards/Components/EventFeed";
import LineChartWithValue from '@/components/Dashboards/Components/LineChartWithValue';
import BarList from "@/components/Dashboards/Components/BarList";

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
      title: userData?.full_name || `Unknown User: ${userData?.id.split('-')[0]}`,
      url: null
    }
  ] 

  return (
    userData ? (
      <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
        <Breadcrumbs paths={breadcrumbPaths} userName={userData.full_name || `Unknown User: ${userData.id.split('-')[0]}`} />
        <div className='grid grid-cols-10 gap-4 mt-8'>
          <Card className='col-span-4 relative'>
            <CardHeader>
              <div className='grid grid-cols-2 items-center'>
                <div className='flex items-center'>
                  <Avatar className="h-16 w-16 mr-4 border border-slate-200">
                    {userData.avatar_url
                      ? <AvatarImage src={userData.avatar_url} alt="Avatar" />
                      : <AvatarFallback className="text-lg">{userData.initials}</AvatarFallback>
                    }
                  </Avatar>
                  <div>
                    {userData.poweruser ? <PowerUserBadge className="absolute top-5 right-5" size={8}/>:''}
                    {userData.churnwarning ? <ChurnWarningUserBadge className="absolute top-5 right-5" size={8} />:''}
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
                          {userData.subscriptionPlan ?
                            <span classname="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              {userData.subscriptionPlan}
                            </span>:'-'
                          } 
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Plan/Subscription Value</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">
                          {userData.subscriptionValue ?
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              {userData.subscriptionValue}
                            </span>:'-'
                          } 
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Role</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">{userData.role || '-'}</dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Title</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">{userData.title || '-'}</dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Twitter Handle</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">
                          {userData.twitterHandle ?
                            <a
                              className="hover:underline hover:text-blue-400 transition duration-500"
                              href={`https://twitter.com/${userData.twitterHandle}`}>
                                {userData.twitterHandle}
                            </a>:'-'
                          }
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Linkedin</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">
                          {userData.linkedinHandle ?
                            <a
                              className="hover:underline hover:text-blue-400 transition duration-500"
                              href={`https://www.linkedin.com/in/${userData.linkedinHandle}`}>Profile Link
                            </a>:'-'
                          }
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Company</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">
                          {userData.companyName ? userData.companyName:'-'}
                        </dd>
                      </div>
                      <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Location</dt>
                        <dd className="text-sm leading-6 text-gray-700 text-right">
                          {userData.location ? 'userData.location':'-'}
                        </dd>
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