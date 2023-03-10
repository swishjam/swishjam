import { runQueryIfUserHasAccess } from "@/lib/analyticQuerier"
import { LargestContentfulPaintEntries } from "@/lib/data/largestContentfulPaintEntries"

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, urlHost, urlPath, startTs = defaultStartTs } = req.query;

  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    const records = await LargestContentfulPaintEntries.getDistinctEntries({ projectKey, urlHost, urlPath, startTs });
    return res.status(200).json({ records });
  });
}