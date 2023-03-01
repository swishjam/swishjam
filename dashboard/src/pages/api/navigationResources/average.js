import NavigationPerformanceEntries from '@/lib/data/navigationPerformanceEntries';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { siteId, metric = 'dom_interactive', startTs = defaultStartTs } = req.query;

  try {
    if (!siteId) throw new Error('Missing `siteId` query param');
    const records = await NavigationPerformanceEntries.getAverageMetricGroupedByPage({ siteId, startTs, metric });
    res.status(200).json({ records });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};