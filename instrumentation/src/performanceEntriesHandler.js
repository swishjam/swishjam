import { performanceEntryTypesToCapture, includeSwishJamResourcesEntries, reportingUrl } from '../config';

export class PerformanceEntriesHandler {
  constructor(reportingHandler) {
    this.reportingHandler = reportingHandler;
    this.performanceEntryTypesToCapture = performanceEntryTypesToCapture || ["paint", "longtask", "navigation", "resource", "largest-contentful-paint", "first-input", "layout-shift"];
    this.ignoredPerformanceEntryUrls = includeSwishJamResourcesEntries ? [] : [reportingUrl]
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