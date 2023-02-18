// import { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } from 'web-vitals/attribution';
import { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } from 'web-vitals';

export class PerformanceMetricsHandler {
  constructor() {
    this._performanceMetrics = {};
    this.onMetricsReadyCallbacks = [];
    this.onNewMetricCallbacks = [];
    this._setPerformanceMetricsListeners();
  }

  onNewMetric(callback) {
    this.onNewMetricCallbacks.push(callback)
  }

  _onVitalHandler(entry, vitalType) {
    this._performanceMetrics[vitalType] = entry;
    this.onNewMetricCallbacks.forEach(callback => callback(entry));
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