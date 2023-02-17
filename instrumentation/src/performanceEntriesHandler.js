export class PerformanceEntriesHandler {
  constructor(performanceEntriesToCapture, options = {}) {
    this.performanceEntriesToCapture = performanceEntriesToCapture;
    this.maxNumPerformanceEntriesPerPageLoad = options.maxNumPerformanceEntriesPerPageLoad || 250;
    this.numPerformanceEntriesReported = 0;
  }

  onPerformanceEntries(callback) {
    if(!window.PerformanceObserver) return;
    return new PerformanceObserver((list, observer) => {
      callback(list.getEntries());
      if(this.numPerformanceEntriesReported >= this.maxNumPerformanceEntriesPerPageLoad) {
        observer.disconnect();
      }
    }).observe({ entryTypes: this.performanceEntriesToCapture });
  }

  getPerformanceEntries() {
    if(!window.performance || !window.performance.getEntries) return [];
    const performanceEntries = window.performance.getEntries().filter(entry => this.performanceEntriesToCapture.includes(entry.entryType));
    this.numPerformanceEntriesReported += performanceEntries.length;
    return performanceEntries;
  }
}