import { runQueryIfUserHasAccess } from "@/lib/analyticQuerier";
import { LabTests } from "@/lib/data/labTests";

export default async (req, res) => {
  const { projectKey, urlHost, urlPath, limit = 50 } = req.query;
  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    const tests = await LabTests.getAll({ projectKey: 'undefined', urlHost, urlPath, limit });
    return res.status(200).json(tests);
  });
}