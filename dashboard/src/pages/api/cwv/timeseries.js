import PerformanceMetricsData from '../../../lib/data/performanceMetrics';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { siteId, metric, startTs = defaultStartTs } = req.query;

  try {
    if (!metric) throw new Error('Missing `metric` query param');
    if (!siteId) throw new Error('Missing `siteId` query param');
    const results = await PerformanceMetricsData.getTimeseriesDataForMetric({ siteId, metric, startTs });
    res.status(200).json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}