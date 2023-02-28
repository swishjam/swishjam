'use client';
import {
  Card,
  Metric,
  Text,
  Flex,
  CategoryBar,
  AreaChart,
} from '@tremor/react';

const valueFormatter = (number) => `${number}`;

export default function WebVitalCard({ title, metric, metricUnits, metricPercent, bounds, timeseries }, ...props) {

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
        data={timeseries}
        dataKey="Month"
        categories={['Good','Needs Improvement','Poor']}
        colors={['emerald', 'yellow','rose']}
        showYAxis={false}
        maxValue={4490}
        showLegend={false}
        startEndOnly={true}
        valueFormatter={valueFormatter}
        height="h-48"
        marginTop="mt-10"
        stack={true} 
      />
    </Card>
  );
}
