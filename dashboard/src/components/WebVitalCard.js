'use client';
import { Card, Metric, Text, Flex, CategoryBar, AreaChart } from '@tremor/react';
import { msToSeconds } from '@lib/utils';

export default function WebVitalCard({ title, metric, metricUnits, metricPercent, timeseriesData, bounds }, ...props) {
  return (
    <Card>
      <Text>{title}</Text>
      {metric === null ? 
        <Text>Loading...</Text> : (
        <>
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
