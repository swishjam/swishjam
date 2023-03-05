import { runQueryIfUserHasAccess } from '@lib/analyticQuerier';
import PerformanceMetricsData from '@lib/data/performanceMetrics';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, metric, urlPath, startTs = defaultStartTs } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      if (!metric) throw new Error('Missing `metric` query param');
      const results = await PerformanceMetricsData.getPercentileTimeseriesDataForMetric({ projectKey, metric, urlPath, startTs });
      return res.status(200).json({ results });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}