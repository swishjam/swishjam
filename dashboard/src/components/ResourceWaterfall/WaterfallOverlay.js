import PerformanceMetricIndicator from './PerformanceMetricIndicator';

export default function WaterfallOverlay({ performanceMetrics, navigationPerformanceEntries }) {
  const performanceTicks = performanceMetrics.filter(metric => ['LCP', 'FCP', 'TTFB'].includes(metric.name)).map(metric => {
    return (<PerformanceMetricIndicator key={metric.name} metric={metric} />)
  })

  performanceTicks.push(<PerformanceMetricIndicator key='DOMComplete' metric={{ name: 'DOM Complete',  value: navigationPerformanceEntries.dom_complete }} />)
  performanceTicks.push(<PerformanceMetricIndicator key='DOMContentLoaded' metric={{ name: 'DOM Content Loaded', value: navigationPerformanceEntries.dom_content_loaded_event_start }} />)
  performanceTicks.push(<PerformanceMetricIndicator key='DOMInteractive' metric={{ name: 'DOM Interactive', value: navigationPerformanceEntries.dom_interactive }} />)
  performanceTicks.push(<PerformanceMetricIndicator key='LoadEvent' metric={{ name: 'Load', value: navigationPerformanceEntries.load_event_end }} />)
    
  return performanceTicks;
}