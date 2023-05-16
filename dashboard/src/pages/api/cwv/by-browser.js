import { Validator } from '@/lib/queryValidator';
import WebVitals from '@/lib/data/webVitals';
import PageViews from '@/lib/data/pageViews';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { organizationId, projectKey, urlHost, urlPath, percentile = 0.75, startTs = defaultStartTs } = req.query;

  return Validator.runQueryIfUserHasAccess({ req, res, organizationId, projectKey }, async () => {
    try {
      const [metrics, totalCount] = await Promise.all([
        WebVitals.getPercentileForMetricsByBrowser({ projectKey, urlHost, urlPath, percentile: parseFloat(percentile), startTs }),
        PageViews.getCountByBrowser({ projectKey, urlHost, urlPath, startTs })
      ]);
      return res.status(200).json({ metrics, totalCount });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}