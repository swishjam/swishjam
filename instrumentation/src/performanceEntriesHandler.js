export class PerformanceEntriesHandler {
  constructor(reportingHandler, options = {}) {
    this.reportingHandler = reportingHandler;
    this.performanceEntryTypesToCapture = options.performanceEntryTypesToCapture || ["paint", "longtask", "navigation", "resource", "largest-contentful-paint", "first-input", "layout-shift"];
    this.ignoredPerformanceEntryUrls = [
      ...(options.ignoredPerformanceEntryUrls || []),
      ...(options.includeSwishJamResourcesEntries ? [] : [options.reportingUrl])
    ];
  }

  beginCapturingPerformanceEntries() {
    this._getPerformanceEntries().forEach(entry => {
      if (!this.ignoredPerformanceEntryUrls.includes(entry.name)) {
        this.reportingHandler.recordEvent('PERFORMANCE_ENTRY', entry.toJSON());
      }
    });
    this._onPerformanceEntries(newPerformanceEntries => {
      newPerformanceEntries.forEach(entry => {
        if (!this.ignoredPerformanceEntryUrls.includes(entry.name)) {
          this.reportingHandler.recordEvent('PERFORMANCE_ENTRY', entry.toJSON());
        }
      });
    });
  }

  _onPerformanceEntries(callback) {
    if(!window.PerformanceObserver) return;
    return new PerformanceObserver((list, _observer) => callback(list.getEntries())).observe({ entryTypes: this.performanceEntryTypesToCapture });
  }

  _getPerformanceEntries() {
    if(!window.performance || !window.performance.getEntries) return [];
    return window.performance.getEntries().filter(entry => this.performanceEntryTypesToCapture.includes(entry.entryType));
  }
}