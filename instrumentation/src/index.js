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
  reportingHandler.setStaticData({ pageLoadId, pageLoadTs, metadata });

  if (shouldCapturePerformanceEntries) {
    const performanceEntriesHandler = new PerformanceEntriesHandler(performanceEntriesToCapture, { maxNumPerformanceEntriesPerPageLoad });
    reportingHandler.updateReportingData({ 
      performanceEntries: [
        ...(reportingHandler.reportingData.performanceEntries || []),
        ...performanceEntriesHandler.getPerformanceEntries()
      ]
    });
    
    performanceEntriesHandler.onPerformanceEntries(performanceEntries => {
      reportingHandler.updateReportingData({ 
        performanceEntries: [
          ...(reportingHandler.reportingData.performanceEntries || []),
          ...performanceEntries
        ] 
      });
    });
  }

  new PerformanceMetricsHandler().onNewMetric(metric => {
    reportingHandler.updateReportingData({
      performanceMetrics: {
        ...(reportingHandler.reportingData.performanceMetrics || {}),
        [metric.name]: metric
      }
    })
  });

  reportingHandler.beginReportingInterval();
})();