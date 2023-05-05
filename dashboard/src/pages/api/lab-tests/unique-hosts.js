import { Validator } from "@/lib/queryValidator";
import { LabTests } from "@/lib/data/labTests";

export default async (req, res) => {
  const { projectKey } = req.query;
  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    const rows = await LabTests.getUniqueHosts({ projectKey });
    const hostArray = rows.map(({ url_host }) => url_host);
    res.status(200).json(hostArray);
  });
}