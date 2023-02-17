export class PerformanceEntriesHandler {
  constructor() {
    this.performanceObserver = window.PerformanceObserver !== undefined ? new PerformanceObserver(this._onPerformanceEntries) : null;
  }

  listenForPerformanceEntries(entryTypes) {
    if(!this.performanceObserver) return;
    this.performanceObserver.observe({ entryTypes });
  }

  getPerformanceEntries(entryTypes) {
    if(!this.performanceObserver) return [];
    return window.performance.getEntries().filter(entry => entryTypes.includes(entry.entryType));
  }

  _onPerformanceEntries(list, _observer) {
    const entries = list.getEntries();
    console.log(`Got ${entries.length} performance entries:`);
    console.log(entries);
  }
}