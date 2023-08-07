'use client';

import AuthenticatedView from '@/components/AuthenticatedView';

//import { Card, Metric, Text, AreaChart, BadgeDelta, Flex, DeltaType } from "@tremor/react"

const data = [
  {
    Month: "Jan 21",
    MRR: 2890,
    "Active Users": 2400,
    Customers: 4938,
  },
  {
    Month: "Feb 21",
    MRR: 1890,
    "Active Users": 1398,
    Customers: 2938,
  },
  // ...
  {
    Month: "Jul 21",
    MRR: 3490,
    "Active Users": 4300,
    Customers: 2345,
  },
];

const categories = [
  {
    title: "MRR",
    metric: "$ 12,699",
    metricPrev: "$ 9,456",
    delta: "34.3%",
    deltaType: "moderateIncrease",
  },
  {
    title: "Active Users",
    metric: "$ 12,348",
    metricPrev: "$ 10,456",
    delta: "18.1%",
    deltaType: "moderateIncrease",
  },
  {
    title: "Customers",
    metric: "948",
    metricPrev: "1,082",
    delta: "12.3%",
    deltaType: "moderateDecrease",
  },
];

export default function Home() {


  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='grid grid-cols-2 mt-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium text-gray-700 mb-0">Dashboard</h1>
          </div>

          <div className="w-full flex items-center justify-end">
          </div>
        </div>
        <div className='grid grid-cols-3 gap-6 pt-12'>
          {/*categories.map((item) => (
        <Card key={item.title}>
          <Flex alignItems="start">
            <Text>{item.title}</Text>
            <BadgeDelta deltaType={item.deltaType}>{item.delta}</BadgeDelta>
          </Flex>
          <Flex className="space-x-3 truncate" justifyContent="start" alignItems="baseline">
            <Metric>{item.metric}</Metric>
            <Text>from {item.metricPrev}</Text>
          </Flex>
          <AreaChart
            className="mt-6 "
            data={data}
            index="Month"
            valueFormatter={(num) =>
              `$ ${Intl.NumberFormat("us").format(num).toString()}`
            }
            categories={[item.title]}
            colors={["blue"]}
            showXAxis={true}
            showGridLines={false}
            startEndOnly={true}
            showYAxis={false}
            showLegend={false}
          />
        </Card>
          ))*/}
        </div> 
      </main>
    </AuthenticatedView>
  );
}
