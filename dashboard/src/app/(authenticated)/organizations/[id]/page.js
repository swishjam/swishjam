'use client'

import { useEffect, useState } from "react";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ItemizedList from "@/components/Dashboards/Components/ItemizedList";
import ActiveUsersLineChartWithValue from "@/components/Dashboards/Components/ActiveUsersLineChartWithValue";
import BarList from "@/components/Dashboards/Components/BarList";
import LoadingView from './LoadingView'
import Breadcrumbs from "@/components/Breadcrumbs";

const OrgProfileCard = ({ orgData, ...props }) => {
  return (
    <Card {...props}>
      <CardHeader>
        <div className='grid grid-cols-2 items-center'>
          <div className='flex items-center'>
            <Avatar className="h-16 w-16 mr-4 border border-slate-200">
              {orgData.avatarUrl
                ? <AvatarImage src={orgData.avatarUrl} alt="Avatar" />
                : <AvatarFallback className="text-lg">{orgData.name.split(' ').map(word => word[0]).join('').toUpperCase()}</AvatarFallback>
              }
            </Avatar>
            <div>
              <CardTitle className='text-2xl'>
                {orgData?.name || orgData?.organization_unique_identifier}
              </CardTitle>
              <CardDescription className='text-base text-gray-500'>
                {orgData.domain || '-'}
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
                <dt className="text-sm font-medium leading-6 text-gray-900">Description</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.description || '-'}</dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Tags</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.tags || '-'}</dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Phone</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.phone || '-'}</dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Sector</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.sector || '-'}</dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Industry</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.industry || '-'}</dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Location</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.location || '-'}</dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Employees</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.employees || '-'}</dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Estimated ARR</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.arr || '-'}</dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Technology Used</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.tech || '-'}</dd>
              </div>
              <div className="my-4 border-t border-slate-100 w-full" />
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Social Accounts</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right"></dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Linkedin</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.linkedin || '-'}</dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Twitter</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.twitter || '-'}</dd>
              </div>
              <div className="px-4 py-2 col-span-1 sm:px-0 grid grid-cols-2">
                <dt className="text-sm font-medium leading-6 text-gray-900">Facebook</dt>
                <dd className="text-sm leading-6 text-gray-700 text-right">{orgData?.facebook || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const OrganizationProfile = ({ params }) => {
  const { id } = params;

  const [organizationData, setOrganizationData] = useState();
  const [topUsers, setTopUsers] = useState();
  const [pageHitData, setPageViewData] = useState();
  const [activeUsersData, setActiveUsersData] = useState();
  const [activeUsersGrouping, setActiveUsersGrouping] = useState('weekly')
  // const [sessionsTimeseriesData, setSessionsTimeseriesData] = useState();
  const [billingData, setBillingData] = useState();
  const breadcrumbPaths = [
    {
      title: 'Organizations',
      url: '/organizations'
    },
    {
      title: organizationData?.name || `Unknown Org: ${organizationData?.id.split('-')[0]}`,
      url: null
    }
  ]

  const getActiveUsersData = type => {
    const derivedTimeframe = type === 'monthly' ? 'six_months' : type === 'weekly' ? 'three_months' : 'thirty_days'
    SwishjamAPI.Organizations.Users.Active.timeseries(id, { type, timeframe: derivedTimeframe }).then(
      ({ current_value, comparison_value, timeseries, comparison_timeseries, comparison_end_time, grouped_by }) => {
        setActiveUsersData({
          value: current_value || 0,
          previousValue: comparison_value || 0,
          previousValueDate: comparison_end_time,
          valueChange: (current_value || 0) - (comparison_value || 0),
          groupedBy: grouped_by,
          timeseries: timeseries?.map((timeseries, index) => ({
            ...timeseries,
            comparisonDate: comparison_timeseries[index]?.date,
            comparisonValue: comparison_timeseries[index]?.value,
          })),
        });
      }
    )
  }

  useEffect(() => {
    getActiveUsersData(activeUsersGrouping);
    SwishjamAPI.Organizations.retrieve(id).then(setOrganizationData);
    SwishjamAPI.Organizations.Users.list(id).then(setTopUsers);
    SwishjamAPI.Organizations.PageViews.list(id).then(pageViewData => {
      const formattedPageViewData = pageViewData.map(pageView => ({
        name: pageView.url,
        value: pageView.count
      }));
      setPageViewData(formattedPageViewData);
    });
  }, [])

  if (!organizationData) return <LoadingView />

  return (
    <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
      <Breadcrumbs paths={breadcrumbPaths} />
      <div className='grid grid-cols-10 gap-4 mt-8'>
        <OrgProfileCard
          className="col-span-4"
          orgData={organizationData}
        />
        <div className='col-span-6'>
          <ActiveUsersLineChartWithValue
            data={activeUsersData}
            selectedGrouping={activeUsersGrouping}
            onGroupingChange={group => {
              setActiveUsersData();
              setActiveUsersGrouping(group);
              getActiveUsersData(group);
            }}
          />
          <ItemizedList
            className="mt-4"
            title='Top Users'
            items={topUsers}
            titleFormatter={user => user.full_name || user.email || user.user_unique_identifier}
            subTitleFormatter={user => user.full_name ? user.email : null}
            rightItemKey='session_count'
            rightItemKeyFormatter={value => value ? `${value} sessions` : ''}
            fallbackAvatarGenerator={item => (item.full_name || item.email || item.user_unique_identifier.slice(0, 3)).split(' ').map(word => word[0]).join('').toUpperCase()}
            linkFormatter={user => `/users/${user.id}`}
          />
          <BarList
            className="mt-4"
            title='Top pages'
            items={pageHitData}
          />
        </div>
      </div>
    </main>
  )
}

export default OrganizationProfile;