import ResourcePerformanceEntries from '@/lib/data/resourcePerformanceEntries';
import { Validator } from '@/lib/queryValidator';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { 
    organizationId,
    projectKey, 
    encodedUrl, 
    resourceUrlHost,
    resourceUrlPath,
    percentile = 0.75, 
    startTs = defaultStartTs 
  } = req.query;

  return await Validator.runQueryIfUserHasAccess({ req, res, organizationId, projectKey }, async () => {
    try {
      const records = await ResourcePerformanceEntries.getTimeSeriesForUrl({ 
        projectKey, 
        url: encodedUrl, 
        urlHost: resourceUrlHost,
        urlPath: resourceUrlPath,
        startTs, 
        percentile
      });
      res.status(200).json(records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
};