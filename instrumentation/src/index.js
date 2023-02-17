import { UuidGenerator } from './uuidGenerator';
import { MetadataHandler } from './metadataHandler';
import { PerformanceMetricsHandler } from './performanceMetricsHandler';
import { ReportingHandler } from './reportingHandler';
import { PerformanceEntriesHandler } from './performanceEntriesHandler';
import config from './config';


(function() {
  const { 
    reportingUrl, 
    shouldCapturePerformanceEntries = true,
    performanceEntriesToCapture = [
      "element",
      "event",
      "first-input",
      "largest-contentful-paint",
      "layout-shift",
      "longtask",
      "mark",
      "measure",
      "navigation",
      "paint",
      "resource"
    ]
  } = config;

  const pageLoadTs = Date.now();
  const pageLoadId = UuidGenerator.generate();
  const metadata = MetadataHandler.getMetadata();

  const reportingHandler = new ReportingHandler(reportingUrl, '1234');
  reportingHandler.setReportingData({ pageLoadId, pageLoadTs, metadata, performanceMetrics: {} });
  
  if (shouldCapturePerformanceEntries) {
    const performanceEntriesHandler = new PerformanceEntriesHandler();
    const existingPerformanceEntries = performanceEntriesHandler.getPerformanceEntries(performanceEntriesToCapture);
    new PerformanceEntriesHandler().listenForPerformanceEntries(performanceEntriesToCapture);
  }
  const performanceMetricsHandler = new PerformanceMetricsHandler();
  performanceMetricsHandler.onNewMetric(metric => {
    const newPerformanceMetrics = { ...reportingHandler.reportingData.performanceMetrics, [metric.name]: metric };
    reportingHandler.setReportingData({ 
      ...reportingHandler.reportingData, 
      performanceMetrics: newPerformanceMetrics 
    });
  })
})();