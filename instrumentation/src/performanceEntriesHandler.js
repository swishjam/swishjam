export class PerformanceEntriesHandler {
  constructor() {
    this.performanceObserver = new PerformanceObserver(this._onPerformanceEntries);
    this._entryTypesToObserve = ['paint', 'longtask', 'navigation', 'resource', 'largest-contentful-paint', 'first-input', 'layout-shift'];
  }

  listenForPerformanceEntries() {
    this.performanceObserver.observe({ entryTypes: this._entryTypesToObserve });
  }

  _onPerformanceEntries(list, _observer) {
    const entries = list.getEntries();
    console.log(`Got ${entries.length} performance entries:`);
    console.log(entries);
  }
}