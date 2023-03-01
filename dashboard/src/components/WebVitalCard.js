'use client';
import { Card, Metric, Text, Flex, CategoryBar, AreaChart } from '@tremor/react';
import WebVitalTimeSeries from './WebVitalTimeSeries';

const subCategoryPercentageValues = [33, 34, 33];

export default function WebVitalCard({ accronym, title, metric, metricUnits, metricPercent }, ...props) {
  return (
    <Card>
      <Text>{title}</Text>
      <Flex justifyContent="justify-start" alignItems="items-baseline" spaceX="space-x-1">
        <Metric>{metric}</Metric>
        <Text>{metricUnits}</Text>
      </Flex>
      <CategoryBar
        categoryPercentageValues={subCategoryPercentageValues}
        colors={['rose', 'yellow', 'emerald']}
        percentageValue={metricPercent}
        tooltip={`${metric}${metricUnits}`}
        showLabels={false}
        marginTop="mt-5"
      />
      <WebVitalTimeSeries metric={accronym} siteId="sj-55a4ab9cebf9d45f" />
    </Card>
  );
}
