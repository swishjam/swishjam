import { Validator } from '@/lib/queryValidator';
import ResourcePerformanceEntries from '@/lib/data/resourcePerformanceEntries';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { organizationId, projectKey, resourceName, metric, startTs = defaultStartTs } = req.query;

  return await Validator.runQueryIfUserHasAccess({ req, res, organizationId, projectKey }, async () => {
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