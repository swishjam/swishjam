'use client';
import { useState } from 'react';
import {
  Card,
  Metric,
  Text,
  ColGrid,
  Flex,
  CategoryBar,
  AreaChart,
  Block,
} from '@tremor/react';

const subCategoryPercentageValues = [10, 45, 55];
//const valueFormatter = (number) => `$ ${Intl.NumberFormat('us').format(number).toString()}`;
const valueFormatter = (number) => `${number}`;

export default function WebVitalCard({ title, metric, metricTotal, timeseries }, ...props) {

  return (
    <Card>
      <Text>{title}</Text>
      <Flex justifyContent="justify-start" alignItems="items-baseline" spaceX="space-x-1">
        <Metric>{metric}</Metric>
        <Text>ms</Text>
      </Flex>
      <CategoryBar
        categoryPercentageValues={subCategoryPercentageValues}
        colors={['rose', 'yellow', 'emerald']}
        percentageValue={(metric/metricTotal)*100}
        tooltip={`${metric} Avg`}
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
