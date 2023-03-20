const { UuidGenerator } = require('./uuidGenerator');
const EVENT_TYPES = ['PAGE_VIEW', 'PAGE_LEFT', 'PAGE_LOAD_METRIC', 'PERFORMANCE_ENTRY'];

class ReportingHandler {
  constructor(options = {}) {
    this.reportingUrl = options.reportingUrl || (() => { throw new Error('`ReportingHandler` missing required option: `reportingUrl`.') })();
    this.publicApiKey = options.publicApiKey || (() => { throw new Error('`ReportingHandler` missing required option: `publicApiKey`.') })();
    this.maxNumEventsInMemory = options.maxNumEventsInMemory || 25;
    this.reportAfterIdleTimeMs = options.reportAfterIdleTimeMs || 10_000;
    this.reportingIdleTimeCheckInterval = options.reportingIdleTimeCheckInterval || 5_000;
    this.mockApiCalls = options.mockApiCalls || false;
    this.dataToReport = [];
    this._setReportingOnIdleTimeInterval();
  }

  setCurrentPageViewIdentifier(pageViewIdentifier) {
    this.currentPageViewIdentifier = pageViewIdentifier;
  }

  recordEvent(eventName, data, uuid = null) {
    if (!EVENT_TYPES.includes(eventName)) throw new Error(`Invalid event: ${eventName}. Valid event types are: ${EVENT_TYPES.join(', ')}.`);
    if (!this.currentPageViewIdentifier) throw new Error('ReportingHandler has no currentPageViewIdentifier, cannot record event.');
    this.dataToReport.push({ 
      _event: eventName, 
      uuid: uuid || UuidGenerator.generate(eventName.toLowerCase()),
      siteId: this.publicApiKey,
      projectKey: this.publicApiKey,
      pageViewUuid: this.currentPageViewIdentifier,
      ts: Date.now(), 
      data 
    });
    this.lastEventRecordedAtTs = Date.now();
    if (this.dataToReport.length >= this.maxNumEventsInMemory) {
      this._reportDataIfNecessary();
    }
  }

  reportData = this._reportDataIfNecessary;

  _hasDataToReport() {
    return this.dataToReport.length > 0;
  }

  _setReportingOnIdleTimeInterval() {
    setInterval(() => {
      if (this.lastEventRecordedAtTs && Date.now() - this.lastEventRecordedAtTs >= this.reportAfterIdleTimeMs) {
        this._reportDataIfNecessary()
      }
    }, this.reportingIdleTimeCheckInterval);
  }

  _reportDataIfNecessary() {
    if (!this._hasDataToReport()) return;
    const body = { 
      siteId: this.publicApiKey, 
      projectKey: this.publicApiKey, 
      originatingUrl: window.encodeURIComponent(window.location.href), 
      data: this.dataToReport 
    };
    if (this.mockApiCalls) {
      console.log('Reporting data to mock API', body);
    } else if (navigator.sendBeacon) {
      try {
        // TODO: we're swallowing errors here. JSON stringifying causes circular dependency errors when DOM nodes are in the data.
        const blob = new Blob([JSON.stringify(body)], {});
        window.navigator.sendBeacon(this.reportingUrl, blob);
      } catch(err) {}
    } else {
      try {
        // TODO: we're swallowing errors here. JSON stringifying causes circular dependency errors when DOM nodes are in the data.
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.reportingUrl);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.send(JSON.stringify(body));
      } catch(err) {}
    }
    this.dataToReport = [];
  }
}

module.exports = { ReportingHandler }