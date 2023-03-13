import PerformanceMetrics from '@/lib/data/performanceMetrics';
import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, urlHost, urlPath, startTs = defaultStartTs } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const records = await PerformanceMetrics.getAveragesForAllMetrics({ projectKey, startTs, urlHost, urlPath });
      res.status(200).json({ records });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
};