import ResourcePerformanceEntries from '@/lib/data/resourcePerformanceEntries';
import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { 
    projectKey,
    urlHost, 
    urlPath,
    metric = 'duration', 
    // initiatorTypes = ['script', 'link', 'img', 'css', 'fetch', 'xmlhttprequest', 'other'],
    startTs = defaultStartTs 
  } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    // initiatorTypes = initiatorTypes || ['script', 'xmlhttprequest', 'img', 'link', 'fetch', 'css', 'other'];
    try {
      const records = await ResourcePerformanceEntries.getAll({
        projectKey,
        startTs,
        // metric,
        // initiatorTypes: decodeURIComponent(initiatorTypes).split(','),
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