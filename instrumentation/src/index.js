import { ReportingHandler } from './reportingHandler';
import { PageViewTracker } from './pageViewTracker';
import { PerformanceEntriesHandler } from './performanceEntriesHandler';
import { PerformanceMetricsHandler } from './performanceMetricsHandler';

(function() {
  const reportingHandler = new ReportingHandler();
  const pageViewTracker = new PageViewTracker(reportingHandler);
  let currentUrl = pageViewTracker.trackPageView({ previousPageUrl: document.referrer });

  new PerformanceEntriesHandler(reportingHandler).beginCapturingPerformanceEntries();
  new PerformanceMetricsHandler(reportingHandler).beginCapturingPerformanceMetrics();

  window.addEventListener('hashchange', () => currentUrl = pageViewTracker.trackPageView({ previousPageUrl: currentUrl }));
  window.addEventListener('popstate', () => currentUrl = pageViewTracker.trackPageView({ previousPageUrl: currentUrl }));
  if (window.history.pushState) {
    const originalPushState = window.history.pushState
    window.history.pushState = function () {
      originalPushState.apply(this, arguments);
      currentUrl = pageViewTracker.trackPageView({ previousPageUrl: currentUrl });
    }
  }
})();