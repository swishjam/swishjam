// import { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } from 'web-vitals/attribution';
import { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } from 'web-vitals';

export class PerformanceMetricsHandler {
  constructor(reportingHandler) {
    this.reportingHandler = reportingHandler;
  }

  beginCapturingPerformanceMetrics() {
    onLCP(entry => this._reportCWV('LCP', entry));
    onFCP(entry => this._reportCWV('FCP', entry));
    onCLS(entry => this._reportCWV('CLS', entry));
    onFID(entry => this._reportCWV('FID', entry));
    onTTFB(entry => this._reportCWV('TTFB', entry));
    onINP(entry => this._reportCWV('INP', entry));
  }

  _reportCWV(type, entry) {
    this.reportingHandler.recordEvent('PAGE_LOAD_METRIC', { type: type, ...entry });
  }
}