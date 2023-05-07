import { Validator } from "@/lib/queryValidator";
import ResourcePerformanceEntries from "@/lib/data/resourcePerformanceEntries";

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { projectKey, urlHost, urlPath, startTs = defaultStartTs } = req.query;

  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    try {
      const records = await ResourcePerformanceEntries.getXHRResources({ projectKey, urlHost, urlPath, startTs });
      return res.status(200).json(records);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
}