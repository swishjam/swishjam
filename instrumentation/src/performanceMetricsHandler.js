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

  _setPerformanceMetricsListeners() {
    onLCP(entry => {
      this._performanceMetrics.lcp = entry;
      this.onNewMetricCallbacks.forEach(callback => callback(entry));
      this.requiredMetrics = this.requiredMetrics.filter(metric => metric !== 'lcp');
      console.log('Got lcp!');
      console.log(entry);
      if(this.gatheredAllPerformanceMetrics()) {
        this.onMetricsReadyCallbacks.forEach( callback => callback(this.performanceMetrics()) );
      }
    });
    onFID(entry => {
      this._performanceMetrics.fid = entry;
      this.onNewMetricCallbacks.forEach(callback => callback(entry));
      this.requiredMetrics = this.requiredMetrics.filter(metric => metric !== 'fid');
      console.log('Got fid!');
      console.log(entry);
      if(this.gatheredAllPerformanceMetrics()) {
        this.onMetricsReadyCallbacks.forEach( callback => callback(this.performanceMetrics()) );
      }
    });
    onCLS(entry => {
      this._performanceMetrics.cls = entry;
      this.onNewMetricCallbacks.forEach(callback => callback(entry));
      this.requiredMetrics = this.requiredMetrics.filter(metric => metric !== 'cls');
      console.log('Got cls!');
      console.log(entry);
      if(this.gatheredAllPerformanceMetrics()) {
        this.onMetricsReadyCallbacks.forEach( callback => callback(this.performanceMetrics()) );
      }
    });
    onFCP(entry => {
      this._performanceMetrics.fcp = entry;
      this.onNewMetricCallbacks.forEach(callback => callback(entry));
      this.requiredMetrics = this.requiredMetrics.filter(metric => metric !== 'fcp');
      console.log('Got fcp!');
      console.log(entry);
      if(this.gatheredAllPerformanceMetrics()) {
        this.onMetricsReadyCallbacks.forEach( callback => callback(this.performanceMetrics()) );
      }
    });
    onTTFB(entry => {
      this._performanceMetrics.ttfb = entry;
      this.onNewMetricCallbacks.forEach(callback => callback(entry));
      this.requiredMetrics = this.requiredMetrics.filter(metric => metric !== 'ttfb');
      console.log('Got ttfb!');
      console.log(entry);
      if(this.gatheredAllPerformanceMetrics()) {
        this.onMetricsReadyCallbacks.forEach( callback => callback(this.performanceMetrics()) );
      }
    });
    onINP(entry => {
      this._performanceMetrics.inp = entry;
      this.onNewMetricCallbacks.forEach(callback => callback(entry));
      this.requiredMetrics = this.requiredMetrics.filter(metric => metric !== 'inp');
      console.log('Got inp!');
      console.log(entry);
      if(this.gatheredAllPerformanceMetrics()) {
        this.onMetricsReadyCallbacks.forEach( callback => callback(this.performanceMetrics()) );
      }
    });
  }
}