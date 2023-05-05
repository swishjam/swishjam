import { Validator } from "@/lib/queryValidator"
import { LargestContentfulPaintEntries } from "@/lib/data/largestContentfulPaintEntries"

export default async (req, res) => {
  const defaultStartTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const { 
    projectKey, 
    urlHost, 
    urlPath, 
    deviceTypes = JSON.stringify(['smartphone', 'phablet', 'tablet', 'desktop']), 
    startTs = defaultStartTs 
  } = req.query;

  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    const records = await LargestContentfulPaintEntries.getDistinctEntries({ 
      projectKey, 
      urlHost, 
      urlPath,
      deviceTypes: JSON.parse(deviceTypes), 
      startTs,
    });
    return res.status(200).json({ records });
  });
}