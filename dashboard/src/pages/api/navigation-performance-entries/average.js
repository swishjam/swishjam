import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';
import NavigationPerformanceEntries from '@/lib/data/navigationPerformanceEntries';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, urlHost, urlPath, startTs = defaultStartTs } = req.query;
  
  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const records = await NavigationPerformanceEntries.getAveragesForUrlHostAndPath({ projectKey, urlHost, urlPath, startTs });
      return res.status(200).json({ records });
    } catch(err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
};