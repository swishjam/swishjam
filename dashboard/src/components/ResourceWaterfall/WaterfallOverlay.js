import PerformanceMetricIndicator from './PerformanceMetricIndicator';

export default function WaterfallOverlay({ performanceMetrics, navigationPerformanceEntriesAverages, maxTimestamp }) {
  const performanceTicks = performanceMetrics.filter(metric => ['LCP', 'FCP', 'TTFB'].includes(metric.name)).map(metric => {
    return (<PerformanceMetricIndicator key={metric.name} metric={metric} maxTimestamp={maxTimestamp} />)
  })

  performanceTicks.push(
    <PerformanceMetricIndicator key='DOMComplete' 
                                maxTimestamp={maxTimestamp}
                                metric={{ name: 'DOM Complete',  average: navigationPerformanceEntriesAverages.average_dom_complete }}  />
  )

  performanceTicks.push(
    <PerformanceMetricIndicator key='DOMContentLoaded'
                                maxTimestamp={maxTimestamp}
                                metric={{ name: 'DOM Content Loaded', average: navigationPerformanceEntriesAverages.average_dom_content_loaded_event_start }} />
  )


  performanceTicks.push(
    <PerformanceMetricIndicator key='DOMInteractive'
                                maxTimestamp={maxTimestamp}
                                metric={{ name: 'DOM Interactive', average: navigationPerformanceEntriesAverages.average_dom_complete }} />
  )

  performanceTicks.push(
    <PerformanceMetricIndicator key='LoadEvent'
                                maxTimestamp={maxTimestamp}
                                metric={{ name: 'Load', average: navigationPerformanceEntriesAverages.average_load_event_end }} />
  )
    
  return performanceTicks;
}