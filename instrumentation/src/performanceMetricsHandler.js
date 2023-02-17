import { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } from 'web-vitals/attribution';

export class PerformanceMetricsHandler {
  constructor(requiredMetrics) {
    this._performanceMetrics = {};
    this.onMetricsReadyCallbacks = [];
    this.onNewMetricCallbacks = [];
    // TTFB and FCP is available early
    // LCP and FID requires the user to interact with the page?
    this.requiredMetrics = requiredMetrics || ['lcp', 'fid', 'cls', 'fcp', 'ttfb'];
    this._setPerformanceMetricsListeners();
  }

  onMetricsReady(callback) {
    this.onMetricsReadyCallbacks.push(callback)
  }

  onNewMetric(callback) {
    this.onNewMetricCallbacks.push(callback)
  }

  performanceMetrics() {
    return this._performanceMetrics;
  }

  gatheredAllPerformanceMetrics() {
    return this.requiredMetrics.length === 0;
  }

  _onVitalHandler(entry, vitalType) {
    this._performanceMetrics[vitalType] = entry;
    this.onNewMetricCallbacks.forEach(callback => callback(entry));
    this.requiredMetrics = this.requiredMetrics.filter(metric => metric !== vitalType);
    // For Debugging: 
    // console.log(`Captured ${vitalType}!`);
    console.log('Vital Handler Entry:', entry);
    if(this.gatheredAllPerformanceMetrics()) {
      this.onMetricsReadyCallbacks.forEach( callback => callback(this.performanceMetrics()) );
    }
  }

  _setPerformanceMetricsListeners() {
    onLCP(entry => this._onVitalHandler(entry, 'lcp'));
    onFCP(entry => this._onVitalHandler(entry, 'fcp'));
    onCLS(entry => this._onVitalHandler(entry, 'cls'));
    onFID(entry => this._onVitalHandler(entry, 'fid'));
    onTTFB(entry => this._onVitalHandler(entry, 'ttfb'));
    onINP(entry => this._onVitalHandler(entry, 'inp'));
  }
}