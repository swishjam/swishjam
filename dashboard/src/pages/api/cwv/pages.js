import { Validator } from '@/lib/queryValidator';
import WebVitalsData from '@/lib/data/webVitals';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, metric, startTs = defaultStartTs } = req.query;

  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      if (!metric) throw new Error('Missing `metric` query param');
      const records = await WebVitalsData.getAveragesGroupedByPages({ projectKey, metric, startTs });
      return res.status(200).json({ records });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}