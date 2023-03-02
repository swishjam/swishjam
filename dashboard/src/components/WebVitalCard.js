'use client';
import { Card, Metric, Text, Flex, CategoryBar, AreaChart, Accordion } from '@tremor/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { msToSeconds } from '@lib/utils';
import Link from 'next/link';

const CardLoading = () => (   
  <div className='flex'>
    <div className='m-auto py-20'>
      <LoadingSpinner size={8} />
    </div>
  </div>
)

export default function WebVitalCard({ title, accronym, metric, metricUnits, metricPercent, timeseriesData, bounds }, ...props) {
  return (
    <Card>
      {metric === null ? (
        <>
          <Link href={`/cwv/${accronym}`} className='hover:underline'><Text>{title}</Text></Link>
          <Flex justifyContent="justify-start" alignItems="items-baseline" spaceX="space-x-1">
            <Metric></Metric>
          </Flex>
          <CardLoading />
        </>
      ) : (
        <>
          <Link href={`/cwv/${accronym}`} className='hover:underline'><Text>{title}</Text></Link>
          <Flex justifyContent="justify-start" alignItems="items-baseline" spaceX="space-x-1">
            <Metric>{metric}</Metric>
            <Text>{metricUnits}</Text>
          </Flex>
          <CategoryBar
            categoryPercentageValues={bounds}
            colors={['emerald', 'yellow', 'rose']}
            percentageValue={metricPercent}
            tooltip={`${metric}${metricUnits}`}
            showLabels={false}
            marginTop="mt-5"
          />
          <AreaChart
            data={timeseriesData}
            dataKey="timestamp"
            categories={['p90']}
            colors={['blue']}
            showLegend={false}
            startEndOnly={true}
            valueFormatter={value => metricUnits === 's' ? `${msToSeconds(value)} ${metricUnits}` : Number.parseFloat(value).toFixed(4)}
            height="h-48"
            marginTop="mt-10"
          />
        </>
      )}
    </Card>
  );
}
