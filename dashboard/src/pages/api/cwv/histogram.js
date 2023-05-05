import { Validator } from '@/lib/queryValidator';
import WebVitalsData from '@/lib/data/webVitals';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { 
    projectKey, 
    urlHost, 
    urlPath, 
    accronym, 
    deviceTypes = JSON.stringify(['mobile', 'tablet', 'phablet', 'desktop']), 
    startTs = defaultStartTs 
  } = req.query;

  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const histogramArray = await WebVitalsData.getHistogramData({ 
        projectKey, 
        urlHost, 
        urlPath, 
        accronym, 
        deviceTypes: JSON.parse(deviceTypes),
        minimum: 0,
        maximum: 10_000, 
        numBuckets: 20,
        startTs 
      })
      return res.status(200).json(histogramArray);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}