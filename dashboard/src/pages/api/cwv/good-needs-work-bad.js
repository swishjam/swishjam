import { runQueryIfUserHasAccess } from '@lib/analyticQuerier';
import PerformanceMetricsData from '@lib/data/performanceMetrics';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, metrics, urlHost, urlPath, startTs = defaultStartTs } = req.query;


  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const sqlQueries = JSON.parse(metrics || '[]').map(
        metric => PerformanceMetricsData.getTimeseriesgoodNeedsWorkBadChartDataDataForMetric({ projectKey, metric, urlHost, urlPath, startTs })
      );
      const results = await Promise.all(sqlQueries);
      const resultsByMetric = results.reduce((acc, result, i) => {
        const metric = JSON.parse(metrics)[i];
        acc[metric] = result;
        return acc;
      }, {});
      return res.status(200).json({ results: resultsByMetric });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}