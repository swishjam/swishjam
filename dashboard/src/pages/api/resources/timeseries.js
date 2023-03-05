import ResourcePerformanceEntries from '@/lib/data/resourcePerformanceEntries';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { siteId, resourceName, metric, startTs = defaultStartTs } = req.query;

  try {
    if (!siteId) throw new Error('Missing `siteId` query param');
    if (!resourceName) throw new Error('Missing `resourceName` query param');
    const records = await ResourcePerformanceEntries.getTimeseriesForMetric({
      siteId,
      startTs,
      metric,
      resourceName: decodeURIComponent(resourceName),
    });
    res.status(200).json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};