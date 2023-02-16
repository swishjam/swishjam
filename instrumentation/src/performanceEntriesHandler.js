export class PerformanceEntriesHandler {
  constructor() {
    this.performanceObserver = new PerformanceObserver(this._onPerformanceEntries);
    this.performanceObserver.observe({
      entryTypes: ['paint', 'longtask', 'navigation', 'resource', 'largest-contentful-paint', 'first-input', 'layout-shift']
    });
  }

  _onPerformanceEntries(list, _observer) {
    const entries = list.getEntries();
    console.log(`Got ${entries.length} performance entries:`);
    console.log(entries);
  }
}