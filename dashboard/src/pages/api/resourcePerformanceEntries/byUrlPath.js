import ResourcePerformanceEntries from '@/lib/data/resourcePerformanceEntries';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { siteId, urlPath, startTs = defaultStartTs } = req.query;

  try {
    if (!siteId) throw new Error('Missing `siteId` query param');
    if (!urlPath) throw new Error('Missing `urlPath` query param');
    const records = await ResourcePerformanceEntries.getForUrlPath({ 
      siteId, 
      startTs,
      urlPath: decodeURIComponent(urlPath), 
    });
    res.status(200).json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};