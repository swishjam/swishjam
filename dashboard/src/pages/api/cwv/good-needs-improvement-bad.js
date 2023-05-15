import { Validator } from '@/lib/queryValidator';
import WebVitalsData from '@/lib/data/webVitals';

export default async (req, res) => {
  const { projectKey, metrics, urlHost, urlPath, deviceTypes = JSON.stringify(['smartphone', 'phablet', 'tablet', 'desktop']) } = req.query;
  let { groupBy = 'intelligent' } = req.query;


  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    if (groupBy === 'intelligent') {
      const oldestRecord = await WebVitalsData.getOldestRecord({ projectKey, urlHost, urlPath, metric: 'LCP' });
      const oneDay = 1000 * 60 * 60 * 24;
      if (oldestRecord && new Date() - new Date(oldestRecord.date) >= new Date(oneDay * 30 * 5)) {
        groupBy = 'month';
      } else if (oldestRecord && new Date() - new Date(oldestRecord.date) >= new Date(oneDay * 7 * 5)) {
        groupBy = 'week';
      } else {
        groupBy = 'day';
      }
    }
    try {
      const sqlQueries = JSON.parse(metrics || '[]').map(
        metric => WebVitalsData.getGoodNeedsImprovementChartDataDataForMetric({ 
          projectKey, 
          metric, 
          groupBy, 
          deviceTypes: JSON.parse(deviceTypes), 
          urlHost, 
          urlPath 
        })
      );
      const results = await Promise.all(sqlQueries);
      const resultsByMetric = results.reduce((acc, result, i) => {
        const metric = JSON.parse(metrics)[i];
        acc[metric] = result;
        return acc;
      }, {});
      return res.status(200).json({ groupedBy: groupBy, results: resultsByMetric });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}