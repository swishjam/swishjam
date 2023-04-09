import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';
import WebVitalsData from '@/lib/data/webVitals';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, urlHost, urlPath, metrics, percentile = 0.75, startTs = defaultStartTs } = req.query;

  return runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const sqlQueries = JSON.parse(metrics || '[]').map(
        metric => WebVitalsData.getPercentileForMetric({ projectKey, urlHost, urlPath, metric, percentile: parseFloat(percentile), startTs })
      )
      const results = await Promise.all(sqlQueries);
      const result = results.reduce((acc, result, i) => {
        const metric = JSON.parse(metrics)[i];
        acc[metric] = result;
        return acc;
      }, {});
      return res.status(200).json({ ...result });
    } catch(err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}