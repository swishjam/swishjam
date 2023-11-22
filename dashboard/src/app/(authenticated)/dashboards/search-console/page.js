"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowPathIcon, CheckIcon, ExclamationTriangleIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import ConditionalCardWrapper from "@/components/Dashboards/Components/ConditionalCardWrapper";
import { dateFormatterForGrouping } from "@/lib/utils/timeseriesHelpers";
import GoogleSearchConsoleLogo from '@public/logos/google-logo.png'
import Image from "next/image";
import { Label } from "@/components/ui/label";
import LineChartWithValue from "@/components/Dashboards/Components/LineChartWithValue";
import Link from 'next/link'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover"
import { RxBarChart } from 'react-icons/rx'
import { Skeleton } from "@/components/ui/skeleton";
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import Table from "@/components/utils/Table";
import Timefilter from "@/components/Timefilter";
import useAuthData from "@/hooks/useAuthData";
import { useState, useEffect } from "react";

const formattedDay = dateFormatterForGrouping("day");

const SiteSelector = ({ sites, selectedSite, onSelect }) => {
  if (!sites) {
    return (
      <Button variant="outline" className='mr-4 flex items-center'>
        <LinkIcon className='h-4 w-4 text-gray-700 inline-block mr-1' /> <Skeleton className='h-6 w-14' />
      </Button>
    )
  } else if (sites.length === 0) {
    return (
      <Button variant="outline" className="mr-4 flex items-center">
        <LinkIcon className='h-4 w-4 text-gray-700 inline-block mr-1' /> No sites found
      </Button>
    )
  } else if (sites.length === 1) {
    return (
      <Button variant="outline" className="mr-4 flex items-center">
        <LinkIcon className='h-4 w-4 text-gray-700 inline-block mr-1' /> {sites[0].siteUrl.split('sc-domain:')[1] || sites[0].siteUrl}
      </Button>
    )
  } else {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="mr-4 flex items-center">
            <LinkIcon className='h-4 w-4 text-gray-700 inline-block mr-1' />
            {selectedSite
              ? selectedSite.siteUrl.split('sc-domain:')[1] || selectedSite.siteUrl
              : sites[0].siteUrl.split('sc-domain:')[1] || sites[0].siteUrl}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit grid grid-cols-1 gap-2" align='end'>
          {sites.map(({ siteUrl, permissionLevel }) => (
            <PopoverClose key={siteUrl} asChild>
              <div
                onClick={() => onSelect({ siteUrl, permissionLevel })}
                className={`${selectedSite.siteUrl == siteUrl ? 'bg-gray-100' : permissionLevel !== 'siteOwner' ? 'bg-yellow-100' : ''} group w-full rounded-md p-2 text-center hover:bg-gray-100 transition duration-500 cursor-pointer`}
              >
                <Label className={`p-4 width group-hover:cursor-pointer group-hover:text-swishjam duration-500 transition flex items-center`}>
                  {siteUrl === selectedSite.siteUrl && <CheckIcon className='h-4 w-4 text-swishjam inline-block mr-1' />}
                  {siteUrl.split('sc-domain:')[1] || siteUrl}
                  {permissionLevel !== "siteOwner" && (
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 inline-block ml-1" />
                  )}
                </Label>
              </div>
            </PopoverClose>
          ))}
        </PopoverContent>
      </Popover>
    )
  }
}

