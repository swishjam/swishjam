import { UuidGenerator } from './uuidGenerator';
import { MetadataHandler } from './metadataHandler';
import { PerformanceMetricsHandler } from './performanceMetricsHandler';
import { ReportingHandler } from './reportingHandler';
import { PerformanceEntriesHandler } from './performanceEntriesHandler';
import config from '../config';


(function() {
  const { 
    reportingUrl, 
    publicApiKey,
    maxNumPerformanceEntriesPerPageLoad = 250,
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

  const reportingHandler = new ReportingHandler(reportingUrl, publicApiKey);
  reportingHandler.setReportingData({ 
    pageLoadId, 
    pageLoadTs, 
    metadata, 
    performanceEntries: [], 
    performanceMetrics: {} 
  });

  reportingHandler.onReportedData(() => reportingHandler.reportingData.performanceEntries = []);
  
  if (shouldCapturePerformanceEntries) {
    const performanceEntriesHandler = new PerformanceEntriesHandler(performanceEntriesToCapture, { maxNumPerformanceEntriesPerPageLoad });

    const existingPerformanceEntries = performanceEntriesHandler.getPerformanceEntries();
    reportingHandler.reportingData.performanceEntries = existingPerformanceEntries;
    
    performanceEntriesHandler.onPerformanceEntries(performanceEntries => {
      reportingHandler.reportingData.performanceEntries = [...reportingHandler.reportingData.performanceEntries, ...performanceEntries];
    });
  }
  new PerformanceMetricsHandler().onNewMetric(metric => reportingHandler.reportingData.performanceMetrics[metric.name] = metric);
  reportingHandler.beginReportingInterval();
})();