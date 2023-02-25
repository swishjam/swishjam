import { ReportingHandler } from './reportingHandler';
import { PageViewTracker } from './pageViewTracker';
import { PerformanceEntriesHandler } from './performanceEntriesHandler';
import { PerformanceMetricsHandler } from './performanceMetricsHandler'; 

export class Swishjam {
  static init(options = {}) {
    options = Swishjam._setConfig(options);
    window.Swishjam = { config: options };
    if (Math.random() > options.sampleRate) {
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

      if (!options.disablePerformanceEntriesCapture) {
        new PerformanceEntriesHandler(reportingHandler, {
          performanceEntryTypesToCapture: options.performanceEntryTypesToCapture, 
          includeSwishjamResourcesEntries: options.includeSwishjamResourcesEntries,
          reportingUrl: options.reportingUrl,
        }).beginCapturingPerformanceEntries();
      }
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

  static _setConfig(config) {
    if (!config.reportingUrl) throw new Error('Swishjam `reportingUrl` is required');
    if (!config.publicApiKey) throw new Error('Swishjam `publicApiKey` is required');
    return {
      reportingUrl: config.reportingUrl,
      publicApiKey: config.publicApiKey,
      sampleRate: config.sampleRate || 1.0,
      maxNumEventsInMemory: config.maxNumEventsInMemory || 25,
      reportAfterIdleTimeMs: config.reportAfterIdleTimeMs || 10_000,
      reportingIdleTimeCheckInterval: config.reportingIdleTimeCheckInterval || 2_000,
      mockApiCalls: config.mockApiCalls || false,
      performanceEntryTypesToCapture: config.performanceEntryTypesToCapture || ['navigation', 'paint', 'resource', 'longtask', 'largest-contentful-paint', 'layout-shift'],
      includeSwishjamResourcesEntries: config.includeSwishjamResourcesEntries || false,
      disablePerformanceEntriesCapture: config.disablePerformanceEntriesCapture || false,
    }
  }
}