'use client';
import React, { PureComponent } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, text } from 'recharts';
import { Card, LineChart, AreaChart } from "@tremor/react";
import LoadingSpinner from '@components/LoadingSpinner';
import Link from 'next/link';

const resScore = (score) => {
  return [
    {
        name: 'Potenital Improvement Area',
        value: 100 - score,
    },
    {
        name: 'Experience Score',
        value: score,
    },
  ]
}

const calculateTimeseries = (lcp, cls, fcp, fid) => {
  
  if(lcp.timeseriesData.length > 1 && cls.timeseriesData.length > 1 && fcp.timeseriesData.length > 1 && fid.timeseriesData.length > 1) {
    const allTimeseriesArr = [
      ...lcp.timeseriesData,
      ...cls.timeseriesData,
      ...fcp.timeseriesData,
      ...fid.timeseriesData,
    ]; 
    let timeSeriesLookup = {};
    allTimeseriesArr.map( ata => {
      let count = timeSeriesLookup[ata.timestamp] ? timeSeriesLookup[ata.timestamp].count + 1 : 1;
        
      // calc total REX
      //timeSeriesLookup[ata.timestamp]
      let score = 0; 
      if(timeSeriesLookup[ata.timestamp]?.score) {
        score = timeSeriesLookup[ata.timestamp].score + ata.metric.weightedScore
      } else {
        score = ata.metric.weightedScore
      }

      if(timeSeriesLookup[ata.timestamp]) {
        timeSeriesLookup[ata.timestamp] = {
          ...timeSeriesLookup[ata.timestamp],
          [ata.metric.key]:ata.metric,
          count,
          score
        }
      } else {
        timeSeriesLookup[ata.timestamp] = {
          [ata.metric.key]:ata.metric,
          count,
          score
        }
      } 
    })

    let finalTimeseriesArr = [];
    for (const [key, value] of Object.entries(timeSeriesLookup)) {
      value.date = key;
      finalTimeseriesArr.push(value)
    }
    
    const filteredFinalTimeseries = finalTimeseriesArr.filter ( i => i.count >= 4 ) 
    return filteredFinalTimeseries
  }
  return [] 
}

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  return (
    <g>
      <text className="text-5xl" x={cx} y={cy} dy={16} textAnchor="middle" fill={fill}>
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

const CardLoading = () => (   
  <div className='flex'>
    <div className='m-auto py-20'>
      <LoadingSpinner size={8} />
    </div>
  </div>
)

const calcTimeseries = () => {
  
} 

export default function ExperienceScoreCard({ lcp, cls, fcp, fid, pageViews }) {

  if(!lcp?.metric) {
    return (
      <Card>
        <CardLoading />
      </Card> 
    )
  }

  const experienceScore=(1*(lcp?.metric?.weightedScore+fid?.metric?.weightedScore+
    cls?.metric?.weightedScore+fcp?.metric?.weightedScore))
  const roundedScore = Math.ceil(experienceScore)
  const data = resScore(roundedScore); 
  const COLORS = ['#f1f5f9', (roundedScore >= 90 ? '#10b981': (roundedScore >= 50 ? '#eab308': '#f43f5e'))];
  
  return (
    <Card >
        
      <div className='flex'>
        <div className="w-1/3 flex flex-col pr-4">
          <h2 className="text-center text-lg font-normal text-gray-900">Swishjam's Real User Experience Score</h2>
          <PieChart width={200} height={200} className="mx-auto">
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
            {pageViews?.toLocaleString()} Page Views
            </div>
          </div> 
        </div>
        <div className="w-2/3 flex">
          {calculateTimeseries(lcp, cls, fcp, fid).length > 0 ?
          <AreaChart
            data={calculateTimeseries(lcp, cls, fcp, fid)}
            dataKey="date"
            categories={['score']}
            colors={['blue']}
            showLegend={false}
            startEndOnly={true}
            marginTop="mt-12"
            valueFormatter={d => d.toLocaleString()}
            yAxisWidth="w-10"
          />:<CardLoading />}
        </div>
      </div>
    </Card>
  );
}
