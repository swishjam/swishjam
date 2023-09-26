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
    
    this._initHeartbeat();
  }

  getData = () => this.data;

  recordEvent = async (eventName, properties) => {
    const event = new Event(eventName, properties);
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
      this._sendDataViaFetch();
    } catch(err) {
      this.numFailedReports += 1;
      // console.error('Swishjam failed to report data', err);
    }
  }

  _sendDataViaFetch = async () => {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Swishjam-Api-Key': this.apiKey,
      },
      body: JSON.stringify(this.data),
      keepalive: true,
    })
    if (response.ok) {
      this.data = [];
      return response;
    } else {
      this.numFailedReports += 1;
      return response;
    }
  }

  // _sendDataViaBeacon = async () => {
  //   const blob = new Blob([JSON.stringify({ public_key: this.apiKey,  ...this.data})], { type: 'application/json' });
  //   const success = navigator.sendBeacon(this.apiEndpoint, blob);
  //   if (success) {
  //     this.data = [];
  //     return success;
  //   } else {
  //     this.numFailedReports += 1;
  //     return success;
  //   }
  // }
}