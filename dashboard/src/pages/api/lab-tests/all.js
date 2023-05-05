import { Validator } from "@/lib/queryValidator";
import { LabTests } from "@/lib/data/labTests";

export default async (req, res) => {
  const { projectKey, urlHost, urlPath, limit = 50 } = req.query;
  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    const tests = await LabTests.getAll({ projectKey, urlHost, urlPath, limit });
    return res.status(200).json(tests);
  });
}