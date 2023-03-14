import { runQueryIfUserHasAccess } from "@/lib/analyticQuerier";
import PageViews from "@/lib/data/pageViews";

export default async (req, res) => {
  const defaultTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, urlHost, urlPath, startTs = defaultTs } = req.query;

  await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const result = await PageViews.getCount({ projectKey, urlHost, urlPath, startTs })
      res.status(200).json({ count: result.count });
    } catch(err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
}