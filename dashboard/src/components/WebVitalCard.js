'use client';
import { Card, Metric, Text, Flex, CategoryBar, AreaChart } from '@tremor/react';
import { LcpIcon, InpIcon, ClsIcon, FidIcon, FcpIcon, TtfbIcon } from '@components/WebVitalIcons';
import LoadingSpinner from '@components/LoadingSpinner';
import { msToSeconds, metricFormatter, metricFormatterPlusUnits } from '@lib/utils';
import Link from 'next/link';

const CardLoading = () => (   
  <div className='flex'>
    <div className='m-auto py-20'>
      <LoadingSpinner size={8} />
    </div>
  </div>
)

const CardIcon = (iconType) => {
  if(iconType === 'LCP') {
    return <LcpIcon />
  }  
  if(iconType === 'INP') {    
    return <InpIcon />
  }
  if(iconType === 'CLS') {    
    return <ClsIcon />
  }
  if(iconType === 'FID') {    
    return <FidIcon />
  }
  if(iconType === 'FCP') {    
    return <FcpIcon />
  }
  if(iconType === 'TTFB') {    
    return <TtfbIcon />
  }
  return (<></>)
}

const calcLocationOnBar = (score) => {
  // green score is 90+, bar range is 0 <-> 33
  // yellow score is 50-90, bar range is 34 <-> 67
  // red score is <50, bar range is 68 <-> 100
  // The bar is flipped though so 100 needs to convert to 0
  if(score >= 90) {
    let x = 100 - score;
    return (33*x)/10 
  } 
  if(score >= 50 && score < 90) {
    // LOL this isn't that smart but it works 
    return score-22
  }
  if(score < 50) {
    // LOL this isn't that smart but it works 
    let s = 100 - score + 22;  
    return s > 100 ? 100: s;  
  }
  return 0;
}

export default function WebVitalCard({ title, accronym, metric, timeseriesData, shouldLinkToCwvDetails = true }, ...props) {
  return (
    <Card>
      {metric === null ? (
        <>
          {/* {shouldLinkToCwvDetails ? 
            <Link href={`/cwv/${accronym}`} className='hover:underline'><Text>{title}</Text></Link> :
            <Text>{title}</Text>
          } */}
          <Text>{title}</Text>
          <Flex justifyContent="justify-start" alignItems="items-baseline" spaceX="space-x-1">
            <Metric></Metric>
          </Flex>
          <CardLoading />
        </>
      ) : (
        <>
          {/* {shouldLinkToCwvDetails ?
            <Link href={`/cwv/${accronym}`} className='hover:underline'><Text>{title}</Text></Link> :
            <Text>{title}</Text>
          } */}
          <dt className="flex items-center gap-x-3 text-base leading-7 text-gray-900">
            {CardIcon(accronym)}
            {title}
          </dt>
          <Flex justifyContent="justify-start" alignItems="items-baseline" spaceX="space-x-1">
            <Metric color={metric.rating == 'pass' ?  'emerald': (metric.rating == 'average' ? 'yellow':'rose')}>
              {metricFormatter(metric.value, metric.metricScoring.displayUnits)}
            </Metric>
            <Text>{metric.metricScoring.displayUnits}</Text>
          </Flex>
          <CategoryBar
            categoryPercentageValues={[33,34,33]}
            colors={['emerald', 'yellow', 'rose']}
            percentageValue={calcLocationOnBar(metric.score)}
            tooltip={metricFormatterPlusUnits(metric.value, metric.metricScoring.displayUnits)}
            showLabels={false}
            marginTop="mt-5"
          />
          {timeseriesData === undefined ?
            <CardLoading /> : timeseriesData.length > 0 ? (
              <AreaChart
                data={timeseriesData}
                dataKey="timestamp"
                categories={['p90']}
                colors={['blue']}
                showLegend={false}
                startEndOnly={true}
                valueFormatter={value => metricFormatter(value)}
                height="h-48"
                marginTop="mt-10"
              />
            ) : (
              <div className='flex justify-center items-center py-12'>
                <Text>No data available for timeframe</Text>
              </div>
            )
          }
        </>
      )}
    </Card>
  );
}
