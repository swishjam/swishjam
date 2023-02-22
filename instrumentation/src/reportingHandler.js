import { UuidGenerator } from './uuidGenerator';
import { 
  reportingUrl, 
  publicApiKey, 
  maxNumEventsInMemory, 
  reportAfterIdleTimeMs,
  reportingIdleTimeCheckInterval,
  mockApiCalls,
} from '../config';
const EVENT_TYPES = ['PAGE_VIEW', 'PAGE_LEFT', 'PAGE_LOAD_METRIC', 'PERFORMANCE_ENTRY'];

export class ReportingHandler {
  constructor() {
    if (!publicApiKey) throw new Error('No public API key provided. Please provide a public API key in the config file.');
    if (!reportingUrl) throw new Error('No reporting URL provided. Please provide a reporting URL in the config file.');
    this.dataToReport = [];
    this._setReportingOnIdleTimeInterval();
  }

  setCurrentPageViewIdentifier(pageViewIdentifier) {
    this.currentPageViewIdentifier = pageViewIdentifier;
  }

  recordEvent(eventName, data, uniqueId = null) {
    if (!EVENT_TYPES.includes(eventName)) throw new Error(`Invalid event: ${eventName}. Valid event types are: ${EVENT_TYPES.join(', ')}.`);
    if (!this.currentPageViewIdentifier) throw new Error('ReportingHandler has no currentPageViewIdentifier, cannot record event.');
    this.dataToReport.push({ 
      _event: eventName, 
      // uniqueIdentifier: uniqueId,
      uniqueIdentifier: uniqueId || UuidGenerator.generate(eventName.toLowerCase()),
      siteId: publicApiKey,
      pageViewIdentifier: this.currentPageViewIdentifier, 
      ts: Date.now(), 
      data 
    });
    this.lastEventRecordedAtTs = Date.now();
    if (this.dataToReport.length >= (maxNumEventsInMemory || 25)) {
      this._reportDataIfNecessary();
    }
  }

  reportData = this._reportDataIfNecessary;

  _hasDataToReport() {
    return this.dataToReport.length > 0;
  }

  _setReportingOnIdleTimeInterval() {
    setInterval(() => {
      if (this.lastEventRecordedAtTs && Date.now() - this.lastEventRecordedAtTs >= (reportAfterIdleTimeMs || 10_000)) {
        this._reportDataIfNecessary()
      }
    }, reportingIdleTimeCheckInterval || 5_000);
  }

  _reportDataIfNecessary() {
    if (!this._hasDataToReport()) return;
    const body = { siteId: publicApiKey, data: this.dataToReport };
    if (mockApiCalls) {
      console.log('Reporting data to mock API', body);
    } else if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], {});
      navigator.sendBeacon(reportingUrl, blob);
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', reportingUrl);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(body));
    }
    this.dataToReport = [];
  }
}