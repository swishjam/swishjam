'use client';
import { Card, Metric, Text, Flex, CategoryBar, AreaChart } from '@tremor/react';

export default function WebVitalCard({ title, metric, metricUnits, metricPercent, timeseriesData, bounds }, ...props) {
  const valueFormatter = value => `${value}%`;

  return (
    <Card>
      <Text>{title}</Text>
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
        categories={['Good', 'Needs Improvement', 'Poor']}
        colors={['emerald', 'yellow', 'rose']}
        showYAxis={false}
        maxValue={100}
        showLegend={false}
        startEndOnly={true}
        valueFormatter={value => `${value}%`}
        height="h-48"
        marginTop="mt-10"
        stack={true}
      />
    </Card>
  );
}
