import ResourcePerformanceEntries from '@/lib/data/resourcePerformanceEntries';
import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { 
    projectKey,
    urlHost, 
    urlPath,
    minimumOccurrences = 10,
    limit = 150,
    startTs = defaultStartTs 
  } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const records = await ResourcePerformanceEntries.getAll({
        projectKey,
        startTs,
        minimumOccurrences: parseInt(minimumOccurrences),
        limit: parseInt(limit),
        urlHost: urlHost,
        urlPath: urlPath
      });
      res.status(200).json({ records });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
};