export class ReportingHandler {
  constructor(apiEndpoint, apiKey) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.reportingData = { apiKey };
    this._onReportedDataCallbacks = [];
  }

  setReportingData(data) {
    this.reportingData = data;
  }

  onReportedData(callback) {
    this._onReportedDataCallbacks.push(callback);
  }

  reportData = this._reportDataIfNecessary;

  beginReportingInterval() {
    setInterval(() => this._reportDataIfNecessary(), 3_000);
  }

  _reportDataIfNecessary() {
    console.log(`Reporting Data:`);
    console.log(this.reportingData);
    console.log(`Last Reported Data:`);
    console.log(this.lastReportedData);
    if(this.reportingData !== this.lastReportedData) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.apiEndpoint);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-api-key', this.apiKey);
      xhr.send(JSON.stringify(this.reportingData));
      this.lastReportedData = this.reportingData;
      this._onReportedDataCallbacks.forEach(callback => callback(this.reportingData));
    }
  }
}