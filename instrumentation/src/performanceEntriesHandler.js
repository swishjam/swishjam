class PerformanceEntriesHandler {
  constructor(reportingHandler, options = {}) {
    this.reportingHandler = reportingHandler;
    this.performanceEntryTypesToCapture = options.performanceEntryTypesToCapture || ["paint", "longtask", "navigation", "resource", "largest-contentful-paint", "first-input", "layout-shift"];
    this.ignoredPerformanceEntryUrls = [
      ...(options.ignoredPerformanceEntryUrls || []),
      ...(options.includeSwishjamResourcesEntries ? [] : [options.reportingUrl])
    ];
  }

  beginCapturingPerformanceEntries() {
    this._getPerformanceEntries().forEach(entry => {
      if (!this.ignoredPerformanceEntryUrls.includes(entry.name)) {
        this.reportingHandler.recordEvent('PERFORMANCE_ENTRY', this._formattedPerformanceEntry(entry));
      }
    });
    this._onPerformanceEntries(newPerformanceEntries => {
      newPerformanceEntries.forEach(entry => {
        if (!this.ignoredPerformanceEntryUrls.includes(entry.name)) {
          this.reportingHandler.recordEvent('PERFORMANCE_ENTRY', this._formattedPerformanceEntry(entry));
        }
      });
    });
  }

  _onPerformanceEntries(callback) {
    if(!window.PerformanceObserver) return;
    return new PerformanceObserver((list, _observer) => {
      callback(list.getEntries())
    }).observe({ entryTypes: this.performanceEntryTypesToCapture });
  }

  _getPerformanceEntries() {
    if(!window.performance || !window.performance.getEntries) return [];
    return window.performance.getEntries().filter(entry => this.performanceEntryTypesToCapture.includes(entry.entryType));
  }

  _formattedPerformanceEntry(entry) {
    // not every performance entry has a URL attribute, for now we will set it to an empty string if it is not present
    let formattedEntry = { 
      ...entry.toJSON(), 
      name: encodeURIComponent(entry.name || ""),
      url: encodeURIComponent(entry.url || ""),
    };
    if (formattedEntry.attribution && formattedEntry.attribution.length > 0) {
      formattedEntry.attribution = formattedEntry.attribution.map(attribution => {
        return {
          ...attribution.toJSON(),
          name: encodeURIComponent(attribution.name || ""),
          url: encodeURIComponent(attribution.url || ""),
        }
      });
    }
    return formattedEntry;
  }
}

module.exports = { PerformanceEntriesHandler }