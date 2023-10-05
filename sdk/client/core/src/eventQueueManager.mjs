import { Event } from "./event.mjs";

export class EventQueueManager {
  constructor(requester, errorHandler, options = {}) {
    this.requester = requester;
    this.errorHandler = errorHandler;
    this.maxQueueSize = options.maxQueueSize || 20;
    this.heartbeatMs = options.heartbeatMs || 10_000;

    this.queue = [];

    this._initHeartbeat();
  }

  getData = () => this.queue;

  recordEvent = (eventName, properties) => {
    return this.errorHandler.executeWithErrorHandling(() => {
      const event = new Event(eventName, properties);
      this.queue.push(event.toJSON());
      if (this.queue.length >= this.maxQueueSize) {
        this._reportDataIfNecessary();
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
      return await this.requester.send(this.queue)
    })
  }
}

export default EventQueueManager;