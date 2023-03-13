import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';
import ResourcePerformanceEntries from '@/lib/data/resourcePerformanceEntries';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, urlPath, urlHost, metric = 'duration', startTs = defaultStartTs } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const records = await ResourcePerformanceEntries.getAll({ projectKey, startTs, metric, urlPath, urlHost });
      return res.status(200).json({ records });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
};