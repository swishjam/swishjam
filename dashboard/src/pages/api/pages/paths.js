import { Validator } from '@/lib/queryValidator';
import Pages from '@/lib/data/pages';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 14;
  const { organizationId, projectKey, urlHosts, startTs = defaultStartTs } = req.query;

  return await Validator.runQueryIfUserHasAccess({ req, res, organizationId, projectKey }, async () => {
    const results = await Pages.getUniquePathUrlsForProject({ projectKey, startTs, urlHosts: JSON.parse(urlHosts || '[]') });
    return res.status(200).json({ results });
  });
}