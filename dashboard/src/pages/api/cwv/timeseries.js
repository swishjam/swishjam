import { Validator } from '@/lib/queryValidator';
import WebVitalsData from '@/lib/data/webVitals';

export default async (req, res) => {
  const oneDay = 1000 * 60 * 60 * 24;
  const { projectKey, metrics, urlHost, urlPath, groupBy ='day', percentile = 0.75 } = req.query;
  const startTs = req.query.startTs || groupBy === 'month'
                    ? new Date(Date.now() - (oneDay * 30 * 5))
                    : groupBy === 'week'
                      ? new Date(Date.now() - (oneDay * 7 * 5))
                      : new Date(Date.now() - (oneDay * 7));

  
  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const sqlQueries = JSON.parse(metrics || '[]').map(
        metric => WebVitalsData.getPercentileTimeseriesDataForMetric({ 
          projectKey, 
          metric, 
          urlHost, 
          urlPath, 
          groupBy,
          percentile: parseFloat(percentile), 
          startTs 
        })
      )
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