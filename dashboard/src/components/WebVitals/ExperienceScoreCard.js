'use client';
import { PieChart, Pie, Sector, Cell } from 'recharts';
import Link from 'next/link';
import { Card, AreaChart } from "@tremor/react";
import LoadingSpinner from '@components/LoadingSpinner';
import { calcCwvMetric } from '@lib/cwvCalculations';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

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

const calculateTimeseries = timeseriesData => {
  if (timeseriesData && timeseriesData.LCP && timeseriesData.CLS && timeseriesData.FCP && timeseriesData.FID) {
    const allTimeseriesArr = [...timeseriesData.LCP, ...timeseriesData.CLS, ...timeseriesData.FCP, ...timeseriesData.FID];
    let timeSeriesLookup = {};
    allTimeseriesArr.map(ata => {
      const count = timeSeriesLookup[ata.date] ? timeSeriesLookup[ata.date].count + 1 : 1;
      const score = timeSeriesLookup[ata.date] ? timeSeriesLookup[ata.date]['Swishjam Experience Score'] + ata.weightedScore : ata.weightedScore;

      if(timeSeriesLookup[ata.date]) {
        timeSeriesLookup[ata.date] = { ...timeSeriesLookup[ata.date], [ata.key]: ata.value, count, 'Swishjam Experience Score': score }
      } else {
        timeSeriesLookup[ata.date] = { [ata.key]: ata.value, count, 'Swishjam Experience Score': score }
      } 
    })

    let finalTimeseriesArr = [];
    for (const [key, value] of Object.entries(timeSeriesLookup)) {
      value.date = key;
      finalTimeseriesArr.push(value)
    }
    
    const filteredFinalTimeseries = finalTimeseriesArr.filter ( i => i.count >= 4 ) 
    return filteredFinalTimeseries
  } else {
    return [{}];
  }
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

export default function ExperienceScoreCard({ timeseriesData, metricPercentiles, numPageViews }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover', placement: 'left' });
  let metricPercentilesWithExperienceScore = {};
  Object.keys(metricPercentiles).forEach(cwvKey => {
    metricPercentilesWithExperienceScore[cwvKey] = {
      ...metricPercentiles[cwvKey],
      ...calcCwvMetric(metricPercentiles[cwvKey].value, cwvKey)
    }
  });

  const experienceScore = metricPercentilesWithExperienceScore.LCP?.weightedScore +
                            metricPercentilesWithExperienceScore.FID?.weightedScore +
                            metricPercentilesWithExperienceScore.CLS?.weightedScore +
                            metricPercentilesWithExperienceScore.FCP?.weightedScore;
  const roundedScore = Math.ceil(experienceScore)
  const data = resScore(roundedScore); 
  const experienceScoreTimeseriesData = calculateTimeseries(timeseriesData);
  const COLORS = ['#f1f5f9', (roundedScore >= 90 ? '#10b981': (roundedScore >= 50 ? '#eab308': '#f43f5e'))];
  
  return (
    <Card>
      <div className='flex'>
        <div className="w-1/3 flex flex-col pr-4">
          <h2 className="text-center text-lg font-normal text-gray-900">
            Swishjam's Real User Experience Score
          </h2>
          <Link href="https://swishjam.com/blog/understanding-swishjam-experience-score" target="_blank">
            <InformationCircleIcon ref={setTriggerRef} className='h-6 w-6 absolute top-6 right-6 text-gray-400 hover:text-swishjam transition duration-300 cursor-pointer'/> 
          </Link> 
          {visible && (
            <>
              <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container p-4 text-xs text-gray-700' })}>
                Click the info button to learn more about how we calculate <br />the Swishjam real user experience score
                <div {...getArrowProps({ className: 'tooltip-arrow' })} />
              </div>
            </>
          )}
          {Object.keys(metricPercentilesWithExperienceScore || {}).length > 0 ? (
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
          ) : (
            <>
              <div className='p-4 animate-pulse mx-auto text-center' style={{ height: '200px', width: '200px' }}>
                <div className='rounded-full border-8 border-gray-200 h-full w-full flex items-center justify-center'>
                  <div className='h-12 w-8 animate-pulse bg-gray-200 rounded' />
                  <div className='h-12 w-8 animate-pulse bg-gray-200 rounded ml-1' />
                </div>
              </div>
            </>
          )}
          <div className="flex mt-6">
            <div className="flex items-center text-swishjam mx-auto text-center min-w-fit rounded-full bg-white py-2.5 px-4 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300">
              {typeof numPageViews === 'number' ? numPageViews : <div className='inline-block h-4 w-8 animate-pulse bg-gray-300 rounded mr-2' />} Page Views
            </div>
          </div> 
        </div>
        <div className="w-2/3 flex items-center justify-center">
          {timeseriesData === undefined 
            ? <div className='mt-12 h-64 w-full animate-pulse rounded bg-gray-200' />
            : experienceScoreTimeseriesData.length > 0
                ? <AreaChart
                    data={experienceScoreTimeseriesData}
                    dataKey="date"
                    categories={['Swishjam Experience Score']}
                    colors={['blue']}
                    showLegend={false}
                    startEndOnly={true}
                    marginTop="mt-12"
                    valueFormatter={d => d.toLocaleString()}
                    yAxisWidth="w-10"
                  /> 
                : <span className='text-sm text-gray-500'>Not enough data for the last 7 days.</span>}
        </div>
      </div>
    </Card>
  );
}
