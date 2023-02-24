import { ReportingHandler } from './reportingHandler';
import { PageViewTracker } from './pageViewTracker';
import { PerformanceEntriesHandler } from './performanceEntriesHandler';
import { PerformanceMetricsHandler } from './performanceMetricsHandler'; 

export class Swishjam {
  static init(options = {}) {
    window.Swishjam = { config: options };
    if (Math.random() > (options.sampleRate || 1.0)) {
      console.warn('Swishjam sample rate not met, not instrumenting page');
    } else {
      const reportingHandler = new ReportingHandler({
        reportingUrl: options.reportingUrl,
        publicApiKey: options.publicApiKey,
        maxNumEventsInMemory: options.maxNumEventsInMemory,
        reportAfterIdleTimeMs: options.reportAfterIdleTimeMs,
        reportingIdleTimeCheckInterval: options.reportingIdleTimeCheckInterval,
        mockApiCalls: options.mockApiCalls,
      });
      const pageViewTracker = new PageViewTracker(reportingHandler);
      let currentUrl = pageViewTracker.trackPageView({ navigationType: 'hard', previousPageUrl: document.referrer });

      new PerformanceEntriesHandler(reportingHandler, {
        performanceEntryTypesToCapture: options.performanceEntryTypesToCapture, 
        includeSwishjamResourcesEntries: options.includeSwishjamResourcesEntries,
        reportingUrl: options.reportingUrl,
      }).beginCapturingPerformanceEntries();
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
  }
}