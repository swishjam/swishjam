import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';
import Pages from '@/lib/data/pages';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 14;
  const { projectKey, urlHosts, startTs = defaultStartTs } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    const results = await Pages.getUniquePathUrlsForProject({ projectKey, startTs, urlHosts: JSON.parse(urlHosts || '[]') });
    return res.status(200).json({ results });
  });
}