const { 
  formattedNavigationEntry,
  longtaskEntry,
  paintEntry,
  formattedResourceEntry,
  largestContentfulPaintEntry,
  firstInputEntry,
  layoutShiftEntry,
  elementEntry,
  eventEntry,
  markEntry,
  measureEntry,
} = require('./resourceFormatters');

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
    return new PerformanceObserver( (list, _observer) => callback(list.getEntries()) ).observe({ entryTypes: this.performanceEntryTypesToCapture });
  }

  _getPerformanceEntries() {
    if(!window.performance || !window.performance.getEntries) return [];
    return window.performance.getEntries().filter(entry => this.performanceEntryTypesToCapture.includes(entry.entryType));
  }

  _formattedPerformanceEntry(entry) {
    switch(entry.entryType) {
      case "paint":
        return paintEntry(entry);
      case "longtask":
        return longtaskEntry(entry);
      case "navigation":
        return formattedNavigationEntry(entry);
      case "resource":
        return formattedResourceEntry(entry);
      case "largest-contentful-paint":
        return largestContentfulPaintEntry(entry);
      case "first-input":
        return firstInputEntry(entry);
      case "layout-shift":
        return layoutShiftEntry(entry);
      case 'element':
        return elementEntry(entry);
      case 'event':
        return eventEntry(entry);
      case 'mark':
        return markEntry(entry);
      case 'measure':
        return measureEntry(entry);
      default:
        return entry.toJSON();
    }
  }
}

module.exports = { PerformanceEntriesHandler }