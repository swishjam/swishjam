import { Validator } from '@/lib/queryValidator';
import WebVitals from '@/lib/data/webVitals';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, urlHost, urlPath, percentile = 0.75, startTs = defaultStartTs } = req.query;

  return Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const results = await WebVitals.getPercentileForMetricsByConnection({ 
        projectKey,
        urlHost,
        urlPath,
        percentile: parseFloat(percentile), 
        startTs 
      })
      return res.status(200).json(results);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}