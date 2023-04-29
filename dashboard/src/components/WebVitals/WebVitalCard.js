'use client';
import { Card, Metric, Text, Flex, BarChart } from '@tremor/react';
import { LcpIcon, InpIcon, ClsIcon, FidIcon, FcpIcon, TtfbIcon } from '@/components/WebVitals/WebVitalIcons';
import { formattedMsOrSeconds } from '@lib/utils';
import { cwvMetricBounds } from '@lib/cwvCalculations';
import MetricGauge from '@/components/WebVitals/MetricGauge';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const CardIcon = (iconType) => {
  return {
    LCP: <LcpIcon />,
    INP: <InpIcon />,
    CLS: <ClsIcon />,
    FID: <FidIcon />,
    FCP: <FcpIcon />,
    TTFB: <TtfbIcon />
  }[iconType] || <></>;
}

export default function WebVitalCard({ title, accronym, percentileValue, numRecordsInPercentileCalculation, barChartData }, ...props) {
  const formattedBarChartData = barChartData && barChartData.map(data => {
    return ({
      date: data.date,
      'Good': parseFloat(data.percentGood).toFixed(2),
      'Needs Improvement': parseFloat(data.percentNeedsImprovement).toFixed(2),
      'Poor': parseFloat(data.percentPoor).toFixed(2),
    })
  });

  const percentileColor = percentileValue <= cwvMetricBounds[accronym].good ? 'emerald' : 
                            percentileValue <= cwvMetricBounds[accronym].medium ? 'yellow' : 'rose';
  return (
    <Card>
      <>
        <dt className="flex items-center gap-x-3 text-base leading-7 text-gray-900">
          {CardIcon(accronym)}
          <span className='hover:underline hover:text-swishjam duration-300 transition'>
            <Link
              className="hover:text-swishjam"
              href={`/cwv/${accronym}`}
            >{title}</Link>
          </span>
        </dt>
        {typeof numRecordsInPercentileCalculation === 'number' ?
                  numRecordsInPercentileCalculation > 0 ? (
                    <div className='mt-2'>
                      <Metric color={percentileColor}>
                        {accronym === 'CLS' ? parseFloat(percentileValue).toFixed(4) : formattedMsOrSeconds(percentileValue)}
                      </Metric>
                      <div className='mt-4'>
                        <MetricGauge accronym={accronym} percentileValue={percentileValue} />
                      </div>
                    </div>
                  ) : <Metric>--</Metric> :
                  <div className='animate-pulse w-20 h-10 bg-gray-200 rounded'></div>
        }
        {formattedBarChartData === undefined ? <div className='animate-pulse w-full h-48 mt-4 bg-gray-200 rounded'></div> : 
            formattedBarChartData.length > 0 ? (
              <>
                <BarChart
                  data={formattedBarChartData}
                  dataKey="date"
                  categories={['Good', 'Needs Improvement', 'Poor']}
                  colors={['green', 'yellow', 'red']}
                  showLegend={false}
                  startEndOnly={true}
                  valueFormatter={value => `${value}%`}
                  height="h-48"
                  marginTop="mt-4"
                  stack={true}
                  maxValue={100.0}
                  showYAxis={false}
                  showAnimation={false}
                />
                <div class='flex justify-end mt-4'>
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

