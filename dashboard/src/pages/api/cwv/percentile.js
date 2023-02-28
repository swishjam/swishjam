import PerformanceMetricsData from '../../../lib/data/performanceMetrics';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { siteId, metric, percentile = 0.75, startTs = defaultStartTs } = req.query;

  try {
    if (!metric) throw new Error('Missing `metric` query param');
    if (!siteId) throw new Error('Missing `siteId` query param');
    const { percentileResult, numRecords } = await PerformanceMetricsData.getPercentileMetric({ siteId, percentile, metric, startTs });
    res.status(200).json({ percentileResult, numRecords });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}