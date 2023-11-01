import { Event } from "./event.mjs";

export class EventQueueManager {
  constructor(requester, errorHandler, options = {}) {
    this.requester = requester;
    this.errorHandler = errorHandler;
    this.disabled = typeof options.disabled === 'boolean' ? options.disabled : false;
    this.maxQueueSize = options.maxQueueSize || 20;
    this.heartbeatMs = options.heartbeatMs || 10_000;
    this.disabledUrls = options.disabledUrls || [];

    this.queue = [];

    this._initHeartbeat();
  }

  getData = () => this.queue;

  recordEvent = (eventName, properties) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      const event = new Event(eventName, properties);
      if (this._shouldRecordEvents()) {
        this.queue.push(event.toJSON());
        if (this.queue.length >= this.maxQueueSize) {
          this._reportDataIfNecessary();
        }
      } else {
        console.log(`%cSwishjam is in development mode and won't send data to the server`, `color: #7487F7; font-weight: bold;`)
        console.log(`%cData Captured By Swishjam`, `color: #7487F7; font-weight: bold;`)
        console.log(`%O`, event.toJSON());
      }
      return event;
    })
  }

  flushQueue = async () => {
    return this.errorHandler.executeWithErrorHandling(async () => (
      await this._reportDataIfNecessary()
    ))
  }

  _initHeartbeat = () => {
    setInterval(async () => {
      await this._reportDataIfNecessary();
    }, this.heartbeatMs);
  }

  _reportDataIfNecessary = async () => {
    return this.errorHandler.executeWithErrorHandling(async () => {
      if (this.queue.length === 0) return;
      const success = await this.requester.send(this.queue, this.errorHandler.captureError);
      if (success) {
        this.queue = [];
      }
    })
  }

  _shouldRecordEvents = () => {
    if (this.disabled) return false;
    if (this.disabledUrls.find(url => window.location.href.includes(url))) return false;
    if (this.numFailedRequests >= this.maxNumFailedRequests) return false;
    return true;
  }
}

export default EventQueueManager;