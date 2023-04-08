'use client';

import { useState } from "react";
import AuthenticatedView from "@/components/AuthenticatedView";
import HostUrlFilterer from "@/components/Filters/HostUrlFilterer";
import { WebVitalsApi } from "@/lib/api-client/web-vitals";
import { BarChart } from "@tremor/react";
import PathUrlFilterer from "@/components/Filters/PathUrlFilterer";

const ACCRONYM_TO_HUMAN_DICT = {
  LCP: 'Largest Contentful Paint',
  INP: 'Interaction to Next Paint',
  CLS: 'Cumulative Layout Shift',
  FID: 'First Input Delay',
  FCP: 'First Contentful Paint',
  TTFB: 'Time to First Byte',
}

const CardIcon = iconType => {
  return {
    LCP: <LcpIcon />,
    INP: <InpIcon />,
    CLS: <ClsIcon />,
    FID: <FidIcon />,
    FCP: <FcpIcon />,
    TTFB: <TtfbIcon />
  }[iconType] || <></>;
}

export default function CWV({ params }) {
  const { accronym } = params;

  const [urlHost, setUrlHost] = useState();
  const [urlPath, setUrlPath] = useState();

  const [mobileHistogramData, setMobileHistogramData] = useState();
  const [desktopHistogramData, setDesktopHistogramData] = useState();
  const [mobileGoodNeedsImprovementChartData, setMobileGoodNeedsImprovementChartData] = useState();
  const [desktopGoodNeedsImprovementChartData, setDesktopGoodNeedsImprovementChartData] = useState();

  const getCwvDetailsForHost = ({ urlHost, urlPath }) => {
    setMobileHistogramData();
    setMobileGoodNeedsImprovementChartData();
    setDesktopGoodNeedsImprovementChartData();

    getAndSetHistogramData({  urlHost,  urlPath, deviceTypes: ['smartphone', 'phablet', 'tablet'], setterMethod: setMobileHistogramData });
    getAndSetHistogramData({ urlHost, urlPath, deviceTypes: ['desktop'], setterMethod: setDesktopHistogramData });
    getAndSetGoodNeedsImprovementChartData({
      urlHost,
      urlPath,
      deviceTypes: ['desktop'],
      setterMethod: setDesktopGoodNeedsImprovementChartData
    });
    getAndSetGoodNeedsImprovementChartData({ 
      urlHost, 
      urlPath, 
      deviceTypes: ['smartphone', 'phablet', 'tablet'], 
      setterMethod: setMobileGoodNeedsImprovementChartData 
    });
  }
  
  const getAndSetGoodNeedsImprovementChartData = ({ urlHost, urlPath, deviceTypes, setterMethod }) => {
    const params = { urlHost, urlPath, metrics: JSON.stringify([accronym]), deviceTypes: JSON.stringify(deviceTypes) };
    if (urlPath === 'All Paths') delete params.urlPath;
    WebVitalsApi.getGoodNeedsImprovementChartData(params).then(data => {
      const formatted = data[accronym].map(data => {
        return ({
          date: data.date,
          'Good': parseFloat(data.percentGood).toFixed(2),
          'Needs Improvement': parseFloat(data.percentNeedsImprovement).toFixed(2),
          'Poor': parseFloat(data.percentPoor).toFixed(2),
        })
      });
      setterMethod(formatted);
    });
  }

  const getAndSetHistogramData = ({ urlHost, urlPath, deviceTypes, setterMethod }) => {
    const params = { urlHost, urlPath, accronym, deviceTypes: JSON.stringify(deviceTypes) };
    if (urlPath === 'All Paths') delete params.urlPath;
    WebVitalsApi.getHistogramData(params).then(data => {
      const formatted = data.map(datapoint => {
        const splitRange = datapoint.range.split('-');
        const range0 = parseInt(splitRange[0]);
        const range1 = parseInt(splitRange[1]);
        const formattedRange0 = range0 < 1_000 
                                  ? range0 / 1_000
                                  : range0 % 1_000 === 0
                                    ? `${(range0 / 1_000).toFixed(0)}` 
                                    : `${(range0 / 1_000).toFixed(1)}`;
        const formattedRange1 = range1 < 1_000 
                                  ? `${range1 / 1_000}s`
                                  : range1 % 1_000 === 0
                                    ? `${(range1 / 1_000).toFixed(0)}s
                                    `: `${(range1 / 1_000).toFixed(1)}s`;
        return { ...datapoint, range: `${formattedRange0}-${formattedRange1}` }
      })
      setterMethod(formatted);
    });    
  }

  const totalCount = mobileHistogramData => (mobileHistogramData || []).reduce((acc, curr) => acc + parseInt(curr.count), 0);
  const humanName = ACCRONYM_TO_HUMAN_DICT[accronym];

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className='grid grid-cols-3'>
          <div className='col-span-2'>
            <h1 className="text-xl font-medium">{humanName} details</h1>
          </div>
          <div className='col-span-1 flex justify-end'>
            <HostUrlFilterer onHostSelected={setUrlHost} onNoHostsFound={() => {}} />
            <div className='inline ml-2'>
              <PathUrlFilterer 
                urlHost={urlHost} 
                onPathSelected={urlPath => {
                  setUrlPath(urlPath);
                  getCwvDetailsForHost({ urlHost, urlPath });
                }} 
                includeAllPathsSelection={true} 
              />
            </div>
          </div>
        </div>
        <div className='w-full border border-gray-200 rounded mt-8 p-4'>
          <div className="grid grid-cols-2 gap-4">
            <div className='col-span-1 h-96'>
              <div className='w-full'>
                <h2 className='text-lg'>Mobile</h2>
                <h3 className='text-xs text-gray-700 flex items-center'>
                  Distribution based on {mobileHistogramData ? totalCount(mobileHistogramData) : <div className='inline-block animate-pulse rounded bg-gray-200 mx-1 h-3 w-4' />} {accronym} records captured over the last 7 days
                </h3>
                {mobileHistogramData 
                  ? mobileHistogramData.length > 0 
                    ? <BarChart
                        data={mobileHistogramData}
                        dataKey="range"
                        categories={['count']}
                        colors={['blue']}
                        showLegend={false}
                        valueFormatter={value => `${((parseFloat(value) / totalCount(mobileHistogramData)) * 100).toFixed(2)}%`}
                        height="h-72"
                        marginTop="mt-4"
                        maxValue={100.0}
                        showYAxis={true}
                        showAnimation={false}
                      />
                    : <p className='text-xs text-center text-gray-700'>No distribution data found for timeperiod</p>
                  : <div className='h-72 w-full animate-pulse bg-gray-100 mt-4 rounded-md'></div>
                }
              </div>
            </div>
            <div className='col-span-1 h-96'>
              <div className='w-full'>
                <h2 className='text-lg'>Desktop</h2>
                <h3 className='text-xs text-gray-700 flex items-center'>
                  Distribution based on {desktopHistogramData ? totalCount(desktopHistogramData) : <div className='inline-block animate-pulse rounded bg-gray-200 mx-1 h-3 w-4' />} {accronym} records captured over the last 7 days
                </h3>
                {desktopHistogramData
                  ? desktopHistogramData.length > 0
                    ? <BarChart
                      data={desktopHistogramData}
                      dataKey="range"
                      categories={['count']}
                      colors={['blue']}
                      showLegend={false}
                      valueFormatter={value => `${((parseInt(value) / totalCount(desktopHistogramData)) * 100).toFixed(2)}%`}
                      height="h-72"
                      marginTop="mt-4"
                      maxValue={100.0}
                      showYAxis={true}
                      showAnimation={false}
                    />
                    : <p className='text-xs text-center text-gray-700'>No distribution data found for timeperiod</p>
                  : <div className='h-72 w-full animate-pulse bg-gray-100 mt-4 rounded-md'></div>
                }
              </div>
            </div>
          </div>

          <div className='w-full h-96'>
            <div className='grid grid-cols-2'>
              <div className='col-span-1'>
                <h2 className='text-lg text-gray-700'>Mobile</h2>
                <div className='w-full'>
                  {mobileGoodNeedsImprovementChartData
                    ? mobileGoodNeedsImprovementChartData.length > 0
                      ? <BarChart
                        data={mobileGoodNeedsImprovementChartData}
                        dataKey="date"
                        categories={['Good', 'Needs Improvement', 'Poor']}
                        colors={['green', 'yellow', 'red']}
                        showLegend={false}
                        startEndOnly={false}
                        valueFormatter={value => `${value}%`}
                        height="h-96"
                        marginTop="mt-4"
                        stack={true}
                        maxValue={'100'}
                        showYAxis={true}
                        showAnimation={false}
                        layout="vertical"
                      />
                      : <p className='text-xs text-center text-gray-700'>No data found for timeperiod</p>
                    : <div className='h-72 w-full animate-pulse bg-gray-100 mt-4 rounded-md'></div>
                  }
                </div>
              </div>
              <div className='col-span-1'>
                <h2 className='text-lg text-gray-700'>Desktop</h2>
                <div className='w-full'>
                  {desktopGoodNeedsImprovementChartData
                    ? desktopGoodNeedsImprovementChartData.length > 0
                      ? <BarChart
                          data={desktopGoodNeedsImprovementChartData}
                          dataKey="date"
                          categories={['Good', 'Needs Improvement', 'Poor']}
                          colors={['green', 'yellow', 'red']}
                          showLegend={false}
                          startEndOnly={false}
                          valueFormatter={value => `${value}%`}
                          height="h-96"
                          marginTop="mt-4"
                          stack={true}
                          maxValue={'100'}
                          showYAxis={true}
                          showAnimation={false}
                          layout="vertical"
                        />
                      : <p className='text-xs text-center text-gray-700'>No data found for timeperiod</p>
                    : <div className='h-72 w-full animate-pulse bg-gray-100 mt-4 rounded-md'></div>
                  }
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </AuthenticatedView>
  )
}