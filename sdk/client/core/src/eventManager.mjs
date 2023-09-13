import { Event } from "./event.mjs";

export class EventManager {
  constructor(options = {}) {
    this.data = [];
    this.numFailedReports = 0;

    this.apiEndpoint = options.apiEndpoint;
    this.apiKey = options.apiKey;
    this.maxSize = options.maxSize || 20;
    this.heartbeatMs = options.heartbeatMs || 10_000;
    this.maxNumFailedReports = options.maxNumFailedReports || 3;
    this.marketingUrlRegExp = options.marketingUrlRegExp;
    this.productUrlRegExp = options.productUrlRegExp;
    
    this._initHeartbeat();
  }

  getData = () => this.data;

  recordEvent = async (eventName, properties) => {
    const analyticsFamily = this._determineAnalyticsFamily();
    const event = new Event(eventName, analyticsFamily, properties);
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

  _determineAnalyticsFamily = () => {
    if (this._isUrlMatch(this.marketingUrlRegExp)) return 'marketing';
    if (this._isUrlMatch(this.productUrlRegExp)) return 'product';
  }

  _isUrlMatch = (regExpOrArrayOfRegExp) => {
    if (!regExpOrArrayOfRegExp) return false;
    if (Array.isArray(regExpOrArrayOfRegExp)) {
      return regExpOrArrayOfRegExp.some(regExp => regExp.test(window.location.href));
    } else {
      return regExpOrArrayOfRegExp.test(window.location.href);
    }
  }
}