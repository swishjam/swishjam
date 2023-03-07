import { runQueryIfUserHasAccess } from '@/lib/analyticQuerier';
import Pages from '@/lib/data/pages';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 14;
  const { projectKey, startTs = defaultStartTs } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    const results = await Pages.getUniqueHostUrlsForProject({ projectKey, startTs });
    return res.status(200).json({ results });
  });
}