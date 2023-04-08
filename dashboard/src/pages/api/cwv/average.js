import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';
import WebVitalsData from '@/lib/data/webVitals';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, metric, urlHost, urlPath, startTs = defaultStartTs } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      if (!metric) throw new Error('Missing `metric` query param');
      const { average, numRecords } = await WebVitalsData.getAverageMetric({ projectKey, metric, startTs, urlHost, urlPath });
      return res.status(200).json({ average, numRecords });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}