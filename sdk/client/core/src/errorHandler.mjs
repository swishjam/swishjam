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
    try {
      return func()
    } catch (e) {
      this.captureError(e);
      console.warn(`[Swishjam SDK Error]: ${e}`)
    }
  }

  captureError = async e => {
    if (this._shouldCaptureError()) {
      this.lastErrorCapturedAt = new Date();
      this.numErrorsCaptured++;
      try {
        const event = new Event('sdk_error', {
          url: window.location.href,
          error: {
            message: e.message,
            stack: e.stack,
          },
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