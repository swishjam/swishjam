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

const UserProfile = ({ params }) => {
  const { id: userId } = params;
  const [hasProfileEnrichmentEnabled, setHasProfileEnrichmentEnabled] = useState();
  const [hasStripeIntegrationEnabled, setHasStripeIntegrationEnabled] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageViewsData, setPageViewsData] = useState();
  const [recentEvents, setRecentEvents] = useState();
  const [sessionTimeseriesData, setSessionTimeseriesData] = useState();
  const [userData, setUserData] = useState();

  const getEvents = async () => {
    return await SwishjamAPI.Users.Events.list(userId, { limit: 5 }).then(setRecentEvents);
  }

  const getPageViews = async () => {
    return await SwishjamAPI.Users.PageViews.list(userId, { timeframe: '30_days' }).then(pageViews => {
      setPageViewsData(pageViews.map(({ url, count }) => ({ name: url, value: count })));
    });
  }

  const getSessions = async () => {
    return await SwishjamAPI.Users.Sessions.timeseries(userId).then(data => setStateFromTimeseriesResponse(data, setSessionTimeseriesData));
  }

  const getAllData = async () => {
    setRecentEvents();
    setPageViewsData();
    setSessionTimeseriesData();
    setIsRefreshing(true);
    await Promise.all([
      getEvents(),
      getPageViews(),
      getSessions(),
    ])
    setIsRefreshing(false);
  }

  useEffect(() => {
    SwishjamAPI.Users.retrieve(userId).then(setUserData);
    SwishjamAPI.Integrations.list().then(({ enabled_integrations }) => {
      const stripeIntegration = enabled_integrations.find(({ name }) => name.toLowerCase() === 'stripe');
      setHasStripeIntegrationEnabled(stripeIntegration !== undefined);
    })
    SwishjamAPI.Config.retrieve().then(({ settings }) => {
      setHasProfileEnrichmentEnabled(settings.should_enrich_user_profile_data === true);
    });
    getAllData();
  }, [])

  return (
    userData ? (
      <main className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8 mb-8">
        <div className='flex justify-between items-center'>
          <Breadcrumbs
            paths={[
              {
                title: 'Users',
                url: '/users'
              },
              {
                title: userData.full_name || userData.email || (userData.user_unique_identifier ? `Un-named User: ${userData.user_unique_identifier}` : `Anonymous User ${userData.id.slice(0, 6)}`),
                url: null
              }
            ]}
          />
          <Button
            variant="ghost"
            className={`duration-500 transition-all hover:text-swishjam ${isRefreshing ? "cursor-not-allowed text-swishjam" : ""}`}
            onClick={getAllData}
            disabled={isRefreshing}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
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
            <BarList className="mt-4" title='Page Views' items={pageViewsData} noDataMessage="No page views in the last 30 days." />
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
              noDataMsg="No events triggered in the last 30 days."
              rightItemKey='occurred_at'
              rightItemKeyFormatter={date => new Date(date).toLocaleTimeString('en-us', { hour: 'numeric', minute: "2-digit", second: "2-digit" })}
              title='Recent Events'
              viewAllLink={`/users/${userId}/events`}
            />
          </div>
        </div>
      </main>
    ) : <LoadingView />
  )
}

export default UserProfile;