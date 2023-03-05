import Pages from '@/lib/data/pages';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 14;
  const { siteId, startTs = defaultStartTs } = req.query;
  const urls = await Pages.getAllUrlsForSite({ siteId, startTs });
  res.status(200).json({ urls });
}