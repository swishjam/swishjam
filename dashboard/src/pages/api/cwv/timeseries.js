import { runQueryIfUserHasAccess } from '@lib/analyticQuerier';
import PerformanceMetricsData from '@lib/data/performanceMetrics';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, metric, urlHost, urlPath, percentile = 0.75, startTs = defaultStartTs } = req.query;

  
  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      if (!metric) throw new Error('Missing `metric` query param');
      if (!urlHost) throw new Error('Missing `urlHost` query param');
      const results = await PerformanceMetricsData.getTimeseriesgoodNeedsWorkBadChartDataDataForMetric({
        projectKey,
        metric,
        urlHost,
        urlPath,
        // percentile: parseFloat(percentile),
        startTs
      });
      // const results = await PerformanceMetricsData.getPercentileTimeseriesDataForMetric({ 
      //   projectKey, 
      //   metric, 
      //   urlHost, 
      //   urlPath,
      //   percentile: parseFloat(percentile), 
      //   startTs
      // });
      return res.status(200).json({ results });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}