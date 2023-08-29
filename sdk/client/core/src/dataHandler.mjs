export class DataHandler {
  constructor(options = {}) {
    this.data = [];
    this.numFailedReports = 0;

    this.apiEndpoint = options.apiEndpoint || 'http://localhost:3000/api/v1/data';
    this.apiKey = options.apiKey;
    this.maxSize = options.maxSize || 20;
    this.heartbeatMs = options.heartbeatMs || 10_000;
    this.maxNumFailedReports = options.maxNumFailedReports || 3;
    
    this._initHeartbeat();
  }

  getData = () => this.data;

  add = async event => {
    this.data.push(event.toJSON());
    if (this.data.length >= this.maxSize) {
      await this._reportDataIfNecessary();
    }
    return event;
  }

  flushQueue = async () => {
    return await this._reportDataIfNecessary();
  }

  _initHeartbeat = () => {
    setInterval(async () => {
      await this._reportDataIfNecessary();
    }, this.heartbeatMs);
  }

  _reportDataIfNecessary = async () => {
    try {
      if (this.data.length === 0 || this.numFailedReports >= this.maxNumFailedReports) return;
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Swishjam-Api-Key': this.apiKey,
        },
        body: JSON.stringify(this.data)
      })
      if (response.ok) {
        this.data = [];
      } else {
        this.numFailedReports += 1;
        // console.error('Swishjam failed to report data', response);
      }
    } catch(err) {
      this.numFailedReports += 1;
      // console.error('Swishjam failed to report data', err);
    }
  }
}