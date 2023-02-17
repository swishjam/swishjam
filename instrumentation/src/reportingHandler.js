export class ReportingHandler {
  constructor(apiEndpoint, apiKey, options = {}) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.staticData = { apiKey };
    this.reportingData = {};
    this.reportingIntervalMs = options.reportingIntervalMs || 3_000;
    this.stopReportingAfterMs = options.stopReportingAfterMs || 12_000;
    this._onReportedDataCallbacks = [];
  }

  setStaticData(data) {
    this.staticData = { ...this.staticData, ...data };
  }

  updateReportingData(data) {
    this.reportingData = { ...this.reportingData, ...data };
  }

  onReportedData(callback) {
    this._onReportedDataCallbacks.push(callback);
  }

  reportData = this._reportDataIfNecessary;

  beginReportingInterval() {
    let totalReportingTimeMs = 0;
    const reportIntervalFunc = setInterval(() => {
      this._reportDataIfNecessary();
      totalReportingTimeMs += this.reportingIntervalMs;
      if(totalReportingTimeMs >= this.stopReportingAfterMs) {
        clearInterval(reportIntervalFunc);
      }
    }, this.reportingIntervalMs);
  }

  _reportDataIfNecessary() {
    if(Object.keys(this.reportingData).length > 0) {
      const dataToReport = { ...this.staticData, ...this.reportingData };
      if(navigator.sendBeacon) {
        navigator.sendBeacon(this.apiEndpoint, JSON.stringify(dataToReport));
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.apiEndpoint);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('x-api-key', this.apiKey);
        xhr.send(JSON.stringify(dataToReport));
      }
      this._onReportedDataCallbacks.forEach(callback => callback(dataToReport));
      this.reportingData = {};
    }
  }
}