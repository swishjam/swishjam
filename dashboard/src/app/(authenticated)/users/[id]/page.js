'use client'

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import BarList from "@/components/Dashboards/Components/BarList";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import EventFeed from "@/components/Dashboards/Components/EventFeed";
import LoadingView from "./LoadingView";
import LineChartWithValue from '@/components/Dashboards/Components/LineChartWithValue';
import ProfileInformationSideBar from "@/components/Profiles/ProfileInformationSideBar";
import { setStateFromTimeseriesResponse } from "@/lib/utils/timeseriesHelpers";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";
import PageWithHeader from "@/components/utils/PageWithHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { TriangleAlertIcon } from "lucide-react";
import Link from "next/link";

const UserProfile = ({ params }) => {
  const { id: userId } = params;
  const [hasProfileEnrichmentEnabled, setHasProfileEnrichmentEnabled] = useState();
  const [hasStripeIntegrationEnabled, setHasStripeIntegrationEnabled] = useState();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [pageViewsData, setPageViewsData] = useState();
  const [recentEvents, setRecentEvents] = useState();
  const [sessionTimeseriesData, setSessionTimeseriesData] = useState();
  const [userData, setUserData] = useState();

  const getEvents = async () => {
    setRecentEvents();
    return await SwishjamAPI.Users.Events.list(userId, { timeframe: '90_days', limit: 5 }).then(setRecentEvents);
  }

  const getPageViews = async () => {
    setPageViewsData();
    return await SwishjamAPI.Users.PageViews.list(userId, { timeframe: '90_days' }).then(pageViews => {
      setPageViewsData(pageViews.map(({ url, count }) => ({ name: url, value: count, href: url })));
    });
  }

  const getSessions = async () => {
    setSessionTimeseriesData();
    return await SwishjamAPI.Users.Sessions.timeseries(userId).then(data => setStateFromTimeseriesResponse(data, setSessionTimeseriesData));
  }

  const getUserData = async () => {
    setUserData();
    return await SwishjamAPI.Users.retrieve(userId).then(setUserData);
  }

  const getAllData = async () => {
    setIsRefreshing(true);
    await Promise.all([
      getUserData(),
      getEvents(),
      getPageViews(),
      getSessions(),
    ])
    setIsRefreshing(false);
  }

  useEffect(() => {
    SwishjamAPI.Integrations.list().then(({ enabled_integrations }) => {
      const stripeIntegration = enabled_integrations.find(({ name }) => name.toLowerCase() === 'stripe');
      setHasStripeIntegrationEnabled(stripeIntegration !== undefined);
    })
    SwishjamAPI.Config.retrieve().then(({ settings }) => {
      setHasProfileEnrichmentEnabled(settings.should_enrich_user_profile_data === true);
    });
    getAllData();
  }, [])

  const breadcrumbs = [
    { title: 'Users', url: '/users' },
    { title: isRefreshing ? <Skeleton className='h-6 w-36' /> : userData.full_name || userData.email || (userData.user_unique_identifier ? `Un-named User: ${userData.user_unique_identifier}` : `Anonymous User ${userData.id.slice(0, 6)}`) }
  ]

  return (
    <PageWithHeader
      title={<Breadcrumbs paths={breadcrumbs} />}
      buttons={
        <Button
          variant="ghost"
          className={`duration-500 transition-all hover:text-swishjam ${isRefreshing ? "cursor-not-allowed text-swishjam" : ""}`}
          onClick={getAllData}
          disabled={isRefreshing}
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      }>
      {userData
        ? (
          <>
            {userData.merged_into_analytics_user_profile_id && (
              <div className='bg-yellow-100 text-yellow-600 text-md font-medium flex items-center px-4 py-4 border border-yellow-200 rounded-md'>
                <TriangleAlertIcon className='h-6 w-6 mr-4' />
                <div>
                  <span className='block'>This user has been merged into another user profile. All historical events and data will be attributed to the merged profile.</span>
                  <Link
                    href={`/users/${userData.merged_into_analytics_user_profile_id}`}
                    className='underline transition-all duration-500 hover:text-yellow-700'
                  >
                    View the merged profile
                  </Link>
                </div>
              </div>
            )}
            <div className='grid grid-cols-10 gap-4 mt-8'>
              <div className='col-span-4'>
                <ProfileInformationSideBar
                  userData={userData}
                  hasProfileEnrichmentEnabled={hasProfileEnrichmentEnabled}
                  hasStripeIntegrationEnabled={hasStripeIntegrationEnabled}
                />
              </div>

              <div className="col-span-6">
                <LineChartWithValue
                  title='Sessions'
                  value={sessionTimeseriesData?.value}
                  timeseries={sessionTimeseriesData?.timeseries}
                  valueFormatter={numSessions => numSessions.toLocaleString('en-US')}
                />
                <BarList className="mt-4" title='Page Views' items={pageViewsData} noDataMessage="No page views in the last 90 days." />
                <EventFeed
                  className="col-span-6 mt-4"
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
                  noDataMsg="No events triggered in the last 90 days."
                  rightItemKey='occurred_at'
                  rightItemKeyFormatter={date => new Date(date).toLocaleTimeString('en-us', { hour: 'numeric', minute: "2-digit", second: "2-digit" })}
                  title='Recent Events'
                  viewAllLink={`/users/${userId}/events`}
                />
              </div>
            </div>
          </>
        ) : <LoadingView />
      }
    </PageWithHeader>
  )
}

export default UserProfile;