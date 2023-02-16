export class ReportingHandler {
  constructor(apiEndpoint, apiKey) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.reportingData = {};
    this._beginReportingInterval();
  }

  setReportingData(data) {
    console.log(`Updating reporting data:`);
    console.log(data);
    this.reportingData = data;
  }

  reportData = this._reportDataIfNecessary;

  _beginReportingInterval() {
    setInterval(() => {
      this._reportDataIfNecessary();
    }, 3_000);
  }

  _reportDataIfNecessary() {
    if(this.reportingData !== this.lastReportedData) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.apiEndpoint);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-api-key', this.apiKey);
      xhr.send(JSON.stringify(this.reportingData));
      this.lastReportedData = this.reportingData;
    }
  }
}