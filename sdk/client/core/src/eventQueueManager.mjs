import { Event } from "./event.mjs";

export class EventQueueManager {
  constructor(requester, errorHandler, options = {}) {
    this.requester = requester;
    this.errorHandler = errorHandler;
    this.disabled = typeof options.disabled === 'boolean' ? options.disabled : false;
    this.maxQueueSize = options.maxQueueSize || 20;
    this.heartbeatMs = options.heartbeatMs || 10_000;
    this.disabledUrls = options.disabledUrls || [];
    this.maxNumFailedRequests = options.maxNumFailedRequests || 3;
    this.numFailedRequests = 0;

    this.queue = [];

    this._initHeartbeat();
    if (!this._shouldRecordEvents()) {
      console.log(`%cSwishjam is in development mode, no events will be reported.`, `color: #7487F7; font-weight: bold;`)
    }
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
        console.log(`%cNew Swishjam event:`, `color: #7487F7; font-weight: bold;`)
        console.log(`%O`, { event: event.eventName, attributes: event.attributes });
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