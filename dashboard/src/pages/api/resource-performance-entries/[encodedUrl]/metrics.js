import ResourcePerformanceEntries from '@/lib/data/resourcePerformanceEntries';
import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, encodedUrl, percentile = 0.75, startTs = defaultStartTs } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const url = decodeURIComponent(encodedUrl);
      const records = await ResourcePerformanceEntries.getMetricsForUrl({ projectKey, url, startTs, percentile: parseFloat(percentile) });
      res.status(200).json(records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
};