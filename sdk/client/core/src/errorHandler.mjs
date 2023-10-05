import { Event } from "./event.mjs";

export class ErrorHandler {
  constructor(requester, options = {}) {
    this.requester = requester;
    this.maxNumErrors = options.maxNumErrors || 3;
    this.rateLimitMs = options.rateLimitMs || 2_000; // dont send more than 1 error per 2 seconds
    this.numErrorsCaptured = 0;
    this.lastErrorCapturedAt = null;
  }

  executeWithErrorHandling(func) {
    return async (...args) => {
      try {
        const result = func(...args);
        if (result instanceof Promise) {
          return await result.catch(this.captureErrorIfNecessary);
        } else {
          return result;
        }
      } catch (e) {
        this.captureError(e);
        console.error(`[Swishjam SDK Error]: ${e}`)
      }
    };
  }

  async captureError(e) {
    if (this._shouldCaptureError()) {
      this.lastErrorCapturedAt = new Date();
      this.numErrorsCaptured++;
      try {
        const event = new Event('sdk_error', {
          url: window.location.href,
          error: e
        });
        await this.requester.send([event]);
      } catch (err) {
        // 
      }
    }
  }

  _shouldCaptureError() {
    if (this.numErrorsCaptured >= this.maxNumErrors) return false;
    if (this.lastErrorCapturedAt && new Date() - this.lastErrorCapturedAt < this.rateLimitMs) return false;
    return true;
  }
}

export default ErrorHandler;