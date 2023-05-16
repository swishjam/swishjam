import { Validator } from '@/lib/queryValidator';
import Pages from '@/lib/data/pages';

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 14;
  const { organizationId, projectKey, startTs = defaultStartTs } = req.query;

  return await Validator.runQueryIfUserHasAccess({ req, res, organizationId, projectKey }, async () => {
    const results = await Pages.getUniqueHostUrlsForProject({ projectKey, startTs });
    return res.status(200).json({ results });
  });
}