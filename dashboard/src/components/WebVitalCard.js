'use client';
import { Card, Metric, Text, Flex, CategoryBar, AreaChart } from '@tremor/react';
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

const areaChartValueFormatter = (value, metricUnits) => {
  if (metricUnits === 's') {
    return `${msToSeconds(value)} ${metricUnits}`;
  } else {
    try {
      return parseFloat(value).toFixed(4);
    } catch(err) {
      return value;
    }
  }
}

export default function WebVitalCard({ title, accronym, metric, metricUnits, metricPercent, timeseriesData, bounds, shouldLinkToCwvDetails = true }, ...props) {
  return (
    <Card>
      {metric === null ? (
        <>
          {shouldLinkToCwvDetails ? 
            <Link href={`/cwv/${accronym}`} className='hover:underline'><Text>{title}</Text></Link> :
            <Text>{title}</Text>
          }
          <Flex justifyContent="justify-start" alignItems="items-baseline" spaceX="space-x-1">
            <Metric></Metric>
          </Flex>
          <CardLoading />
        </>
      ) : (
        <>
            {shouldLinkToCwvDetails ?
              <Link href={`/cwv/${accronym}`} className='hover:underline'><Text>{title}</Text></Link> :
              <Text>{title}</Text>
            }
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
          {timeseriesData === undefined ?
            <CardLoading /> : timeseriesData.length > 0 ? (
              <AreaChart
                data={timeseriesData}
                dataKey="timestamp"
                categories={['p90']}
                colors={['blue']}
                showLegend={false}
                startEndOnly={true}
                  valueFormatter={value => areaChartValueFormatter(value, metricUnits)}
                height="h-48"
                marginTop="mt-10"
              />
            ) : (
              <div className='flex justify-center items-center py-12'>
                <Text>No data available for timeframe</Text>
              </div>
            )
          }
        </>
      )}
    </Card>
  );
}
