import { Validator } from "@/lib/queryValidator";
import { LabTests } from "@/lib/data/labTests";

export default async (req, res) => {
  const { projectKey, urlHost } = req.query;
  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    const rows = await LabTests.getUniquePaths({ projectKey, urlHost });
    const pathArray = rows.map(({ url_path }) => url_path);
    res.status(200).json(pathArray);
  });
}