import PerformanceMetrics from '@/lib/data/webVitals';
import { Validator } from '@/lib/queryValidator';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, urlHost, urlPath, percentile = 0.75, startTs = defaultStartTs } = req.query;

  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const records = await PerformanceMetrics.getPercentilesForAllMetrics({ projectKey, urlHost, urlPath, startTs, percentile });
      res.status(200).json({ records });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
};