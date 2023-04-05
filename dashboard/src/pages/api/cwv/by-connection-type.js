import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';
import PerformanceMetricsData from '@/lib/data/performanceMetrics';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, urlHost, urlPath, percentile = 0.75, startTs = defaultStartTs } = req.query;

  return runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const queries = ['4g', ''].map(metric => (
        PerformanceMetricsData.getPercentileForMetricsByDevice({ 
          projectKey,
          urlHost,
          urlPath,
          metric,
          percentile: parseFloat(percentile), 
          startTs 
        })
      ))
      const results = await Promise.all(queries);
      const resultsByMetric = results.reduce((acc, result, i) => {
        const metric = JSON.parse(metrics)[i];
        acc[metric] = result;
        return acc;
      }, {});
      console.log(resultsByMetric);
      return res.status(200).json({ ...resultsByMetric });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}