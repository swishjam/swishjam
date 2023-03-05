import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';
import PerformanceMetricsData from '../../../lib/data/performanceMetrics';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, metric, percentile = 0.75, startTs = defaultStartTs } = req.query;

  return runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      if (!metric) throw new Error('Missing `metric` query param');
      if (!siteId) throw new Error('Missing `siteId` query param');
      const { percentileResult, numRecords } = await PerformanceMetricsData.getPercentileMetric({ projectKey, percentile, metric, startTs });
      return res.status(200).json({ percentileResult, numRecords });
    } catch(err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}