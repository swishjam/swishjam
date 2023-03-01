'use client';
import {
  Card,
  Metric,
  Text,
  Flex,
  CategoryBar,
  AreaChart,
} from '@tremor/react';

export default function WebVitalCard({ accronym, title, metric, metricUnits, metricPercent }, ...props) {
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
      <WebVitalTimeSeries metric={accronym} siteId="sj-55a4ab9cebf9d45f" />
    </Card>
  );
}
