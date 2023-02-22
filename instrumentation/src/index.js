import { sampleRate } from '../config';
import { ReportingHandler } from './reportingHandler';
import { PageViewTracker } from './pageViewTracker';
import { PerformanceEntriesHandler } from './performanceEntriesHandler';
import { PerformanceMetricsHandler } from './performanceMetricsHandler';

(function() {
  if (Math.random() > (sampleRate || 1.0)) {
    console.warn('SwishJam sample rate not met, not instrumenting page');
  } else {
    const reportingHandler = new ReportingHandler();
    const pageViewTracker = new PageViewTracker(reportingHandler);
    let currentUrl = pageViewTracker.trackPageView({ navigationType: 'hard', previousPageUrl: document.referrer });
  
    new PerformanceEntriesHandler(reportingHandler).beginCapturingPerformanceEntries();
    new PerformanceMetricsHandler(reportingHandler).beginCapturingPerformanceMetrics();
  
    window.addEventListener('hashchange', () => {
      currentUrl = pageViewTracker.trackPageView({ navigationType: 'soft', previousPageUrl: currentUrl })
    });
    window.addEventListener('popstate', () => {
      currentUrl = pageViewTracker.trackPageView({ navigationType: 'soft', previousPageUrl: currentUrl })
    });
    if (window.history.pushState) {
      const originalPushState = window.history.pushState
      window.history.pushState = function () {
        originalPushState.apply(this, arguments);
        currentUrl = pageViewTracker.trackPageView({ navigationType: 'soft', previousPageUrl: currentUrl });
      }
    }
  }
})();