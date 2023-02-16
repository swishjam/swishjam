import { UuidGenerator } from './uuidGenerator';
import { MetadataHandler } from './metadataHandler';
import { PerformanceMetricsHandler } from './performanceMetricsHandler';
import { ReportingHandler } from './reportingHandler';
import { PerformanceEntriesHandler } from './performanceEntriesHandler';

(function() {
  const pageLoadTs = Date.now();
  const pageLoadId = UuidGenerator.generate();
  
  const reportingHandler = new ReportingHandler('/report', '1234');
  const metadata = MetadataHandler.getMetadata();
  reportingHandler.setReportingData({ pageLoadId, pageLoadTs, metadata, performanceMetrics: {} });
  
  new PerformanceEntriesHandler().listenForPerformanceEntries();
  const performanceMetricsHandler = new PerformanceMetricsHandler();
  performanceMetricsHandler.onNewMetric(metric => {
    const newPerformanceMetrics = { ...reportingHandler.reportingData.performanceMetrics, [metric.name]: metric };
    reportingHandler.setReportingData({ 
      ...reportingHandler.reportingData, 
      performanceMetrics: newPerformanceMetrics 
    });
  })
})();