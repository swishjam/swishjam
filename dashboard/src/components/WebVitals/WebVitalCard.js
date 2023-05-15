'use client';
import { Card, Metric, Text } from '@tremor/react';
import BarChart from '@/components/Charts/BarChart';
import { LcpIcon, InpIcon, ClsIcon, FidIcon, FcpIcon, TtfbIcon } from '@/components/WebVitals/WebVitalIcons';
import { formattedMsOrSeconds } from '@lib/utils';
import { cwvMetricBounds } from '@lib/cwvCalculations';
import MetricGauge from '@/components/WebVitals/MetricGauge';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const CardIcon = iconType => {
  return {
    LCP: <LcpIcon />,
    INP: <InpIcon />,
    CLS: <ClsIcon />,
    FID: <FidIcon />,
    FCP: <FcpIcon />,
    TTFB: <TtfbIcon />
  }[iconType] || <></>;
}

export default function WebVitalCard({ title, accronym, percentileValue, numRecordsInPercentileCalculation, barChartData }) {
  const percentileColor = percentileValue <= cwvMetricBounds[accronym].good ? 'emerald' : 
                            percentileValue <= cwvMetricBounds[accronym].medium ? 'yellow' : 'rose';
  return (
    <Card>
      <>
        <dt className="flex items-center gap-x-3 text-base leading-7 text-gray-900">
          {CardIcon(accronym)}
          <span className='hover:underline hover:text-swishjam duration-300 transition'>
            <Link className="hover:text-swishjam" href={`/cwv/${accronym}`}>{title}</Link>
          </span>
        </dt>
        {typeof numRecordsInPercentileCalculation === 'number'
                  ? (
                    <div className='my-2'>
                      <Metric color={typeof percentileValue === 'number' ? percentileColor : 'gray'}>
                        {typeof percentileValue === 'number' 
                          ? accronym === 'CLS' ? parseFloat(percentileValue).toFixed(4) : formattedMsOrSeconds(percentileValue)
                          : '--'
                        }
                      </Metric>
                      <div className='mt-4'>
                        <MetricGauge accronym={accronym} percentileValue={percentileValue} />
                      </div>
                    </div>
                  ) : <div className='my-2 animate-pulse w-20 h-10 bg-gray-200 rounded'></div>
        }
        {barChartData === undefined ? <div className='animate-pulse w-full h-48 mt-4 bg-gray-200 rounded' /> : 
            barChartData.length > 0 ? (
              <>
                <BarChart
                  data={barChartData}
                  xAxisKey="date"
                  keys={['percentGood', 'percentNeedsImprovement', 'percentPoor', 'noData']}
                  colors={['rgb(16, 185, 129)', 'rgb(234, 179, 8)', 'rgb(244, 63, 94)', '#9499a3']}
                  stacked={true}
                  includeLegend={false}
                  includeYAxis={false}
                  yAxisDataFormatter={value => `${parseFloat(value).toFixed(2)}%`}
                  yAxisMin={0}
                  yAxisMax={100}
                  height='h-48'
                  yAxisNameFormatter={value => {
                    switch(value) {
                      case 'percentGood':
                        return 'Good';
                      case 'percentNeedsImprovement':
                        return 'Needs Improvement';
                      case 'percentPoor':
                        return 'Poor';
                      default:
                        return value;
                    }
                  }}
                  hideTooltipNames={['noData']}
                  tooltipDisplay={({ label }) => {
                    const dataForDate = barChartData.find(data => data.date === label);
                    if (!dataForDate) return;
                    if (dataForDate.noData === 100) {
                      return (
                        <div className="custom-tooltip bg-white w-fit p-4 relative border border-gray-300 rounded-lg min-w-72 text-center">
                          <span className="text-sm text-gray-700">Not enough data for {label}</span>
                        </div>
                      )
                    }                   
                  }}
                  tooltipDescriptionFormatter={dateString => {
                    const dataForDate = barChartData.find(data => data.date === dateString);
                    if (!dataForDate) return;
                    return `Based on ${dataForDate.total} total records`
                  }}
                />
                <div className='flex justify-end mt-4'>
                  <Link
                    href={`/cwv/${accronym}`}
                    className='hover:text-swishjam duration-300 transition px-2.5 py-1 text-xs font-semibold text-gray-900'
                  >
                    View Details
                    <span className='text-sm pl-2'>&#8250;</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className='flex justify-center items-center py-12'>
                <Text>No data available for timeframe</Text>
              </div>
            )
        }
      </>
    </Card>
  );
}

