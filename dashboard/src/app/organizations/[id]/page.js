'use client'

import { useEffect, useState } from "react";
import AuthenticatedView from "@/components/Auth/AuthenticatedView";
import { API } from "@/lib/api-client/base";
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon } from "@heroicons/react/24/outline";
import ItemizedList from "@/components/DashboardComponents/ItemizedList";
import ActiveUsersLineChart from "@/components/DashboardComponents/Prebuilt/ActiveUsersLineChart";
import BarListCard from "@/components/DashboardComponents/BarListCard";

const LoadingState = () => (
  <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
    <Card>
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
    <div className='grid grid-cols-3 gap-4 mt-4'>
      <div className='col-span-2'>
        <ActiveUsersLineChart loadingStateOnly={true} />
      </div>
      <ItemizedList title='Top Users' />
    </div>
    <div className='mt-4'>
      <BarListCard title='Top pages' />
    </div>
  </main>
)

const HeaderCard = ({ avatarUrl, name, mrr, lifetimeRevenue, createdAt }) => {
  return (    
    <Card>
      <CardHeader>
        <div className='grid grid-cols-2 items-center'>
          <div className='flex items-center'>
            <Avatar className="h-20 w-20 mr-4">
              {avatarUrl
                ? <AvatarImage src={avatarUrl} alt="Avatar" />
                : <AvatarFallback className="text-lg">{name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
              }
            </Avatar>
            <div>
              <CardTitle className='text-4xl'>
                {name}
              </CardTitle>
            </div>
          </div>
          <div className='flex flex-col items-end justify-end text-base text-gray-500'>
            <div className='space-y-2'>
              <div className='flex items-center'>
                <CalendarIcon className='h-4 w-4 text-gray-500 inline-block mr-2' />
                <span className='text-base'>
                  {((mrr || 0) / 100).toLocaleString('en-us', { style: 'currency', currency: 'USD' })} MRR
                </span>
              </div>

              <div className='flex items-center'>
                <CalendarIcon className='h-4 w-4 text-gray-500 inline-block mr-2' />
                <span className='text-base'>
                  {((lifetimeRevenue || 0) / 100).toLocaleString('en-us', { style: 'currency', currency: 'USD' })} LTV
                </span>
              </div>

              <div className='flex items-center'>
                <CalendarIcon className='h-4 w-4 text-gray-500 inline-block mr-2' />
                <span className='text-base'>
                  {new Date(createdAt).toLocaleDateString('en-us', { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

const OrganizationProfile = ({ params }) => {
  const { id } = params;

  const [organizationData, setOrganizationData] = useState();
  const [topUsers, setTopUsers] = useState();
  const [pageHitData, setPageViewData] = useState();
  const [sessionsTimeseriesData, setSessionsTimeseriesData] = useState();
  const [billingData, setBillingData] = useState();

  useEffect(() => {
    API.get(`/api/v1/organizations/${id}`).then(setOrganizationData);
    // API.get(`/api/v1/organizations/${id}/billing`).then(setBillingData);
    API.get(`/api/v1/organizations/${id}/page_views`).then(pageViewData => {
      const formattedPageViewData = pageViewData.map(pageView => ({
        name: pageView.url,
        value: pageView.count
      }));
      setPageViewData(formattedPageViewData);
    });
    API.get(`/api/v1/organizations/${id}/sessions/timeseries`, { timeframe: '1_year' }).then(({ timeseries }) => {
      setSessionsTimeseriesData({
        timeseries,
        value: timeseries.map(({ value }) => value).reduce((a, b) => a + b, 0),  
      })
    })
    API.get(`/api/v1/organizations/${id}/users`).then(setTopUsers);
  }, [])

  if (!organizationData) return <LoadingState />

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <HeaderCard 
        name={organizationData.name} 
        createdAt={organizationData.created_at} 
        mrr={billingData?.current_mrr}
        lifetimeRevenue={billingData?.lifetime_revenue}
      />
      <div className='grid grid-cols-3 gap-4 mt-4'>
        <div className='col-span-2'>
          <ActiveUsersLineChart scopedOrganizationId={id} />
        </div>
        <ItemizedList
          title='Top Users'
          items={topUsers}
          leftItemHeaderKey='name'
          leftItemSubHeaderKey='email'
          rightItemKey='session_count'
          rightItemKeyFormatter={value => `${value} sessions`}
          fallbackAvatarGenerator={item => item.full_name.split(' ').map(word => word[0]).join('').toUpperCase()}
          linkFormatter={user => `/users/${user.id}`}
        />
      </div>
      <div className='mt-4'>
        <BarListCard title='Top pages' items={pageHitData} /> 
      </div>
    </main>
  )
}

export default AuthenticatedView(OrganizationProfile, LoadingState);