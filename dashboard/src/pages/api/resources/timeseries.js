import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';
import ResourcePerformanceEntries from '@/lib/data/resourcePerformanceEntries';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, resourceName, metric, startTs = defaultStartTs } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      if (!resourceName) throw new Error('Missing `resourceName` query param');
      const records = await ResourcePerformanceEntries.getTimeseriesForMetric({
        projectKey,
        startTs,
        metric,
        resourceName: decodeURIComponent(resourceName),
      });
      res.status(200).json({ records });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
};