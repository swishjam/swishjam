'use client'

import BarList from "@/components/Dashboards/Components/BarList";
import Breadcrumbs from "@/components/Breadcrumbs";
import EventFeed from "@/components/Dashboards/Components/EventFeed";
import LoadingView from "./LoadingView";
import LineChartWithValue from '@/components/Dashboards/Components/LineChartWithValue';
import ProfileInformationSideBar from "@/components/Profiles/ProfileInformationSideBar";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from "react";

const UserProfile = ({ params }) => {
  const { id: userId } = params;
  const [hasProfileEnrichmentEnabled, setHasProfileEnrichmentEnabled] = useState();
  const [hasStripeIntegrationEnabled, setHasStripeIntegrationEnabled] = useState();
  const [pageViewsData, setPageViewsData] = useState();
  const [recentEvents, setRecentEvents] = useState();
  const [sessionTimeseriesData, setSessionTimeseriesData] = useState();
  const [userData, setUserData] = useState();
  // const [organizationsListExpanded, setOrganizationsListExpanded] = useState(false);

  useEffect(() => {
    SwishjamAPI.Users.retrieve(userId).then(setUserData);
    SwishjamAPI.Users.Events.list(userId, { limit: 5 }).then(setRecentEvents);
    SwishjamAPI.Users.PageViews.list(userId).then(pageViews => {
      setPageViewsData(pageViews.map(({ url, count }) => ({ name: url, value: count })));
    });
    SwishjamAPI.Users.Sessions.timeseries(userId).then(({ timeseries }) => {
      setSessionTimeseriesData({
        timeseries,
        value: timeseries.map(({ value }) => value).reduce((a, b) => a + b, 0),
      })
    });
    SwishjamAPI.Integrations.list().then(({ enabled_integrations }) => {
      const stripeIntegration = enabled_integrations.find(({ name }) => name.toLowerCase() === 'stripe');
      setHasStripeIntegrationEnabled(stripeIntegration !== undefined);
    })
    SwishjamAPI.Config.retrieve().then(({ settings }) => {
      setHasProfileEnrichmentEnabled(settings.should_enrich_user_profile_data === true);
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
          <ProfileInformationSideBar
            userData={userData}
            hasProfileEnrichmentEnabled={hasProfileEnrichmentEnabled}
            hasStripeIntegrationEnabled={hasStripeIntegrationEnabled}
          />

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
              events={recentEvents}
              initialLimit={5}
              leftItemHeaderKey='name'
              leftItemSubHeaderFormatter={event => {
                if (event.name === 'page_view') {
                  return JSON.parse(event.properties).url
                }
              }}
              loadMoreEventsIncrement={5}
              rightItemKey='occurred_at'
              rightItemKeyFormatter={date => {
                return new Date(date)
                  .toLocaleDateString('en-us', { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                  .replace(`, ${new Date(date).getFullYear()}`, '')
              }}
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