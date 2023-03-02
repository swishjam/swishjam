'use client';
import AuthenticatedView from '@/components/AuthenticatedView';
import { AreaChart, BarList, Card, Title, Flex, Text, Bold } from '@tremor/react';
import { useEffect, useState } from "react";
import { msToSeconds } from "@/lib/utils";
import { GetPagesForCWVMetric, GetCWVTimeSeriesData } from "@/lib/api";
import LoadingSpinner from '@/components/LoadingSpinner';

const loadingIndicator = () => {
  return (
    <div className='flex'>
      <div className='m-auto'>
        <LoadingSpinner size={8} />
      </div>
    </div>
  )
}

export default function Cwv({ params }) {
  const { measurement } = params;
  const [pages, setPages] = useState();
  const [timeseriesData, setTimeseriesData] = useState();
  const valueFormatter = value => measurement === 'CLS' ? Number.parseFloat(value).toFixed(4) : `${msToSeconds(value)} s`;

  useEffect(() => {
    GetPagesForCWVMetric({ siteId: 'sj-syv3hiuj0p51nks5', metric: measurement }).then(res => {
      const formatted = res.records.map(record => {
        return {
          ...record,
          href: `/navigation-resources/${encodeURIComponent(record.name)}`
        }
      })
      setPages(formatted)
    });
    GetCWVTimeSeriesData({ siteId: 'sj-syv3hiuj0p51nks5', metric: measurement }).then(chartData => setTimeseriesData(chartData));
  }, []);

  return (
    <>
      <AuthenticatedView>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
          <h1 className="text-lg font-medium mt-8">{measurement}</h1>
          <div className='mt-6'>
            {timeseriesData === undefined ?
              <Card>
                {loadingIndicator()}
              </Card> :
              <Card>
                <AreaChart
                  data={timeseriesData}
                  dataKey="timestamp"
                  categories={['p90']}
                  colors={['blue']}
                  showLegend={false}
                  startEndOnly={true}
                  valueFormatter={value => measurement === 'CLS' ? Number.parseFloat(value).toFixed(4) : `${msToSeconds(value)} s`}
                  height="h-48"
                  marginTop="mt-10"
                />
              </Card>
            }
          </div>
          <div className='mt-6'>
            <Card>
              <Title>Worst performing pages by {measurement}.</Title>
              <Flex marginTop="mt-4">
                <Text><Bold>Pages</Bold></Text>
                <Text><Bold>Average {measurement}</Bold></Text>
              </Flex>
              {pages === undefined ?
                loadingIndicator() :
                <BarList data={pages} valueFormatter={valueFormatter} marginTop='mt-4' color='blue' />
              }
            </Card>
          </div>
        </main>
      </AuthenticatedView>
    </>
  );
}