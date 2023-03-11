import PerformanceMetricIndicator from './PerformanceMetricIndicator';

export default function WaterfallOverlay({ performanceMetrics, navigationPerformanceEntriesAverages, maxTimestamp }) {
  const performanceTicks = performanceMetrics.filter(metric => ['LCP', 'FCP', 'TTFB'].includes(metric.name)).map(metric => {
    return (<PerformanceMetricIndicator key={metric.name} metric={metric} maxTimestamp={maxTimestamp} />)
  })

  // AVG(duration) AS average_duration,
  //   AVG(dom_complete) AS average_dom_complete,
  //     AVG(dom_interactive) AS average_dom_interactive,
  //       AVG(dom_content_loaded_event_start) AS average_dom_content_loaded_event_start,
  //         AVG(dom_content_loaded_event_end) AS average_dom_content_loaded_event_end,
  //           AVG(load_event_start) AS average_load_event_start,
  //             AVG(load_event_end) AS average_load_event_end
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
    
  return (performanceTicks)
}