const ConnectGoogleSearchConsoleView = () => {
  const { token } = useAuthData();
  const clientId = '411519113339-t2fidfed57o2pbkd2mc203in85k87fms.apps.googleusercontent.com';
  const redirectHost = '56b9-2603-8000-7200-9d38-51d0-1b32-6c01-f3d5.ngrok-free.app';
  const redirectUri = `https://${redirectHost}/oauth/google/callback`;
  const loginHint = 'collin@swishjam.com'
  const scope = 'https://www.googleapis.com/auth/webmasters.readonly'
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&login_hint=${loginHint}&redirect_uri=${redirectUri}&scope=${scope}&state=${token}&response_type=code&access_type=offline&approval_prompt=force&include_granted_scopes=true`;

  return (
    <a
      href={authUrl}
      className="mt-8 relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400"
    >
      <Image src={GoogleSearchConsoleLogo} alt="Google Search Console Logo" className='mx-auto h-20 w-20' />
      <h2 className="mt-4 block text-md font-semibold text-gray-400">Connect your Google Search Console account</h2>
      <h4 className='block text-sm text-gray-400'>And begin visualizing your search data within Swishjam.</h4>
    </a >
  )
}

export default function SearchConsole() {
  const [availableSites, setAvailableSites] = useState();
  const [clicksTimeseriesData, setClicksTimeseriesData] = useState();
  const [ctrTimeseriesData, setCtrTimeseriesData] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [isMissingGoogleSearchConsoleConnection, setIsMissingGoogleSearchConsoleConnection] = useState();
  const [isRefreshing, setIsRefreshing] = useState();
  const [impressionsTimeseriesData, setImpressionsTimeseriesData] = useState();
  const [positionTimeseriesData, setPositionTimeseriesData] = useState();
  const [selectedSite, setSelectedSite] = useState();
  const [timeframeFilter, setTimeframeFilter] = useState("thirty_days");
  const [topPages, setTopPages] = useState();
  const [queryData, setQueryData] = useState();

  const setTimeseriesData = (setStateMethod, timeseriesData, timeData) => {
    setStateMethod({
      timeseries: timeseriesData,
      value: timeseriesData[timeseriesData.length - 1].value,
      previousValue: timeseriesData[timeseriesData.length - 1]?.comparisonValue,
      previousValueDate: timeseriesData[timeseriesData.length - 1]?.comparisonDate,
      ...timeData,
    });
  }

  const formatTimeseriesData = (timeseries, comparison_timeseries, start_time, end_time, comparison_start_time, comparison_end_time) => {
    let formattedClicks = [];
    let formattedCtr = [];
    let formattedImpressions = [];
    let formattedPosition = [];
    timeseries.forEach((data, i) => {
      const date = formattedDay(data.keys[0]);
      const { clicks, impressions, ctr, position } = data;
      const comparison = comparison_timeseries[i];

      if (comparison) {
        const comparisonDate = formattedDay(comparison.keys[0]);
        const { clicks: comparisonClicks, impressions: comparisonImpressions, ctr: comparisonCtr, position: comparisonPosition } = comparison;
        formattedClicks.push({ date, value: clicks, comparisonValue: comparisonClicks, comparisonDate });
        formattedImpressions.push({ date, value: impressions, comparisonValue: comparisonImpressions, comparisonDate });
        formattedCtr.push({ date, value: ctr * 100, comparisonValue: comparisonCtr * 100, comparisonDate });
        formattedPosition.push({ date, value: position, comparisonValue: comparisonPosition, comparisonDate });
      } else {
        formattedClicks.push({ date, value: clicks });
        formattedImpressions.push({ date, value: impressions });
        formattedCtr.push({ date, value: ctr * 100 });
        formattedPosition.push({ date, value: position });
      }
    });
    const timeData = { startTime: start_time, endTime: end_time, comparisonStartTime: comparison_start_time, comparisonEndTime: comparison_end_time };
    setTimeseriesData(setClicksTimeseriesData, formattedClicks, timeData);
    setTimeseriesData(setImpressionsTimeseriesData, formattedImpressions, timeData);
    setTimeseriesData(setCtrTimeseriesData, formattedCtr, timeData);
    setTimeseriesData(setPositionTimeseriesData, formattedPosition, timeData);
  }

  const getDashboardDataForTimeframeAndSiteUrl = async (timeframe, siteUrl) => {
    setClicksTimeseriesData();
    setCtrTimeseriesData();
    setImpressionsTimeseriesData();
    setPositionTimeseriesData();
    setTopPages();
    setQueryData();

    return await SwishjamAPI.GoogleSearchConsole.getAnalytics(siteUrl, { timeframe }).then(
      ({ error, page_data, query_data, timeseries, comparison_timeseries, start_time, end_time, comparison_start_time, comparison_end_time }) => {
        if (error) {
          setErrorMessage(error);
        } else {
          setQueryData(query_data);
          setTopPages(page_data);
          formatTimeseriesData(timeseries, comparison_timeseries, start_time, end_time, comparison_start_time, comparison_end_time);
        }
      }
    );
  }

  const getAllData = async timeframe => {
    setIsRefreshing(true);

    await SwishjamAPI.GoogleSearchConsole.getSites().then(result => {
      if (result.error) {
        if (/connect the Google Search Console data source under/i.test(result.error)) {
          setIsMissingGoogleSearchConsoleConnection(true);
        }
      } else {
        setIsMissingGoogleSearchConsoleConnection(false);
        const validSite = result.find(({ permissionLevel }) => permissionLevel === "siteOwner");
        setAvailableSites(result);
        setSelectedSite(validSite || result[0]);
        getDashboardDataForTimeframeAndSiteUrl(timeframe, (validSite || result[0]).siteUrl);
      }
    })
    setIsRefreshing(false);
  };

  useEffect(() => {
    getAllData(timeframeFilter);
  }, []);

  return (
    <main className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flex grid grid-cols-2 items-center">
        <div>
          <Link href="/dashboards" className="mb-0 text-xs font-medium text-gray-400 flex hover:text-swishjam transition duration-300 hover:underline">
            <RxBarChart size={16} className="mr-1" />Dashboards
          </Link>
          <h1 className="mb-0 text-lg font-medium text-gray-700">
            Google Search Console
          </h1>
        </div>

        <div className="flex w-full items-center justify-end">
          {isMissingGoogleSearchConsoleConnection === false && (
            <>
              <SiteSelector
                sites={availableSites}
                selectedSite={selectedSite}
                onSelect={site => {
                  setErrorMessage();
                  setSelectedSite(site)
                  getDashboardDataForTimeframeAndSiteUrl(timeframeFilter, site.siteUrl);
                }}
              />
              <Timefilter
                selection={timeframeFilter}
                onSelection={date => {
                  setTimeframeFilter(date);
                  getAllData(date);
                }}
              />
              {!isMissingGoogleSearchConsoleConnection && (
                <Button
                  variant="outline"
                  className={`ml-4 bg-white ${isRefreshing ? "cursor-not-allowed" : ""}`}
                  onClick={() => getAllData(timeframeFilter)}
                  disabled={isRefreshing}
                >
                  <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      {isMissingGoogleSearchConsoleConnection && <ConnectGoogleSearchConsoleView />}
      {errorMessage && (
        <Alert className='mb-2 mt-8 border-red-400'>
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Google Search Console error</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      {!isMissingGoogleSearchConsoleConnection && (
        <>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <LineChartWithValue
              title='Impressions'
              value={impressionsTimeseriesData?.value}
              previousValue={impressionsTimeseriesData?.previousValue}
              previousValueDate={impressionsTimeseriesData?.previousValueDate}
              showAxis={true}
              timeseries={errorMessage ? [] : impressionsTimeseriesData?.timeseries}
              valueFormatter={n => n?.toLocaleString('en-US')}
            />
            <LineChartWithValue
              title='Click Through Rate'
              value={ctrTimeseriesData?.value}
              previousValue={ctrTimeseriesData?.previousValue}
              previousValueDate={ctrTimeseriesData?.previousValueDate}
              showAxis={true}
              timeseries={errorMessage ? [] : ctrTimeseriesData?.timeseries}
              valueFormatter={n => `${n?.toLocaleString('en-US')}%`}
            />
            <LineChartWithValue
              title='Clicks'
              value={clicksTimeseriesData?.value}
              previousValue={clicksTimeseriesData?.previousValue}
              previousValueDate={clicksTimeseriesData?.previousValueDate}
              showAxis={true}
              timeseries={errorMessage ? [] : clicksTimeseriesData?.timeseries}
              valueFormatter={n => n?.toLocaleString('en-US')}
            />
            <LineChartWithValue
              title='Average Position'
              value={positionTimeseriesData?.value}
              previousValue={positionTimeseriesData?.previousValue}
              previousValueDate={positionTimeseriesData?.previousValueDate}
              showAxis={true}
              timeseries={errorMessage ? [] : positionTimeseriesData?.timeseries}
              valueFormatter={n => n?.toLocaleString('en-US')}
            />
          </div>
          <div className='mt-4'>
            <ConditionalCardWrapper title='Top Queries' includeCard={true}>
              <Table
                headers={['Query', 'Total Clicks', 'Click Through Rate', 'Total Impressions', 'Average Position']}
                rows={
                  errorMessage
                    ? []
                    : (
                      queryData?.map(data => [
                        data.keys[0],
                        data.clicks,
                        `${(data.ctr * 100).toFixed(2)}%`,
                        data.impressions,
                        data.position.toFixed(2)
                      ])
                    )
                }
              />
            </ConditionalCardWrapper>
          </div>
          <div className='mt-4'>
            <ConditionalCardWrapper title='Top Pages' includeCard={true}>
              <Table
                headers={['Page', 'Total Clicks', 'Click Through Rate', 'Total Impressions', 'Average Position']}
                rows={
                  errorMessage
                    ? []
                    : (
                      topPages?.map(data => [
                        data.keys[0],
                        data.clicks,
                        `${(data.ctr * 100).toFixed(2)}%`,
                        data.impressions,
                        data.position.toFixed(2)
                      ])
                    )
                }
              />
            </ConditionalCardWrapper>
          </div>
        </>
      )
      }
    </main >
  );
}
