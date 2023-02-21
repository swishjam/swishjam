// import { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } from 'web-vitals/attribution';
import { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } from 'web-vitals';

export class PerformanceMetricsHandler {
  constructor(reportingHandler) {
    this.reportingHandler = reportingHandler;
  }

  beginCapturingPerformanceMetrics() {
    onLCP(entry => this.reportingHandler.recordEvent('PAGE_LOAD_METRIC', { type: 'LCP', ...entry }));
    onFCP(entry => this.reportingHandler.recordEvent('PAGE_LOAD_METRIC', { type: 'FCP', ...entry }));
    onCLS(entry => this.reportingHandler.recordEvent('PAGE_LOAD_METRIC', { type: 'CLS', ...entry }));
    onFID(entry => this.reportingHandler.recordEvent('PAGE_LOAD_METRIC', { type: 'FID', ...entry }));
    onTTFB(entry => this.reportingHandler.recordEvent('PAGE_LOAD_METRIC', { type: 'TTFB', ...entry }));
    onINP(entry => this.reportingHandler.recordEvent('PAGE_LOAD_METRIC', { type: 'INP', ...entry }));
  }
}