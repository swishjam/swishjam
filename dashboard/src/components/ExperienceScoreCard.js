'use client';
import React, { PureComponent } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, text } from 'recharts';
import { Card, LineChart, AreaChart } from "@tremor/react";
import LoadingSpinner from '@components/LoadingSpinner';
import Link from 'next/link';

const chartData = [
  {
    year: 1951,
    "Population growth rate": 1.74,
  },
  {
    year: 1952,
    "Population growth rate": 1.93,
  },
  {
    year: 1953,
    "Population growth rate": 1.9,
  },
  {
    year: 1954,
    "Population growth rate": 1.98,
  },
  {
    year: 1955,
    "Population growth rate": 2,
  },
];

const cities = [
  {
      name: 'Potenital Improvement Area',
      sales: 10,
  },
  {
      name: 'Experience Score',
      sales: 90,
  },
];

const dataFormatter = (number) =>
  `${Intl.NumberFormat("us").format(number).toString()}%`;

const data = [
  { name: 'Bunk', value: 10 },
  { name: 'Exp Score', value: 90 },
];
const COLORS = ['#f1f5f9', '#99EEBB'];

const renderActiveShape = (props) => {
  
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text className="text-5xl" x={cx} y={cy} dy={16} textAnchor="middle" fill={'#99EEBB'} scaletofit="true">
        {payload.value}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const valueFormatter = (number) => (
  `${number}`
);

const CardLoading = () => (   
  <div className='flex'>
    <div className='m-auto py-20'>
      <LoadingSpinner size={8} />
    </div>
  </div>
)

// {  }, ...props
            /*<Metric>12,699</Metric> 
            <Text>asdfasdf</Text> 
            <DonutChart
              data={cities}
              category="sales"
              dataKey="name"
              valueFormatter={valueFormatter}
              marginTop="mt-6"
              colors={["slate", "emerald"]}
            />*/
      //<Title>Swishjam's Real User Experience Score</Title>
       // <Flex justifyContent="justify-center" alignItems="items-baseline" spaceX="space-x-1 pt-6">
        //</Flex>
export default function ExperienceScoreCard() {
  return (
    <Card >
        
      <div className='flex'>
        <div className="w-1/3 flex flex-col pr-4">
          <h2 className="text-center text-lg font-normal text-gray-900">Swishjam's Real User Experience Score</h2>
          <PieChart width={200} height={200} onMouseEnter={() => console.log('entered')} className="mx-auto" >
            <Pie
              data={data}
              cx={'50%'}
              cy={'50%'}
              activeIndex={1}
              activeShape={renderActiveShape}
              innerRadius={66}
              outerRadius={75}
              fill="#000"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
          <div className="flex mt-6">
            <div
              className="text-swishjam mx-auto text-center min-w-fit rounded-full bg-white py-2.5 px-4 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 "
            >
            35,654 Page Views
            </div>
          </div> 
        </div>
        <div className="w-2/3 flex">
          <AreaChart
            data={chartData}
            dataKey="year"
            categories={['Population growth rate']}
            colors={['blue']}
            showLegend={false}
            startEndOnly={true}
            marginTop="mt-12"
            valueFormatter={dataFormatter}
            yAxisWidth="w-10"
          />
        </div>
      </div>


      {/*<CardLoading />*/}
    </Card>
  );
}
/*
          <div>
            <h3 className="text-medium pb-2">How It's Calculated</h3> 
            <div class="relative pl-9">
              <dt class="inline font-semibold text-gray-900">
                <svg class="absolute top-1 left-1 h-5 w-5 text-swishjam" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M10 2.5c-1.31 0-2.526.386-3.546 1.051a.75.75 0 01-.82-1.256A8 8 0 0118 9a22.47 22.47 0 01-1.228 7.351.75.75 0 11-1.417-.49A20.97 20.97 0 0016.5 9 6.5 6.5 0 0010 2.5zM4.333 4.416a.75.75 0 01.218 1.038A6.466 6.466 0 003.5 9a7.966 7.966 0 01-1.293 4.362.75.75 0 01-1.257-.819A6.466 6.466 0 002 9c0-1.61.476-3.11 1.295-4.365a.75.75 0 011.038-.219zM10 6.12a3 3 0 00-3.001 3.041 11.455 11.455 0 01-2.697 7.24.75.75 0 01-1.148-.965A9.957 9.957 0 005.5 9c0-.028.002-.055.004-.082a4.5 4.5 0 018.996.084V9.15l-.005.297a.75.75 0 11-1.5-.034c.003-.11.004-.219.005-.328a3 3 0 00-3-2.965zm0 2.13a.75.75 0 01.75.75c0 3.51-1.187 6.745-3.181 9.323a.75.75 0 11-1.186-.918A13.687 13.687 0 009.25 9a.75.75 0 01.75-.75zm3.529 3.698a.75.75 0 01.584.885 18.883 18.883 0 01-2.257 5.84.75.75 0 11-1.29-.764 17.386 17.386 0 002.078-5.377.75.75 0 01.885-.584z" clip-rule="evenodd"></path>
  </svg>
                Largest Contentful Paint
              </dt>
              <dd class=""> Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.</dd>
            </div>
            <div class="relative pl-9">
              <dt class="inline font-semibold text-gray-900">
                <svg class="absolute top-1 left-1 h-5 w-5 text-swishjam" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M10 2.5c-1.31 0-2.526.386-3.546 1.051a.75.75 0 01-.82-1.256A8 8 0 0118 9a22.47 22.47 0 01-1.228 7.351.75.75 0 11-1.417-.49A20.97 20.97 0 0016.5 9 6.5 6.5 0 0010 2.5zM4.333 4.416a.75.75 0 01.218 1.038A6.466 6.466 0 003.5 9a7.966 7.966 0 01-1.293 4.362.75.75 0 01-1.257-.819A6.466 6.466 0 002 9c0-1.61.476-3.11 1.295-4.365a.75.75 0 011.038-.219zM10 6.12a3 3 0 00-3.001 3.041 11.455 11.455 0 01-2.697 7.24.75.75 0 01-1.148-.965A9.957 9.957 0 005.5 9c0-.028.002-.055.004-.082a4.5 4.5 0 018.996.084V9.15l-.005.297a.75.75 0 11-1.5-.034c.003-.11.004-.219.005-.328a3 3 0 00-3-2.965zm0 2.13a.75.75 0 01.75.75c0 3.51-1.187 6.745-3.181 9.323a.75.75 0 11-1.186-.918A13.687 13.687 0 009.25 9a.75.75 0 01.75-.75zm3.529 3.698a.75.75 0 01.584.885 18.883 18.883 0 01-2.257 5.84.75.75 0 11-1.29-.764 17.386 17.386 0 002.078-5.377.75.75 0 01.885-.584z" clip-rule="evenodd"></path>
  </svg>
                Largest Contentful Paint
              </dt>
              <dd class=""> Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.</dd>
            </div>
          
          </div>*/